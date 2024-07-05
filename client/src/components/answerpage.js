import { getTimeString } from './helper.js'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { validHyperLink } from './commonPageComponents';

//isQuestion is a bool used on serverside to know which collection to search through
//parentComment contains the model object from db
//text area below is where the comment is written
//xor setCommentBit with 1 everytime a new valid comment is written
//Upvote 'button' is there, not linked

async function upvotingComments(comment, setCommentBit, commentBit) {
    (async () => {
        try {
        let answer = await axios.post('http://localhost:8000/upvotingComment', { questID: comment._id, userInfo: comment.asked_by }, { withCredentials: true })
        if (answer.data === false) {
            window.alert("Unable to upvote")
        }
        setCommentBit(commentBit ^ 1);
        } catch (error) {
            window.alert("Server Error")
        }
    })()
}


function Comments({ parentComment, isQuestion, ...props }) {
    const [comments, setComments] = useState([])
    const [commentBit, setCommentBit] = useState(0)
    const [pageNum, setPageNum] = useState(0)
    const [commentSlice, setCommentSlice] = useState([])
    const [inputValue, setInputValue] = useState("")
    useEffect(() => {
        const comment = async () => {
            try {
            const commentR = await axios.get('http://localhost:8000/getComments', {
                params: {
                    _id: parentComment._id,
                    isQuestion: isQuestion
                }
            });
            setComments(commentR.data);

            } catch (error) {
                window.alert("Server Error")
            }
            // Handle the received comments data here
            // } catch (error) {
            //     console.error('Error fetching comments:', error);
            // }
        };

        comment();
        setPageNum(0);
    }, [commentBit, parentComment._id, isQuestion]);
    useEffect(() => {
        setCommentSlice(comments.slice(pageNum * 3, (pageNum + 1) * 3));
    }, [pageNum, comments])
    function createComment(event, parent, choice, text, setInputValue) {

        (async () => {
            if (event === "Enter") {
                try {
                    let writing = text.trim()
                    // const AnswerText = props.info[0].trim()
                    let validHyper = validHyperLink(writing)
                    let validUser = await axios.post('http://localhost:8000/checkLoginComments', {}, { withCredentials: true })
                    if (validUser.data === false) {
                        window.alert("Login To Comment!")
                    } else if (validHyper === false) {
                        window.alert("Not Valid HyperLink!")
                    }
                    else if (writing.length > 140) {
                        window.alert("Cannot be More Than 140 Characters!")
                    }
                    else {
                        let commentReturn = await axios.post('http://localhost:8000/addComment', { parentID: parent._id, typeAdd: choice, textD: text }, { withCredentials: true })
                        if (commentReturn.data === "Not Enough Points to Create New Comment") {
                            window.alert("Not Enough Points to Create New Comment")
                        }
                        else if (commentReturn.data === "Fulfilled") {
                            setCommentBit(commentBit ^ 1)
                            setInputValue("")
                        }
                    }
                } catch (error) {
                    window.alert("Server Error")
                }
            }

        })()
    }
    return (
        <div>
            Comments
            {commentSlice.map(comment => {
                return (
                    <div key={comment._id} className="comment-grid">
                        <div>
                            <span>
                                {comment.votes} Votes
                            </span>
                            {(!props.isAdmin && props.userID === null) ? <></> :
                                <span onClick={() => { upvotingComments(comment, setCommentBit, commentBit) }} className="main-content-askQuestion">
                                    Upvote
                                </span>
                            }
                        </div>
                        <div>
                            {comment.text}
                        </div>
                        <div>
                            <div> {comment.ans_by.username} </div>
                            <div> answered{getTimeString(comment.ans_date_time)} </div>
                        </div>

                    </div>
                )
            })}
            <div className="comment-bottom">
                <span>
                    {(!props.isAdmin && props.userID === null) ? <></> :
                        <input className="nice-tidy-box" value={inputValue} onKeyDown={(e) => createComment(e.key, parentComment, isQuestion, e.target.value, setInputValue)} onChange={e => setInputValue(e.target.value)} />
                    }
                </span>
                <span>
                    <span onClick={() => { if (pageNum > 0) { setPageNum(pageNum - 1) } }} className="smaller-button answer-question-button">
                        Prev Page
                    </span>
                    <span>
                        Page {pageNum + 1}
                    </span>
                    <span onClick={() => {
                        if ((pageNum + 1) * 3 < comments.length) {
                            setPageNum(pageNum + 1)
                        }
                        else {
                            setPageNum(0)
                        }
                    }} className="smaller-button answer-question-button">
                        Next Page
                    </span>
                </span>
            </div>
        </div>
    )
}



function Answers({ allAnswers, pageNum, voteBit, setVoteBit, ...props }) {
    const [ans, setAns] = useState([])
    useEffect(() => {
        setAns(allAnswers.slice(pageNum * 5, (pageNum + 1) * 5));
    }, [allAnswers, pageNum]);
    return (
        ans.map(answer => {
            return (
                <div key={answer._id} className="main-content-border" onClick={() => {
                    if (props.currentPage.page === 10 && ((props.userID === answer.ans_by._id && props.dummyUser === null) || (props.isAdmin && props.dummyUser.user._id === answer.ans_by._id)) ) {
                        props.setPage({ page: 11, answerObj: answer })
                    }
                }}>
                    <h3>
                        {(() => {
                            if (props.currentPage.page === 10 && ((props.userID === answer.ans_by._id && props.dummyUser === null) || (props.isAdmin && props.dummyUser.user._id === answer.ans_by._id))) {
                                return "You can edit this answer by clicking on it"
                            }
                        })()}
                    </h3>
                    <div className="question-answer-answer">
                        <div>
                            <div>
                                {answer.votes} 
                            </div> 
                            <div>
                                Votes
                            </div>
                        </div>
                        <div className="question-col-votes">
                        {(!props.isAdmin && props.userID === null) ? <></> :
                            <>
                                <span onClick={() => upvotingAns(answer, voteBit, setVoteBit)} className="main-content-askQuestion">Upvote</span>
                                <span onClick={() => downvotingAns(answer, voteBit, setVoteBit)} className="main-content-askQuestion">Downvote</span>
                            </>
                        }
                        </div>
                        <span className="question-answer-subitems question-answer-comment">
                            {addHyperLink(answer.text)}
                        </span>
                        <span className="question-answer-to-bottom">
                            <div className="question-answer-subitems user-color-2">
                                {answer.ans_by.username}
                            </div>
                            <div className="question-answer-subitems">
                                answered{getTimeString(answer.ans_date_time)}
                            </div>
                        </span>
                    </div>
                    <div className="question-answer-answer">
                        <div></div><div></div>
                        <Comments parentComment={answer} isQuestion={false} {...props} />
                    </div>
                </div>
            );
        })
    );
}

function addHyperLink(rawText) {
    let regexSplit = RegExp(/(\[.+\]\(https?:\/\/.+\))/)
    let regexExtract = RegExp(/\[(?<highlightedWord>.+)\]\((?<linkToTab>https?:\/\/.+)\)/)
    let words = rawText.split(regexSplit)
    return (
        words.map(word => {
            let matching = word.match(regexExtract)
            if (matching !== null) {
                return <a key={word} href={matching.groups["linkToTab"]} rel="noreferrer" target="_blank">{matching.groups["highlightedWord"]}</a>
            }
            return word
        })
    )
}

function upvoting(questionAndAnswer, voteBit, setVoteBit) {
    (async () => {
        try {
            let answer = await axios.post('http://localhost:8000/upvotingQuestion', { questID: questionAndAnswer._id, userInfo: questionAndAnswer.asked_by }, { withCredentials: true })
            if (answer.data === "Not Enough points") {
                window.alert("Not Enough points")
            } else if (answer.data === false) {
                window.alert("Unable to upvote")
            }
            setVoteBit(voteBit ^ 1)
        } catch (error) {
            window.alert("Server Error")
        }
    })()
}

function downvoting(questionAndAnswer, voteBit, setVoteBit) {
    (async () => {
        try {
            let answer = await axios.post('http://localhost:8000/downvotingQuestion', { questID: questionAndAnswer._id, userInfo: questionAndAnswer.asked_by }, { withCredentials: true })
            if (answer.data === "Not Enough points") {
                window.alert("Not Enough points")
            } else if (answer.data === false) {
                window.alert("Unable to upvote")
            }
            setVoteBit(voteBit ^ 1)
        } catch (error) {
            window.alert("Server Error")
        }
    })()
}

function upvotingAns(AnswerData, voteBit, setVoteBit) {
    (async () => {
        try {
            let answer = await axios.post('http://localhost:8000/upvotingAnswer', { questID: AnswerData._id, userInfo: AnswerData.ans_by }, { withCredentials: true })
            if (answer.data === "Not Enough points") {
                window.alert("Not Enough points")
            } else if (answer.data === false) {
                window.alert("Unable to upvote")
            }
            setVoteBit(voteBit ^ 1)
        } catch (error) {
            window.alert("Server Error")
        }
    })()
}

function downvotingAns(AnswerData, voteBit, setVoteBit) {
    (async () => {
        try {
            let answer = await axios.post('http://localhost:8000/downvotingAnswer', { questID: AnswerData._id, userInfo: AnswerData.ans_by }, { withCredentials: true })
            if (answer.data === "Not Enough points") {
                window.alert("Not Enough points")
            } else if (answer.data === false) {
                window.alert("Unable to upvote")
            }
            setVoteBit(voteBit ^ 1)
        } catch (error) {
            window.alert("Server Error")
        }
    })()
}

export default function AnswerPage({ questionAndAnswer, setQuestionAndAnswer, setPage, ...props }) {
    const [pageNum, setPageNum] = useState(0)
    const [voteBit, setVoteBit] = useState(0)
    useEffect(() => {
        try {
            let edit_1 = 0
            if (props.currentPage.page === 10)
                edit_1 = 1
            if (props.isAdmin === true && props.currentPage.page === 10) {
                axios.post('http://localhost:8000/lookAnswer', { _id: questionAndAnswer._id, edit: edit_1, email: props.dummyUser.user.email }, { withCredentials: true }).then(res => { res.data[0].answers.reverse(); setQuestionAndAnswer(res.data[0]);});
            }
            else {
                axios.post('http://localhost:8000/answer', { _id: questionAndAnswer._id, edit: edit_1 }, { withCredentials: true }).then(res => { res.data[0].answers.reverse(); setQuestionAndAnswer(res.data[0]);});
            }
        } catch (error) {
            window.alert("Server Error")
        }
    }, [props.answersBit, questionAndAnswer._id, setQuestionAndAnswer, voteBit, props.currentPage.page, props.currentPage, props.dummyUser, props.isAdmin])
    return (
        <>
            <div className="question-answer-header main-content-border">
                <div className="question-answer-header-top">
                    <span className="question-answer-info question-answer-subitems bold-element">
                        <span>{questionAndAnswer.answers.length} answers</span>
                        <span>{questionAndAnswer.views} views</span>
                        <span>{questionAndAnswer.votes} votes</span>
                    </span>
                    <span className="question-answer-items bold-element">
                        <div>
                            {questionAndAnswer.title}
                        </div>
                        <div className="littler-text-2">
                            {addHyperLink(questionAndAnswer.summary)}
                        </div>
                    </span>
                    <span>
                        {(!props.isAdmin && props.userID === null) ? <></> :
                            <span onClick={() => setPage({ page: 3 })} id="ask-question" className="question-answer-ask-question main-content-askQuestion question-answer-items">
                                Ask Question
                            </span>
                        }
                    </span>
                    <div className="question-tags">
                        <div className="bottom-margin">
                            {(!props.isAdmin && props.userID === null) ? <></> :
                                <>
                                    <span onClick={() => upvoting(questionAndAnswer, voteBit, setVoteBit)} className="main-content-askQuestion">Upvote</span>
                                    <span onClick={() => downvoting(questionAndAnswer, voteBit, setVoteBit)} className="main-content-askQuestion">Downvote</span>
                                </>
                            }
                        </div>
                        <div>
                            Tags: {(() => {
                                let arr = []
                                for (let x of questionAndAnswer.tags) {
                                    arr.push(x.name)
                                }
                                return arr.join(", ")
                            })()}
                        </div>

                    </div>
                    <span className="question-answer-subitems">
                        {addHyperLink(questionAndAnswer.text)}
                    </span>
                    <span className="question-answer-to-bottom">
                        <div className="question-answer-subitems user-color">
                            {questionAndAnswer.asked_by.username}
                        </div>
                        <div className="question-answer-subitems">
                            asked{getTimeString(questionAndAnswer.ask_date_time)}
                        </div>
                    </span>
                    <div></div>
                    <Comments parentComment={questionAndAnswer} isQuestion={true} {...props} />
                </div>
            </div>
            <div className="answer-box">
                <Answers allAnswers={questionAndAnswer.answers} pageNum={pageNum} setPageNum={setPageNum} voteBit={voteBit} setVoteBit={setVoteBit} setPage={setPage} questionAndAnswer={questionAndAnswer} {...props} />
            </div>
            <div className="answer-question-div button-flexy">
                <span onClick={() => setPage({ page: 4 })} id="answer-question" className="answer-question-button">
                    Answer Question
                </span>
                <span>
                    <span onClick={() => { if (pageNum > 0) { setPageNum(pageNum - 1) } }} className="smaller-button answer-question-button">
                        Prev Page
                    </span>
                    <span>
                        Page {pageNum + 1}
                    </span>
                    <span onClick={() => {
                        if ((pageNum + 1) * 5 < questionAndAnswer.answers.length) {
                            setPageNum(pageNum + 1)
                        }
                        else {
                            setPageNum(0)
                        }
                    }} className="smaller-button answer-question-button">
                        Next Page
                    </span>
                </span>
            </div>
        </>
    );
}