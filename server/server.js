// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.

var mongoose = require("mongoose")
var express = require("express")
var cors = require('cors')
var bcrypt = require('bcrypt')
var ExpressSession = require("express-session")
var SessionStore = require('connect-mongodb-session')(ExpressSession);
var keySecret = process.argv[2];



var server = express()
var MongoDB = "mongodb://127.0.0.1:27017/fake_so"
mongoose.connect(MongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

var Answer = require('./models/answers.js')
var Question = require('./models/questions.js')
var Tag = require('./models/tags.js')
var User = require("./models/user.js")
const answers = require("./models/answers.js")

var storageSessions = new SessionStore({
    uri: MongoDB,
    collection: "sessions"
})

storageSessions.on('error', function (error) {
    console.log(error);
})

server.use(ExpressSession({
    secret: keySecret,
    resave: false,
    saveUninitialized: false,
    store: storageSessions,
    cookie: {
        maxAge: 1000 * 60 * 60 * 8,
        httpOnly: true,
    }
}))
const ServerV = server.listen(8000, () => {
    console.log("Server is running on port 8000")
})

process.on("SIGINT", () => {
    ServerV.close(() => {
        console.log("Server closed. Database instance disconnected")
        process.exit(0)
    });


});


var verificationUser = async (req, res, next) => {
    if (req.session.verified === true) {
        let userCheck = await User.findOne({ email: req.session.user }).select('email').exec();
        if (userCheck) {

            next();
            return
        }
    }
    return res.send(false)
}

var verificationAdmin = async (req, res, next) => {
    if (req.session.verified === true) {
        if (req.session.user === "admin@gmail.com") {
            next();
            return
        }
        return res.send({ isAdmin: false })
    }
    else {
        return res.send({ isAdmin: null })
    }
}



server.use(cors({
    origin: true,
    credentials: true
}))
server.use(express.json())

// server.use((req, res, next) => {
//     console.log(req.protocol + '://' + req.get('host') + req.originalUrl)
//     next()
// })

server.post('/checkLogin', verificationUser, async (req, res) => {
    let name = await User.findOne({ email: req.session.user })
    res.send({ check: true, userID: name._id })
})



server.get('/questions', (req, res) => {
    let limit = req.query.tag
    if (limit !== undefined) {
        Question.find({ tags: { $in: JSON.parse(limit) } }).populate('tags').then(http => res.send(http))
        return
    }
    Question.find().populate('tags').populate('answers').populate('asked_by').then(http => res.send(http.reverse()))
})

server.post('/questionID', async (req, res) => {
    let questionSend = await Question.find({ _id: req.body.id }).populate('tags').exec()
    res.send(questionSend[0])
})

server.post('/questionDelete', async (req, res) => {

    let questions = await Question.findById(req.body.id).populate("answers", "_id").populate("comments", "_id").exec()
    let listOfId = []

    for (let x of questions.answers) {

        listOfId.push(x._id)
    }
    for (let x of questions.comments) {

        listOfId.push(x._id)
    }

    let answer = await Question.findOneAndDelete({ _id: req.body.id }).exec()

    for (let y of listOfId) {

        await Answer.findOneAndDelete({ _id: y }).exec()
    }

    res.send("Deleted")
})
server.get('/findQuestion', (req, res) => {
    Question.find({ _id: req.query._id }).populate('tags').populate('asked_by').then(http => res.send(http[0]))
})

server.get('/activeQuestions', async (req, res) => {
    let ret = [];
    await Question.find().populate('tags').populate('asked_by').then(res => ret = res)
    await Promise.all(
        ret.map(async q => {
            let max_date = 0
            await Answer.find({ _id: { $in: q.answers } }).then(res => {
                if (res.length !== 0) {
                    max_date = res[res.length - 1].ans_date_time.valueOf()
                }
            })
            return { q: q, date: max_date }
        })
    ).then(res => ret = res)
    ret.sort((a, b) => {
        if (a.date === b.date) {
            return a.q.ask_date_time.valueOf() - b.q.ask_date_time.valueOf()
        }
        return a.date - b.date
    })
    res.send(ret.reverse())
})

server.get('/unansQuestions', (req, res) => {
    Question.find({ answers: { $size: 0 } }).populate('tags').populate('asked_by').then(http => res.send(http.reverse()))
})

server.get('/tags', async (req, res) => {
    let mapping = await Tag
        .find()
        .then(tags => {
            return tags.map(async tag => {
                let num = 0;
                await Question.find({ tags: { $in: tag } }).then(res => num = res.length);
                return { tagData: tag, tagNum: num };
            })
        })
    Promise.all(mapping).then(http => res.send(http))
})

server.get('/addView', async (req, res) => {
    let q = await Question.find({ _id: req.query._id });
    q[0].views += 1;
    await q[0].save();
    res.send();
})

server.post('/answer', async (req, res) => {
    let question = await Question.find({ _id: req.body._id }).populate('answers').populate('tags').populate('asked_by')
    question[0].answers = await Answer.find({_id: question[0].answers}).populate('ans_by')
    if (req.body.edit === 1) {
        let first = []
        let second = []
        for (let ans of question[0].answers) {
            if (ans.ans_by.email === req.session.user) {
                first.push(ans)
            }
            else {
                second.push(ans)
            }
        }
        question[0].answers = second.concat(first)
    }
    res.send(question)
})

server.post('/lookAnswer', verificationAdmin, async (req, res) => {
    let question = await Question.find({ _id: req.body._id }).populate('answers').populate('tags').populate('asked_by')
    question[0].answers = await Answer.find({_id: question[0].answers}).populate('ans_by')
    if (req.body.edit === 1) {
        let first = []
        let second = []
        for (let ans of question[0].answers) {
            if (ans.ans_by.email === req.body.email) {
                first.push(ans)
            }
            else {
                second.push(ans)
            }
        }
        question[0].answers = second.concat(first)
    }
    res.send(question)
})


server.get('/tagOnly', (req, res) => {
    Tag.find().exec().then(http => res.send(http))
})

server.get('/userEmails', (req, res) => {
    User.find().select('email').exec().then(http => res.send(http))
})
server.get('/userNames', (req, res) => {
    User.find().select('username').exec().then(http => res.send(http))
})
server.post('/loginUser', async (req, res) => {

    let userLogin = await User.find({ email: req.body.email }).exec();
    if (userLogin.length === 0 || userLogin[0].email === undefined) {
        res.send("Unregistered Email")
    }
    else {
        checkingPass = await bcrypt.compare(req.body.password, userLogin[0].password);



        if (checkingPass === true) {
            req.session.verified = true;
            req.session.user = req.body.email;



        }

        res.send(checkingPass);
    }
});



server.post("/posts/tagAdd", verificationUser, async (req, res) => {
    try {
        let NewTagAdd = new Tag({
            name: req.body.name
        });
        let responseTag = await NewTagAdd.save();
        res.send(responseTag)
    } catch (err) {
        res.send(err)
    }
})
server.post('/addQuestion', verificationUser, async (req, res) => {
    let tags = req.body.tags
    let summaryT = req.body.summary
    let tagIds = []
    let Email = req.session.user
    let userCheck = await User.find({ email: Email }).exec();
    let userN = userCheck[0].username;
    let checkedPoints = userCheck[0].points
    for (let tag of tags) {
        let tagObj = await Tag.find({ name: tag }).exec();
        if (tagObj.length === 0) {
            if (checkedPoints < 50) {
                return res.send("Not Enough Points to Create New Tag")
            }
            let newTag = new Tag({ name: tag })
            await newTag.save()
            tagIds.push(newTag._id)
        }
        else {
            tagIds.push(tagObj[0]._id)
        }
    }
    let q = new Question({
        title: req.body.title,
        summary: summaryT,
        text: req.body.text,
        tags: tagIds,
        ask_date_time: req.body.ask_date_time,
        comments: []
    })
    if (userN !== undefined) {
        q.asked_by = userCheck[0]
    }


    q.save()
    res.send("Fulfilled")
})

server.post('/addAnswer', verificationUser, async (req, res) => {
    let Email = req.session.user
    let userCheck = await User.find({ email: Email }).exec();
    //let userN = userCheck[0].username;
    let a = new Answer({
        text: req.body.text,
        ans_by: userCheck[0],
        ans_date_time: req.body.ans_date_time,
        comments: []
    })
    await a.save()
    await Question.find({ _id: req.body.question }).then(res => {
        res[0].answers.push(a._id)
        res[0].save()
    })
    res.send("Fulfilled")
})

server.post('/addUser', async (req, res) => {
    let salt = await bcrypt.genSalt(10)
    passwordHash = await bcrypt.hash(req.body.Password, salt)
    let a = new User({
        username: req.body.UserName,
        email: req.body.Email,
        password: passwordHash,
        timeCreated: req.body.timeCreated,
        points: 0
    })
    await a.save()

    res.send("Fulfilled")
})


server.post("/LogUserOut", async (req, res) => {
    try {
        await storageSessions.destroy(req.sessionID)
        await req.session.destroy();
        res.clearCookie("connect.sid")
        res.send(true)
    } catch (err) {

        res.send(false)
    }

})

server.post("/user", verificationUser, async (req, res) => {
    let Email = req.session.user
    let UserInfo = await User.find({ email: Email }).exec();
    let qSendBack = await Question.find({ asked_by: UserInfo[0]._id }).exec();
    let tagsList = new Set();
    for (let q of qSendBack) {
        for (let tagID of q.tags)
            tagsList.add(tagID)
    }
    let userTags = await Tag.find({ _id: { $in: Array.from(tagsList) } }).exec()
    let createdTags = []
    for (let tag of userTags) {
        let num = await Question.find({ asked_by: UserInfo[0]._id, tags: tag });
        let tagModel = await Tag.find({ _id: tag })
        createdTags.push({ tagData: tagModel[0], tagNum: num.length })
    }
    let ret = { user: UserInfo[0], questions: qSendBack.reverse(), createdTags: createdTags }
    res.send(ret)
})

server.post("/lookUser", verificationAdmin, async (req, res) => {
    let UserInfo = await User.find({ email: req.body.email }).exec();
    let qSendBack = await Question.find({ asked_by: UserInfo[0]._id }).exec();
    let tagsList = new Set();
    for (let q of qSendBack) {
        for (let tagID of q.tags)
            tagsList.add(tagID)
    }
    let userTags = await Tag.find({ _id: { $in: Array.from(tagsList) } }).exec()
    let createdTags = []
    for (let tag of userTags) {
        let num = await Question.find({ asked_by: UserInfo[0]._id, tags: tag });
        let tagModel = await Tag.find({ _id: tag })
        createdTags.push({ tagData: tagModel[0], tagNum: num.length })
    }
    let ret = { user: UserInfo[0], questions: qSendBack.reverse(), createdTags: createdTags }
    res.send(ret)
})

server.post("/upvotingQuestion", verificationUser, async (req, res) => {
    let user = req.body.userInfo
    let userVoting = req.session.user
    let UserInfo = await User.find({ email: userVoting }).exec();
    let votingPoints = UserInfo[0].points

    if (votingPoints < 50) {
        res.send("Not Enough points")
    } else {
        let userPoint = await User.find({ _id: user._id }).exec()
        let currentPoints = userPoint[0].points + 5

        await User.findOneAndUpdate({ _id: userPoint[0]._id }, { $set: { points: currentPoints } })

        let questionVotes = await Question.find({ _id: req.body.questID }).exec();
        let addVotes = questionVotes[0].votes + 1
        await Question.findOneAndUpdate({ _id: req.body.questID }, { $set: { votes: addVotes } })
        res.send(true)
    }


})
server.post("/upvotingAnswer", verificationUser, async (req, res) => {
    let user = req.body.userInfo
    // let questionID = req.body.questID
    let userVoting = req.session.user
    let UserInfo = await User.find({ email: userVoting }).exec();
    let votingPoints = UserInfo[0].points

    if (votingPoints < 50) {
        res.send("Not Enough points")
    } else {
        let userPoint = await User.find({ _id: user._id }).exec()
        let currentPoints = userPoint[0].points + 5

        await User.findOneAndUpdate({ _id: userPoint[0]._id }, { $set: { points: currentPoints } })

        let questionVotes = await Answer.find({ _id: req.body.questID }).exec();
        let addVotes = questionVotes[0].votes + 1
        await Answer.findOneAndUpdate({ _id: req.body.questID }, { $set: { votes: addVotes } })
        res.send(true)
    }


})


server.post("/upvotingComment", verificationUser, async (req, res) => {

    let questionVotes = await Answer.find({ _id: req.body.questID }).exec();
    let addVotes = questionVotes[0].votes + 1
    await Answer.findOneAndUpdate({ _id: req.body.questID }, { $set: { votes: addVotes } })
    res.send(true)



})



server.post('/addComment', verificationUser, async (req, res) => {
    let Email = req.session.user
    let userCheck = await User.find({ email: Email }).exec();
    if (userCheck[0].points < 50) {
        return res.send("Not Enough Points to Create New Comment")
    }
    let a = new Answer({
        text: req.body.textD,
        ans_by: userCheck[0],
        ans_date_time: new Date(),
    })
    await a.save()
    if (req.body.typeAdd === true) {
        await Question.find({ _id: req.body.parentID }).then(res => {
            res[0].comments.push(a._id)
            res[0].save()
        })
    } else {
        await Answer.find({ _id: req.body.parentID }).then(res => {
            res[0].comments.push(a._id)
            res[0].save()
        })
    }
    res.send("Fulfilled")
})

server.get('/getComments', async (req, res) => {
    if (req.query.isQuestion === "true") {
        let resultingAnswer = await Question.find({ _id: req.query._id }).populate('comments')
        let comment = await Answer.find({_id: resultingAnswer[0].comments}).populate('ans_by')
        comment.reverse()
        res.send(comment)
    }
    else if (req.query.isQuestion === "false") {
        let resultingAnswer = await Answer.find({ _id: req.query._id }).populate('comments')
        let comment = await Answer.find({_id: resultingAnswer[0].comments}).populate('ans_by')
        comment.reverse()
        res.send(comment)
    }

})



server.post("/downvotingQuestion", verificationUser, async (req, res) => {
    let user = req.body.userInfo
    let userVoting = req.session.user
    let UserInfo = await User.find({ email: userVoting }).exec();
    let votingPoints = UserInfo[0].points

    if (votingPoints < 50) {
        res.send("Not Enough points")
    } else {
        let userPoint = await User.find({ _id: user._id }).exec()
        let currentPoints = userPoint[0].points - 10
        
        if (currentPoints <= 0) {
            currentPoints = 0
        }
        await User.findOneAndUpdate({ _id: userPoint[0]._id }, { $set: { points: currentPoints } })


        let questionVotes = await Question.find({ _id: req.body.questID }).exec();

        let addVotes = questionVotes[0].votes - 1
        await Question.findOneAndUpdate({ _id: req.body.questID }, { $set: { votes: addVotes } })
        res.send(true)
    }


})

server.post("/downvotingAnswer", verificationUser, async (req, res) => {
    let user = req.body.userInfo
    let userVoting = req.session.user
    let UserInfo = await User.find({ email: userVoting }).exec();
    let votingPoints = UserInfo[0].points

    if (votingPoints < 50) {
        res.send("Not Enough points")
    } else {
        let userPoint = await User.find({ _id: user._id }).exec()
        let currentPoints = userPoint[0].points - 10
        if (currentPoints <= 0) {
            currentPoints = 0
        }
        await User.findOneAndUpdate({ _id: userPoint[0]._id }, { $set: { points: currentPoints } })


        let questionVotes = await Answer.find({ _id: req.body.questID }).exec();

        let addVotes = questionVotes[0].votes - 1
        await Answer.findOneAndUpdate({ _id: req.body.questID }, { $set: { votes: addVotes } })
        res.send(true)
    }


})

server.post('/checkLoginComments', verificationUser, async (req, res) => {
    let userVoting = req.session.user
    let UserInfo = await User.find({ email: userVoting }).exec();
    let votingPoints = UserInfo[0].points

    if (votingPoints < 50) {
        res.send("Not Enough points")
    } else {
        res.send(true)
    }
})



server.post('/updateQuestion', verificationUser, async (req, res) => {
    let tags = req.body.tags
    let summaryT = req.body.summary
    let tagIds = []
    let questionID = req.body.id
    let Email = req.session.user
    let userCheck = await User.find({ email: Email }).exec();
    let checkedPoints = userCheck[0].points
    for (let tag of tags) {
        let tagObj = await Tag.find({ name: tag }).exec();
        if (tagObj.length === 0) {
            if (checkedPoints < 50) {
                return res.send("Not Enough Points to Create New Tag")
            }
            let newTag = new Tag({ name: tag })
            await newTag.save()
            tagIds.push(newTag._id)
        }
        else {
            tagIds.push(tagObj[0]._id)
        }
    }

    let updatingQuestion = {
        title: req.body.title,
        summary: summaryT,
        text: req.body.text,
        tags: tagIds,
    }
    await Question.findByIdAndUpdate(questionID, { $set: updatingQuestion })

    res.send("Fulfilled")
})



server.post('/updateAnswer', verificationUser, async (req, res) => {
    let questionID = req.body.id
    let Email = req.session.user




    let updatingQuestion = {
        text: req.body.text,
    }
    let Uanswer = await Answer.findByIdAndUpdate(questionID, { $set: updatingQuestion })

    res.send("Fulfilled")
})
server.post('/updateTag', verificationUser, async (req, res) => {
    let tagId = req.body.parentID
    let number = req.body.number
    let newId;
    let numberOfquestions = await Question.find({ tags: tagId }).exec()
    if (numberOfquestions.length === number) {
        let checkingDup = await Tag.findOne({ name: req.body.text }).exec()
        if (checkingDup !== null) {
            newId = checkingDup._id
            await Question.updateMany({ tags: tagId }, { $addToSet: { tags: newId } })
            await Question.updateMany({ tags: tagId }, { $pull: { tags: tagId } })
            await Tag.findOneAndDelete({ _id: tagId }).exec()
        } else {
            await Tag.findOneAndUpdate({ _id: tagId }, { $set: { name: req.body.text } })
        }

        res.send("updated")
    } else {
        res.send("Not allowed to update - Not only user")
    }


})

server.post('/deleteTag', verificationUser, async (req, res) => {
    let tagId = req.body.parentID
    let number = req.body.number
    let numberOfquestions = await Question.find({ tags: tagId }).exec()
    if (numberOfquestions.length === number) {
        await Tag.findOneAndDelete({ _id: tagId }).exec()
        await Question.updateMany({ tags: tagId }, { $pull: { tags: tagId } })
        res.send("Tag Deleted")
    } else {
        res.send("Not allowed to update - Not only user")
    }


})


server.post('/answerDelete', async (req, res) => {
    let questions = await Answer.findById(req.body.id).populate("comments", "_id").exec()
    let listOfId = []

    for (let x of questions.comments) {

        listOfId.push(x._id)
    }


    let answer = await Answer.findOneAndDelete({ _id: req.body.id }).exec()

    for (let y of listOfId) {

        await Answer.findOneAndDelete({ _id: y }).exec()
    }

    res.send("Deleted")
})

server.post('/answeredQuestions', async (req, res) => {
    let UserInfo = await User.find({ email: req.session.user }).exec();
    let user = UserInfo[0]

    let answeredQ = await Answer.find({ ans_by: user._id })

    answeredQ = await Question.find({ answers: { $in: answeredQ } }).populate('tags')
    answeredQ.reverse()
    res.send(answeredQ)
})

server.post('/lookAnsweredQuestions', verificationAdmin, async (req, res) => {
    let answeredQ = await Answer.find({ ans_by: req.body._id })
    answeredQ = await Question.find({ answers: { $in: answeredQ } }).populate('tags')
    for (let x = 0; x < answeredQ.length; x++) {
        answeredQ[x].answers = await Answer.find({_id:answeredQ[x].answers}).populate('ans_by')
    }
    answeredQ.reverse()
    res.send(answeredQ)
})


server.post("/adminUsers", verificationAdmin, async (req, res) => {
    let users = await User.find().exec();
    res.send({ isAdmin: true, users: users })
})

server.post("/deleteUser", verificationAdmin, async (req, res) => {
    await Question.deleteMany({ asked_by: req.body.userID }).exec();
    await Answer.deleteMany({ ans_by: req.body.userID }).exec();
    await User.deleteOne({ _id: req.body.userID }).exec();
    res.send("Execute Order 66")
})