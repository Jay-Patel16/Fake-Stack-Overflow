import * as helper from './helper.js'
import axios from 'axios'
import { useEffect, useState } from 'react'

function QuestionHeader({ setState, setPage, questionList, title, ...props }) {
    return (
        <div className="main-content-header main-content-border">
            <div className="main-content-header-container">
                <div className="main-content-header-items">{title}</div>
                <div className="text-normal-weight main-content-header-items ">{questionList.length} questions</div>
            </div>
            <div className="main-content-header-container">
                <div className="main-content-right">
                    {(!props.isAdmin && props.userID === null) ? <></> :
                        <button onClick={() => setPage({ page: 3 })} id="ask-question" className="text-normal-weight main-content-header-items main-content-askQuestion">
                            Ask Question
                        </button>
                    }
                </div>
                <table className="main-content-header-items">
                    <tbody><tr>
                        <td id="newest" className="main-content-filters" onClick={() => { helper.sortNewest(setState, props.questionBit, props.setQuestionBit); props.setPageNum(0) }}>
                            Newest
                        </td>
                        <td id="active" className="main-content-filters" onClick={() => { helper.sortActive(setState, props.questionBit, props.setQuestionBit); props.setPageNum(0) }}>
                            Active
                        </td>
                        <td id="unanswered" className="main-content-filters" onClick={() => { helper.sortUnans(setState, props.questionBit, props.setQuestionBit); props.setPageNum(0) }}>
                            Unanswered
                        </td>
                    </tr></tbody>
                </table>
            </div>
        </div>
    );
}

export function TagList({ tags }) {
    return (
        tags.map(tag => {
            return (
                <span key={tag._id} className="question-tag-items">
                    {tag.name.toLowerCase()}
                </span>
            )
        })
    )
}

function QuestionList({ questions, setQuestionAndAnswer, setPage, pageNum, ...props }) {
    const [curr, setCurr] = useState([])
    useEffect(() => {
        setCurr(questions.slice(pageNum * 5, (pageNum + 1) * 5));
    }, [questions, pageNum]);
    if (questions.length === 0)
        return (
            <div className="no-question-found">
                No Questions Found
            </div>
        );
    return (
        curr.map((question, index) => {
            return (
                <div key={question._id + index} className="question main-content-border">
                    <div className="question-info">
                        <div>
                            {question.votes} votes
                        </div>
                        <div>
                            {question.answers.length} answers
                        </div>
                        <div>
                            {question.views} views
                        </div>
                    </div>
                    <div>
                        <div className="question-title" onClick={async () => {
                            try {
                                await axios.get('http://localhost:8000/addView', { params: { _id: question._id } });
                                await axios.post('http://localhost:8000/answer', { _id: question._id }).then(res => { setQuestionAndAnswer(res.data[0]);} );
                                if (props.currentPage.page === 9) {
                                    setPage({ page: 10 })
                                }
                                else {
                                    setPage({ page: 2 });
                                }
                            } catch (error) {
                                window.alert("Server Error")
                            }
                        }}>
                            <div>
                                {question.title}
                            </div>
                            <div className="littler-text">
                                {question.summary}
                            </div>
                        </div>
                        <div className="question-tags">
                            <TagList tags={question.tags} />
                        </div>
                    </div>
                    <div className="question-user">
                        <span className="user-color">
                            {question.asked_by.username}
                        </span>
                        <span>
                            {helper.getTimeString(question.ask_date_time)}
                        </span>
                    </div>
                </div>
            )
        })
    );
}

export default function QuestionPage(props) {
    const [pageNum, setPageNum] = useState(0)
    const [title, setTitle] = useState("All Questions")
    useEffect(() => {
        if (props.currentPage.page === 0) {
            setTitle("All Questions")
        }
        else if (props.currentPage.page === 0) {
            setTitle("Searched Questions")
        }
        else {
            setTitle("Answered Questions")
        }
    }, [props.currentPage.page])
    return (
        <>
            <QuestionHeader setState={props.setQuestions} setPage={props.setPage} questionList={props.questionList} setPageNum={setPageNum} title={title} {...props} />
            <div className="question-box">
                <QuestionList questions={props.questionList} setPage={props.setPage} setQuestionAndAnswer={props.setQuestionAndAnswer} pageNum={pageNum} {...props} />
            </div>
            <span>
                <span onClick={() => { if (pageNum > 0) { setPageNum(pageNum - 1) } }} className="smaller-button answer-question-button">
                    Prev Page
                </span>
                <span>
                    Page {pageNum + 1}
                </span>
                <span onClick={() => {
                    if ((pageNum + 1) * 5 < props.questionList.length) {
                        setPageNum(pageNum + 1)
                    }
                    else {
                        setPageNum(0)
                    }
                }} className="smaller-button answer-question-button">
                    Next Page
                </span>
            </span>
        </>
    );
}