// Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.
// Run this script to test your schema
// Start the mongoDB service as a background process before running the script
// Pass URL of your mongoDB instance as first argument(e.g., mongodb://127.0.0.1:27017/fake_so)
let adminUserName = process.argv[2];
let adminPassword = process.argv[3];
let bcrypt2 = require('bcrypt')
let mongoDB = "mongodb://127.0.0.1:27017/fake_so"
// mongoose.connect(MongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

let Answer = require('./models/answers.js')
let Question = require('./models/questions.js')
let Tag = require('./models/tags.js')
let User = require("./models/user.js")
let adminEmail = "admin@gmail.com"

let mongoose = require('mongoose');

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

let databaseServer = mongoose.connection;
databaseServer.on('error', console.error.bind(console, 'MongoDB connection error:'));


async function createAdmin(adminEmail, adminUserName, adminPassword) {
    let salt = await bcrypt2.genSalt(10)
    passwordHash = await bcrypt2.hash(adminPassword, salt)
    let Admin = {
        username: adminUserName.toLowerCase(),
        email: adminEmail.toLowerCase(),
        password: passwordHash,
        points: 1000,
        timeCreated: new Date()

    }


    let admin = new User(Admin);
    return admin.save();
}

async function createUser(email, username, password) {
    let salt = await bcrypt2.genSalt(10)
    passwordHash = await bcrypt2.hash(password, salt)
    let user = {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: passwordHash,
        points: 50,
        timeCreated: new Date()

    }


    let newUser = new User(user);
    return newUser.save();
    // return username.toLowerCase();
}

function createQuestion(title, summary, text, tags, answers, asked_by, views, votes, comments) {
    let question = {
        title: title,
        summary: summary,
        text: text,
        tags: tags,
        answers: answers,
        asked_by: asked_by,
        views: views,
        votes: votes,
        ask_date_time: new Date(),
        comments: comments

    }


    let newQuestion = new Question(question);
    return newQuestion.save();
}

function createTag(name) {
    let tag = {
        name: name,

    }


    let newTag = new Tag(tag);
    return newTag.save();
}

function createAnswer(text, asked_by, votes, comments) {
    let answer = {
        text: text,
        ans_by: asked_by,
        votes: votes,
        ask_date_time: new Date(),
        comments: comments

    }


    let newAnswer = new Answer(answer);
    return newAnswer.save();
}

function createComment(text, asked_by, votes) {
    let comment = {
        text: text,
        ans_by: asked_by,
        votes: votes,
        ask_date_time: new Date(),
        comments: []

    }


    let newcomment = new Answer(comment);
    return newcomment.save();
}




const baseData = async () => {
    let dataT = await createTag("data")
    let cssT = await createTag("CSS")
    let HTMLT = await createTag("HTML")
    let mongoT = await createTag("mongo")
    let serverT = await createTag("Server")
    let admin = await createAdmin("admin@gmail.com", adminUserName, adminPassword)
    let user1 = await createUser("cs@gmail.com", "Ghost", "Gtr")
    let user2 = await createUser("marvel@gmail.com", "Apex", "legends?")
    let user3 = await createUser("gaming@gmail.com", "Redline", "rpm123")
    let comment1 = await createComment("This is a great question.", user1, 2)
    let comment2 = await createComment("I don't understand.", user2, 0)
    let comment3 = await createComment("This is interesting.", user2, 4)
    let comment4 = await createComment("This is a great question.", user1, 2)
    let comment5 = await createComment("Upvote this.", user3, 4)
    let comment6 = await createComment("Thanks for the help.", user3, 1)
    let answerG1 = await createAnswer("In order to center the div, you need to first learn about html and css", user1, 0, [comment2, comment6])
    let answerG2 = await createAnswer("This code has errors. You need to change the display field in the css for the element", user1, 0, [comment4])
    let answerA1 = await createAnswer("Need to have the right url for your database to connect to", user2, 0, [comment5, comment3])
    let answerA2 = await createAnswer("The parameter you pass in order are being accessed in the wrong order", user2, 0, [])
    let answerR1 = await createAnswer("Make sure all libraries that are being used are installed", user3, 0, [comment1])
    await createQuestion("Issues with server", "Error states mongoose is unknown", "Everytime I run the code, even though mongoose is required at the top, I can't seem to get the compiler to see mongoose, Please help!", [mongoT, serverT], [answerR1], user1, 10, 0, [comment4, comment5])
    await createQuestion("Center Div", "Don't know how to center dev", "I tried everything to try to center this div, but nothing seems to work: Any suggestions!", [cssT, HTMLT], [answerG1, answerG2], user3, 2, 0, [])
    await createQuestion("Add data to server", "Issue with adding data to server", "I am using the template my professor gave to create the server, however for some reason it is unable to connect. I have the code the same as the professor, but not sure why it has issues.", [dataT, mongoT, serverT], [answerA1, answerA2], user3, 30, 0, [comment6])



    if (databaseServer) {
        databaseServer.close();
    }

    console.log('Uploaded Data');
}

baseData()
    .catch((err) => {
        console.log('ERROR: ' + err);
        if (databaseServer) databaseServer.close();
    });


