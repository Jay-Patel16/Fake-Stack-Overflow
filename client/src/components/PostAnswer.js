import { BottomImportantMessage, ErrorMessages, validHyperLink } from './commonPageComponents';
import { useState } from "react";
import axios from "axios"


var errorTextAnswer = false

export default function PostAnswer({ tagsList, questionList, setPage, currentQuestion, ...props }) {
    const [Text, setText] = useState("");

    const [TextError, setTextError] = useState("");

    function getText(text) {

        setText(text)
    }


    function getTextError(error) {
        setTextError(error)
    }


    return (<div className="ask-question-content">
        <div className="ask-question-wrapper">
            {/* <AnswerUser UserValue={getUser} value={User} valueE={UserError} /> */}
            <AnswerText TextValue={getText} value={Text} valueE={TextError} />
            <AnswerPageBottom TextVal={Text} TextE={getTextError} tagsList={tagsList} questionsList={questionList} setPage={setPage} currentQuestion={currentQuestion} {...props} />
        </div>
    </div>);
}

// export function AnswerUser(props) {
//     if (props.valueE !== "none") {
//         return (
//             <div >
//                 <div className="ask-question-h1">
//                     Username*
//                 </div>
//                 <input type="text" id="answerUser" className="input-normal" onChange={(e) => props.UserValue(e.target.value)} required></input>
//                 <ErrorMessages value={props.valueE} />
//             </div>
//         );
//     }
//     return (
//         <div >
//             <div className="ask-question-h1">
//                 Username*
//             </div>
//             <input type="text" id="answerUser" className="input-normal" onChange={(e) => props.UserValue(e.target.value)} required></input>

//         </div>
//     );

// }

export function AnswerText(props) {
    if (props.valueE !== "none") {
        return (
            <div>
                <div className="ask-question-h1">
                    Answer Text*
                </div>
                <textarea type="text" id="answerText" className="input-normal" onChange={(e) => props.TextValue(e.target.value)} required></textarea>
                <ErrorMessages value={props.valueE} />
            </div>
        );
    }
    return (
        <div>
            <div className="ask-question-h1">
                Answer Text*
            </div>
            <textarea type="text" id="answerText" className="input-normal" onChange={(e) => props.TextValue(e.target.value)} required></textarea>
        </div>
    );

}

export function AnswerPageBottomButton(props) {
    function SendInfoAnswers() {
        // const AnswerUser = props.info[0].trim()
        const AnswerText = props.info[0].trim()
        let validHyper = validHyperLink(AnswerText)


        // if (AnswerUser === "") {
        //     if (errorUserAnswer === false) {
        //         props.UserE("ERROR - Cannot Be Blank!")

        //         errorUserAnswer = true
        //     }
        // } else {
        //     if (errorUserAnswer === true) {
        //         props.UserE("none")
        //         errorUserAnswer = false
        //     }
        // }
        if (AnswerText === "" || validHyper === false) {
            if (errorTextAnswer === false) {
                if (AnswerText === "") {
                    props.TextE("ERROR - Cannot Be Blank!")
                    errorTextAnswer = true
                }
                else if (validHyper === false) {
                    props.TextE("ERROR - Invalid HyperLinking!")
                    errorTextAnswer = true
                }

            } else {
                if (AnswerText === "") {
                    props.TextE("ERROR - Cannot Be Blank!")
                }
                else if (validHyper === false) {
                    props.TextE("ERROR - Invalid HyperLinking!")

                }

            }
        } else {
            if (errorTextAnswer === true) {
                props.TextE("none");
                errorTextAnswer = false
            }
        }

        if (AnswerText !== "" && validHyper === true) {
            errorTextAnswer = false;

            (async () => {
                try {
                    let resultingOut = await axios.post('http://localhost:8000/addAnswer', { text: AnswerText, ans_date_time: new Date(), question: props.currentQuestion._id }, { withCredentials: true });
                    if (resultingOut.data === false) {
                        window.alert("Unable to add question")
                    }
                    props.setAnswersBit(props.answersBit * -1);
                    props.setPage({ page: 2 });
                } catch (error) {
                    window.alert("Server Error")
                }
            })();
        }
    }
    return (
        <span id="PostAnswer" onClick={SendInfoAnswers} className="ask-question-bottom-left">
            Post Answer
        </span>
    );
}


export function AnswerPageBottom(props) {
    function InfoValuesAnswer() {
        const arrayInfo = [props.TextVal]
        return arrayInfo
    }
    return (
        <div className="ask-question-bottom">
            <AnswerPageBottomButton info={InfoValuesAnswer()} TextE={props.TextE} content={props.content} setPage={props.setPage} currentQuestion={props.currentQuestion} {...props} />
            <BottomImportantMessage />
        </div>
    )
}
