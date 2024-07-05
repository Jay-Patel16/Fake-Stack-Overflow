import React from 'react';
import { BottomImportantMessage, ErrorMessages, validHyperLink } from './commonPageComponents';
import { useState, useEffect } from "react";
import { sortNewest } from './helper.js'
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
            <input type="text" id="titleQuestion" className="input-normal" maxLength="50" onChange={(e) => props.TitleValue(e.target.value)} required ></input>
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
        <input type="text" id="titleQuestion" className="input-normal" maxLength="50" onChange={(e) => props.TitleValue(e.target.value)} required ></input>
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
            <input type="text" id="titleQuestion" className="input-normal" maxLength="140" onChange={(e) => props.SummaryValue(e.target.value)} required ></input>
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
        <input type="text" id="titleQuestion" className="input-normal" maxLength="140" onChange={(e) => props.SummaryValue(e.target.value)} required ></input>
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
            <textarea type="text" id="text" className="input-normal" onChange={(e) => props.TextValue(e.target.value)} required></textarea>
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
        <textarea type="text" id="text" className="input-normal" onChange={(e) => props.TextValue(e.target.value)} required></textarea>
    </div>
    );

}

export function QuestionTags(props) {
    if (props.valueE !== "none") {
        return (<div>
            <div className="ask-question-h1">
                Tags*
            </div>
            <div className="ask-question-i">
                Add keywords separated by whitespace
            </div>
            <input type="text" id="tags" className="input-normal" value={props.value} onChange={(e) => props.TagsValue(e.target.value)} required></input>
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
        <input type="text" id="tags" className="input-normal" value={props.value} onChange={(e) => props.TagsValue(e.target.value)} required></input>
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
    function SendInfo() {
        const originalTags = tagList
        let titleQ = props.info[0].trim()
        let textQ = props.info[1].trim()
        let tagsQ = new Set((props.info[2]).toLowerCase().split(" ").filter(removeSpaces))
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
                    let resultingOut = await axios.post('http://localhost:8000/addQuestion', { title: titleQ, summary: SummQ, text: textQ, tags: Array.from(tagsQ), ask_date_time: new Date() }, { withCredentials: true })
                    if (resultingOut.data === "Not Enough Points to Create New Tag") {
                        window.alert("Not Enough Points to Create New Tag")
                    }
                    else if (resultingOut.data === false) {
                        window.alert("Unable to add question")
                    }
                    await sortNewest(props.setQuestions)
                    props.setPage({ page: 0 })
                } catch (error) {
                    window.alert("Server Error")
                }
            })()
        }


    }
    return (<span id="PostQuestion" onClick={SendInfo} className="ask-question-bottom-left">
        Post Question
    </span>);
}


export function BottomPartQuestion(props) {
    function InfoValues() {
        const arrayInfo = [props.TitleVal, props.TextVal, props.TagsVal, props.SummVal]
        return arrayInfo
    }
    return (<div className="ask-question-bottom">
        <ButtonAskQuestions info={InfoValues()} {...props} />
        <BottomImportantMessage />
    </div >);
}

export default function AskQuestionPage(props) {
    const [Text, setText] = useState("");
    const [Title, setTitle] = useState("");
    const [Tags, setTags] = useState("");
    const [Summary, setSummary] = useState("");
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
            <QuestionTitle TitleValue={getTitle} value={Title} valueE={TitleError} />
            <QuestionSummary SummaryValue={getSummary} value={Summary} valueE={SummaryError} />
            <QuestionText TextValue={getText} value={Text} valueE={TextError} />
            <QuestionTags TagsValue={getTags} value={Tags} valueE={TagsError} />
            <BottomPartQuestion TextVal={Text} TitleVal={Title} TagsVal={Tags} SummVal={Summary} TextE={getTextError} TitleE={getTitleError} TagE={getTagsError} SummaryE={getSummaryError} {...props} />
        </div >

    </div >);
}