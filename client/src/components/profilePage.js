import axios from 'axios'
import { useState, useEffect } from 'react'
import { getTimeString, getTimeString_Day } from './helper.js'

export default function UserProfile(props) {
    const [userObj, setUserObj] = useState(null)
    const [admin, setAdmin] = useState(null)
    const [refresh, setRefresh] = useState(0)
    useEffect(() => {
        try {
            (async () => {
                if (props.currentPage.page === 5) {
                    await axios.post('http://localhost:8000/adminUsers', {}, { withCredentials: true }).then(http => setAdmin(http.data))
                    await axios.post('http://localhost:8000/user', {}, { withCredentials: true }).then(http => setUserObj(http.data))
                    props.setDummyUser(null)
                }
            })()
        } catch (error) {
            window.alert("Server Error")
        }
    }, [refresh, props.currentPage.page, props])
    let place_1 = "User"
    let place_2 = "a user"
    if (userObj === null) {
        return
    }
    if (admin.isAdmin) {
        if (props.dummyUser === null) {
            place_1 = "Admin"
            place_2 = "an admin"
        }
    }
    return (
        <div className="profile-box">
            <h1>
                {place_1} Profile
            </h1>
            <h2>
                Congrats {userObj.user.username}, you have been {place_2} since: {getTimeString_Day(userObj.user.timeCreated)}
            </h2>
            <h2>
                Reputation: {userObj.user.points}
            </h2>
            <ProfileContent userObj={userObj} setUserObj={setUserObj} admin={admin} setAdmin={setAdmin} refresh={refresh} setRefresh={setRefresh} {...props} />
        </div>
    );

}

function ProfileContent(props) {

    if (props.admin === null) {
        return
    }
    if (props.admin.isAdmin && props.dummyUser === null) {
        return (
            props.admin.users.map(user => {
                return (
                    <div key={user._id} className="admin-profile">
                        <div className="admin-profile-content" onClick={async () => {
                            try {
                                let http = await axios.post('http://localhost:8000/lookUser', { email: user.email }, { withCredentials: true })
                                props.setPage({ page: 12 })
                                props.setDummyUser(http.data)
                                props.setUserObj(http.data)
                            } catch (error) {
                                window.alert("Server Error")
                            }
                        }}>
                            <div>
                                Username: {user.username}
                            </div>
                            <div>
                                Email: {user.email}
                            </div>
                            <div>
                                Reputation: {user.points}
                            </div>
                            <div>
                                Creation Date: {getTimeString_Day(user.timeCreated)}
                            </div>
                        </div>
                        <div className="main-content-askQuestion" onClick={async () => {
                            if (user.email === "admin@gmail.com") {
                                window.alert("Cannot Delete Admin")
                            }
                            else {
                                if (window.confirm("Are You Sure?")) {
                                    try {
                                        await axios.post('http://localhost:8000/deleteUser', { userID: user._id }, { withCredentials: true })
                                        props.setRefresh(props.refresh ^ 1)
                                    } catch (error) {
                                        window.alert("Server Error")
                                    }
                                }
                            }
                        }}>
                            Delete
                        </div>
                    </div>
                )
            })
        )
    }
    return (
        <>
            <div className="profile-button-box">
                <div></div>
                <span className="answer-question-button" onClick={() => {
                    props.setPage({ page: 7 })
                }}>
                    Created Tags
                </span>
                <span className="answer-question-button" onClick={async () => {
                    try {
                        if (props.currentPage.page === 5)
                            await axios.post('http://localhost:8000/answeredQuestions', {}, { withCredentials: true }).then(http => props.setQuestions(http.data))
                        if (props.currentPage.page === 12)
                            await axios.post('http://localhost:8000/lookAnsweredQuestions', { _id: props.dummyUser.user._id }, { withCredentials: true }).then(http => props.setQuestions(http.data))
                        props.setPage({ page: 9 })
                    } catch (error) {
                        window.alert("Server Error")
                    }
                }}>
                    Answered Questions
                </span>
            </div>
            <QuestionList questions={props.userObj.questions} {...props} />
        </>
    )
}

function QuestionList({ questions, ...props }) {
    if (questions.length === 0)
        return (
            <div className="no-question-found">
                No Questions Asked
            </div>
        );
    return (
        questions.map((question, index) => {
            return (
                <div key={question._id + index} className="profile-question-box" onClick={async () => {
                    try {
                        await axios.get('http://localhost:8000/findQuestion', { params: { _id: question._id } }).then(http => props.setEditQuestion(http.data))
                        props.setPage({ page: 6 });
                    } catch (error) {
                        window.alert("Server Error")
                    }
                }}>
                    <div className="question-title">
                        {question.title}
                    </div>
                    <span>
                        {getTimeString(question.ask_date_time)}
                    </span>
                </div>
            )
        })
    );
}
