// import { renderActionsCell } from '@mui/x-data-grid';
import QuestionPage from './questionpage.js'
import { useState, useEffect } from 'react'
import AskQuestionPage from './PostQuestion.js'
import AnswerPage from './answerpage.js'
import PostAnswer from './PostAnswer.js'
import TagPage from './tagpage.js'
import RegisterUserPage from './registerPage.js'
import * as helper from './helper.js'
import axios from 'axios'
import WelcomePage from './welcomePage.js'
import LoginPage from './loginPage.js'
import ProfilePage from './profilePage.js'
import EditQuestionPage from './backupQuestionPage.js'
import EditAnswerPage from './backupAnswerPage.js'




export default function PageOutline() {
  const [currentPage, setPage] = useState({ page: 0 })
  const [questionList, setQuestions] = useState([])
  const [tagsList, setTagsList] = useState([])
  const [questionBit, setQuestionBit] = useState(1)
  const [tagsBit, setTagsBit] = useState(1)
  const [start, setStart] = useState(0)
  const [userID, setUserID] = useState(null)
  const [isAdmin, setAdmin] = useState(false)
  const [dummyUser, setDummyUser] = useState(null)
  useEffect(() => {
    try {
      (() => axios.get('http://localhost:8000/tagOnly').then(res => setTagsList(res.data)))()
    } catch (error) {
      window.alert("Server Error")
    }
  }, [tagsBit]);
  useEffect(() => {
    try {
      (() => axios.get('http://localhost:8000/questions').then(res => setQuestions(res.data)))();
      (() => axios.post('http://localhost:8000/checkLogin', {}, { withCredentials: true }).then(res => { if (res.data.check === true) { setUserID(res.data.userID); setStart(-1) } }))();
      (() => axios.post('http://localhost:8000/adminUsers', {}, { withCredentials: true }).then(res => { setAdmin(res.data.isAdmin) }))();
    } catch (error) {
      window.alert("Server Error")
    }
  }, [start])


  if (start !== -1) {
    switch (start) {
      case 0:
        return <WelcomePage setStart={setStart} />
      case 1:
        return <RegisterUserPage setStart={setStart} />
      case 2:
        return <LoginPage setStart={setStart} />
      default:
      //nothing
    }
  }

  return (
    <div className="full-page">
      <PageHeader setPage={setPage} tagsList={tagsList} setAdmin={setAdmin} setDummyUser={setDummyUser} questionList={questionList} setQuestions={setQuestions} questionBit={questionBit} setQuestionBit={setQuestionBit} start={start} setStart={setStart} setUserID={setUserID} />
      <PageBody isAdmin={isAdmin} setAdmin={setAdmin} dummyUser={dummyUser} setDummyUser={setDummyUser} currentPage={currentPage} setPage={setPage} tagsList={tagsList} questionList={questionList} setQuestions={setQuestions} questionBit={questionBit} setQuestionBit={setQuestionBit} tagsBit={tagsBit} setTagsBit={setTagsBit} userID={userID} />
    </div>
  );
}


async function logOut(stringVal, setStart, setPage, setUserID, setAdmin, setDummyUser) {
  try {
    if (stringVal === "Sign In") {
      setPage({ page: 0 })
      setStart(0)
    } else {
      let loginOut = await axios.post('http://localhost:8000/LogUserOut', {}, { withCredentials: true })
      // depending on the response back it would do error cases or just go back to question page
      if (loginOut.data === false) {
        window.alert("Issue Logging Out")
      } else {
        setUserID(null)
        setAdmin(false)
        setDummyUser(false)
        setPage({ page: 0 })
        setStart(0)
      }


    }
  }
  catch (error) {
    window.alert("Server Error")
  }
}

function PageHeader({ tagsList, questionList, setPage, setQuestions, start, setStart, setUserID, setAdmin, setDummyUser }) {
  let leftButton = "Sign In"
  if (start === -1) {
    leftButton = "Log Out"
  }
  return (
    <div className="header">
      <span className="filler">
        <div className="ask-question-bottom-left welcomeBack" onClick={() => logOut(leftButton, setStart, setPage, setUserID, setAdmin, setDummyUser)}>
          {leftButton}
        </div>
      </span>
      <span className="filler">
        <h1 className="title">Fake Stack Overflow</h1>
      </span>
      <span className="filler">
        <input type="text" id="searchBar" className="searchbar" onKeyDown={(e) => helper.searching(e.key, e.target.value, tagsList, questionList, setPage, setQuestions)} placeholder="Search..." />
      </span>
    </div>
  );
}

function PageBody(props) {
  let topBar = { "backgroundColor": "white" }
  let middleBar = { "backgroundColor": "white" }
  let bottomBar = { "backgroundColor": "white" }
  switch (props.currentPage.page) {
    case 0:
      topBar = { "backgroundColor": "#D3D3D3" }
      break;
    case 1:
      middleBar = { "backgroundColor": "#D3D3D3" }
      break;
    case 5:
      bottomBar = { "backgroundColor": "#D3D3D3" }
      break;
    default:
    //nothing
  }
  return (
    <div className="main">
      <div className="navbar">
        <span className="navbar-filler"></span>
        <div style={topBar} onClick={() => { helper.sortNewest(props.setQuestions); props.setPage({ page: 0 }) }} id="question-button" className="navbar-item">Questions</div>
        <div style={middleBar} onClick={() => { props.setTagsBit(props.tagsBit); props.setPage({ page: 1 }) }} id="tag-button" className="navbar-item">Tags</div>
        {(!props.isAdmin && props.userID === null) ? <></> : <div style={bottomBar} onClick={() => { props.setPage({ page: 5 }) }} id="tag-button" className="navbar-item">Profile</div>}
      </div>
      <div id="main-content" className="main-content">
        <MainContent {...props} />
      </div>
    </div>
  );
}

function MainContent(props) {
  const [questionAndAnswer, setQuestionAndAnswer] = useState(null)
  const [answersBit, setAnswersBit] = useState(0)
  const [editQuestion, setEditQuestion] = useState(null)
  switch (props.currentPage.page) {
    case 0:
      return <QuestionPage {...props} setQuestionAndAnswer={setQuestionAndAnswer} />
    case 1:
      return <TagPage {...props} />
    case 2:
      return <AnswerPage {...props} setQuestionAndAnswer={setQuestionAndAnswer} questionAndAnswer={questionAndAnswer} />
    case 3:
      return <AskQuestionPage {...props} />
    case 4:
      return <PostAnswer {...props} currentQuestion={questionAndAnswer} answersBit={answersBit} setAnswersBit={setAnswersBit} />
    case 5:
      return <ProfilePage {...props} setEditQuestion={setEditQuestion} />
    case 6:
      return <EditQuestionPage {...props} editQuestion={editQuestion} />
    case 7:
      //reusing tag page, this is for created tags
      return <TagPage {...props} />
    case 8:
      //reusing to change title
      return <QuestionPage {...props} setQuestionAndAnswer={setQuestionAndAnswer} />
    case 9:
      return <QuestionPage {...props} setQuestionAndAnswer={setQuestionAndAnswer} />
    case 10:
      return <AnswerPage {...props} setQuestionAndAnswer={setQuestionAndAnswer} questionAndAnswer={questionAndAnswer} />
    case 11:
      return <EditAnswerPage answersBit={answersBit} setAnswersBit={setAnswersBit} {...props} />
    case 12:
      //admin page
      return <ProfilePage {...props} setEditQuestion={setEditQuestion} />
    default:
      return null
  }
}