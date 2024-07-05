import React from 'react';
import { BottomImportantMessage, ErrorMessages, validHyperLink } from './commonPageComponents';
import { useState, useEffect } from "react";

import axios from 'axios'

var errorTag = false
var errorText = false
var errorTitle = false
var errorSummary = false


export function QuestionTitle(props) {
    if (props.valueE !== "none") {
        return (<div >
            <div className="ask-question-h1">
                Question Title*
            </div>
            <div className="ask-question-i">
                Limit title to 50 characters or less
            </div>
            <input type="text" id="titleQuestion" className="input-normal" maxLength="50" defaultValue={props.value} onChange={(e) => props.TitleValue(e.target.value)} required ></input>
            <ErrorMessages value={props.valueE} />
        </div>);
    }
    return (<div >
        <div className="ask-question-h1">
            Question Title*
        </div>
        <div className="ask-question-i">
            Limit title to 50 characters or less
        </div>
        <input type="text" id="titleQuestion" className="input-normal" maxLength="50" defaultValue={props.value} onChange={(e) => props.TitleValue(e.target.value)} required ></input>
    </div>);

}


export function QuestionSummary(props) {
    if (props.valueE !== "none") {
        return (<div >
            <div className="ask-question-h1">
                Question Summary*
            </div>
            <div className="ask-question-i">
                Limit Summary to 140 characters or less
            </div>
            <input type="text" id="titleQuestion" className="input-normal" maxLength="140" defaultValue={props.value} onChange={(e) => props.SummaryValue(e.target.value)} required ></input>
            <ErrorMessages value={props.valueE} />
        </div>);
    }
    return (<div >
        <div className="ask-question-h1">
            Question Summary*
        </div>
        <div className="ask-question-i">
            Limit Summary to 140 characters or less
        </div>
        <input type="text" id="titleQuestion" className="input-normal" maxLength="140" defaultValue={props.value} onChange={(e) => props.SummaryValue(e.target.value)} required ></input>
    </div>);

}

export function QuestionText(props) {
    if (props.valueE !== "none") {
        return (<div>
            <div className="ask-question-h1">
                Question Text*
            </div>
            <div className="ask-question-i">
                Add details
            </div>
            <textarea type="text" id="text" className="input-normal" defaultValue={props.value} onChange={(e) => props.TextValue(e.target.value)} required></textarea>
            <ErrorMessages value={props.valueE} />
        </div>
        );

    }
    return (<div>
        <div className="ask-question-h1">
            Question Text*
        </div>
        <div className="ask-question-i">
            Add details
        </div>
        <textarea type="text" id="text" className="input-normal" defaultValue={props.value} onChange={(e) => props.TextValue(e.target.value)} required></textarea>
    </div>
    );

}

export function QuestionTags(props) {


    let tagsString = (() => {
        let arr = []
        for (let x of props.value) {
            arr.push(x.name)
        }
        return arr.join(" ")
    })()
    if (props.valueE !== "none") {
        return (<div>
            <div className="ask-question-h1">
                Tags*
            </div>
            <div className="ask-question-i">
                Add keywords separated by whitespace
            </div>
            <input type="text" id="tags" className="input-normal" defaultValue={tagsString} onChange={(e) => props.TagsValue(e.target.value)} required></input>
            <ErrorMessages value={props.valueE} />
        </div>);
    }
    return (<div>
        <div className="ask-question-h1">
            Tags*
        </div>
        <div className="ask-question-i">
            Add keywords separated by whitespace
        </div>
        <input type="text" id="tags" className="input-normal" defaultValue={props.value} onChange={(e) => props.TagsValue(e.target.value)} required></input>
    </div>);
}

// export function QuestionUser(props) {
//     if (props.valueE !== "none") {
//         return (<div>
//             <div className="ask-question-h1">
//                 Username*
//             </div>
//             <input type="text" id="user" className="input-normal" onChange={(e) => props.UserValue(e.target.value)} required></input>
//             <ErrorMessages value={props.valueE} />
//         </div>);
//     }
//     return (<div>
//         <div className="ask-question-h1">
//             Username*
//         </div>
//         <input type="text" id="user" className="input-normal" onChange={(e) => props.UserValue(e.target.value)} required></input>

//     </div>);

// }


function removeSpaces(element) {
    return element !== ""
}
export function ButtonAskQuestions(props) {
    const [tagList, setTagList] = useState([])
    useEffect(() => {
        try {
            axios.get('http://localhost:8000/tagOnly')
                .then(tags => setTagList(tags.data))
        } catch (error) {
            window.alert("Server Error")
        }
    }, [])
    function DeleteInfo() {
        //props. ID is will be sent to me

        (async () => {
            try {
                let resultDelete = await axios.post('http://localhost:8000/questionDelete', { id: props.QuestID }, { withCredentials: true })
                if (resultDelete.data === "Deleted") {
                    props.setPage({ page: 5 })
                } else {
                    window.alert("Unable to delete")
                }
            } catch (error) {
                window.alert("Server Error")
            }
        })()
    }


    function SendInfo() {
        const originalTags = tagList
        let tagsString;
        let newTags;
        if (typeof (props.info[2]) === "object") {
            tagsString = (() => {
                let arr = []
                for (let x of props.info[2]) {
                    arr.push(x.name)
                }
                return arr.join(" ")
            })()

            newTags = tagsString

        } else {
            newTags = props.info[2]
        }

        let titleQ = props.info[0].trim()
        let textQ = props.info[1].trim()
        let tagsQ = new Set((newTags).toLowerCase().split(" ").filter(removeSpaces))
        let SummQ = props.info[3].trim()

        let validHyper = validHyperLink(textQ)

        var goodTags = true

        for (let y of tagsQ) {
            let insideOriginal = false
            if (y.length > 10) {
                for (let q = 0; q < originalTags.length; q++) {
                    if (y === originalTags[q].name) {
                        insideOriginal = true
                        break
                    }
                }
                if (insideOriginal === false) {

                    goodTags = false
                    break

                }
            }
        }

        if (tagsQ.size === 0 || tagsQ.size > 5 || goodTags !== true) {
            if (errorTag === false) {
                if (tagsQ.size > 5) {
                    props.TagE("ERROR - Cannot be more than 5 tags!")
                }
                else if (tagsQ.size === 0) {
                    props.TagE("ERROR - Cannot Be Blank!")
                }
                else if (goodTags !== true) {
                    props.TagE("ERROR - New tags can only be 10 characters long!")
                }

                errorTag = true
            } else {
                if (tagsQ.size > 5) {
                    props.TagE("ERROR - Cannot be more than 5 tags!");
                }
                else if (tagsQ.size === 0) {
                    props.TagE("ERROR - Cannot Be Blank!");
                }
                else if (goodTags !== true) {
                    props.TagE("ERROR - New tags can only be 10 characters long!");
                }
            }


        } else {
            if (errorTag === true) {
                props.TagE("none");
                errorTag = false
            }
        }
        if (titleQ === "") {
            if (errorTitle === false) {
                if (titleQ === "") {
                    props.TitleE("ERROR - Cannot Be Blank!")
                }



                errorTitle = true
            }

        } else {
            if (errorTitle === true) {
                props.TitleE("none");
                errorTitle = false
            }
        }
        if (textQ === "" || validHyper === false) {
            if (errorText === false) {
                if (textQ === "") {
                    props.TextE("ERROR - Cannot Be Blank!")

                }
                else if (validHyper === false) {
                    props.TextE("ERROR - Invalid HyperLinking!")

                }
                errorText = true
            }
            else {
                if (textQ === "") {
                    props.TextE("ERROR - Cannot Be Blank!")
                }
                else if (validHyper === false) {
                    props.TextE("ERROR - Invalid HyperLinking!")
                }

            }
        } else {
            if (errorText === true) {
                props.TextE("none");
                errorText = false
            }
        }
        if (SummQ === "") {
            if (errorSummary === false) {
                props.SummaryE("ERROR - Cannot Be Blank!")
                errorSummary = true
            }
        } else {
            if (errorSummary === true) {
                props.SummaryE("none");
                errorSummary = false
            }
        }

        if (tagsQ.size !== 0 && titleQ !== "" && textQ !== "" && SummQ !== "" && goodTags && tagsQ.size <= 5 && validHyper === true) {
            errorTag = false
            errorText = false
            errorTitle = false
            errorSummary = false;

            (async () => {
                try {
                    let http = await axios.post('http://localhost:8000/updateQuestion', { id: props.QuestID, title: titleQ, summary: SummQ, text: textQ, tags: Array.from(tagsQ), ask_date_time: new Date() }, { withCredentials: true })
                    if (http.data === "Not Enough Points to Create New Tag") {
                        window.alert("Not Enough Points to Create New Tag")
                    }
                    props.setPage({ page: 5 })
                } catch (error) {
                    window.alert("Server Error")
                }
            })()
        }


    }
    return (<div><span id="PostQuestion" onClick={SendInfo} className="ask-question-bottom-left">
        Update Question
    </span><span id="PostQuestion" onClick={DeleteInfo} className="ask-question-bottom-left-delete">
            Delete Question
        </span></div>);
}


export function BottomPartQuestion(props) {
    function InfoValues() {
        const arrayInfo = [props.TitleValD, props.TextValD, props.TagsValD, props.SummValD]
        return arrayInfo
    }
    return (<div className="ask-question-bottom">
        <ButtonAskQuestions info={InfoValues()} {...props} />
        <BottomImportantMessage />
    </div >);
}

export default function AskQuestionPage(props) {

    //assuming I got the question ID
    let question = props.editQuestion
    const [Text, setText] = useState(question.text);
    const [Title, setTitle] = useState(question.title);
    const [Tags, setTags] = useState(question.tags);
    const [Summary, setSummary] = useState(question.summary);
    const [TextError, setTextError] = useState("");
    const [TitleError, setTitleError] = useState("");
    const [TagsError, setTagsError] = useState("");
    const [SummaryError, setSummaryError] = useState("");
    function getText(text) {

        setText(text)
    }
    function getTitle(title) {

        setTitle(title)

    }
    function getTags(tags) {
        setTags(tags)

    }
    function getSummary(summ) {
        setSummary(summ)

    }
    function getTextError(error) {
        setTextError(error)
    }
    function getTitleError(error) {
        setTitleError(error)
    }
    function getTagsError(error) {
        setTagsError(error)
    }
    function getSummaryError(error) {
        setSummaryError(error)
    }
    return (<div className="ask-question-content">
        <div className="ask-question-wrapper">
            <QuestionTitle TitleValue={getTitle} value={question.title} valueE={TitleError} />
            <QuestionSummary SummaryValue={getSummary} value={question.summary} valueE={SummaryError} />
            <QuestionText TextValue={getText} value={question.text} valueE={TextError} />
            <QuestionTags TagsValue={getTags} value={question.tags} valueE={TagsError} />
            <BottomPartQuestion QuestID={question._id} TextVal={question.text} TitleVal={question.title} TagsVal={question.tags} SummVal={question.summary} TextValD={Text} TitleValD={Title} TagsValD={Tags} SummValD={Summary} TextE={getTextError} TitleE={getTitleError} TagE={getTagsError} SummaryE={getSummaryError} {...props} />
        </div >

    </div >);
}