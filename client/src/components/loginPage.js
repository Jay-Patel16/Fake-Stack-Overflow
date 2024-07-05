import React from 'react';
import { BottomImportantMessage, ErrorMessages, validEmail } from './commonPageComponents';
import { useState } from "react";

import axios from 'axios'

export function LoginEmail(props) {
    if (props.valueE !== "none") {
        return (<div>
            <div className="ask-question-h1">
                Email*
            </div>
            <div className="ask-question-i">
                Add Email Address
            </div>
            <input type="text" id="titleQuestion" className="input-normal" onChange={(e) => props.EmailValue(e.target.value)} required></input>
            <ErrorMessages value={props.valueE} />
        </div>
        );

    }
    return (<div>
        <div className="ask-question-h1">
            Email*
        </div>
        <div className="ask-question-i">
            Add Email Address
        </div>
        <input type="text" id="titleQuestion" className="input-normal" onChange={(e) => props.EmailValue(e.target.value)} required></input>
    </div>
    );

}

export function LoginPassword(props) {
    if (props.valueE !== "none") {
        return (<div>
            <div className="ask-question-h1">
                Password*
            </div>
            <div className="ask-question-i">
                Should Not Contain Username or Email ID
            </div>
            <input type="password" id="tags" className="input-normal" value={props.value} onChange={(e) => props.PasswordValue(e.target.value)} required></input>
            <ErrorMessages value={props.valueE} />
        </div>);
    }
    return (<div>
        <div className="ask-question-h1">
            Password*
        </div>
        <div className="ask-question-i">
            Should Not Contain Username or Email ID
        </div>
        <input type="password" id="tags" className="input-normal" value={props.value} onChange={(e) => props.PasswordValue(e.target.value)} required></input>
    </div>);
}







export function ButtonLoginIn(props) {
    // const [userList, setUserList] = useState([])

    // useEffect(() => {
    //     axios.get('http://localhost:8000/userEmails')
    //         .then(users => setUserList(users.data))
    // }, [])




    function SendInfo() {
        let passwordVerify = false
        let email = props.info[0].toLowerCase().trim()
        let password = props.info[1]

        // let passwordConfirm = props.info[3]

        let validEmailAnswer = validEmail(email)



        if (email === "" || validEmailAnswer === "Too many" || validEmailAnswer === "Wrong") {
            if (email === "") {
                props.EmailE("ERROR - Cannot Be Blank!")
            }
            else if (validEmailAnswer === "Too many") {
                props.EmailE("ERROR - Cannot Have Multiple Emails!")
            }
            else if (validEmailAnswer === "Wrong") {
                props.EmailE("ERROR - Invalid Email!")
            }
            


        }
        else {
            props.EmailE("none")   
        }
        if (password === "") {
            // if (errorPassword === false) {
            if (password === "") {
                props.PasswordE("ERROR - Cannot Be Blank!")

            }

        } else {
            // if (errorPassword === true) {
            props.PasswordE("none");
            //     errorPassword = false
            // }
        }


        if (email !== "" && password !== "" && validEmailAnswer !== "Too many" && validEmailAnswer !== "Wrong") {
            (async () => {
                try {
                    passwordVerify = await axios.post('http://localhost:8000/loginUser', { email: email, password: password }, { withCredentials: true })
                    if (passwordVerify.data === "Unregistered Email") {
                        props.EmailE("Unregistered Email")
                    }
                    // depending on the response back it would do error cases or just go back to question page
                    else if (passwordVerify.data === false) {
                        window.alert("Wrong Password")
                    } else {
                        props.EmailE("none");
                        props.setStart(-1);
                    }
                } catch (error) {
                    window.alert("Server Error")
                }


                // await sortNewest(props.setQuestions)

            })();
        }


    }
    return (<span id="PostQuestion" onClick={SendInfo} className="ask-question-bottom-left">
        Login
    </span>);
}

export function BottomPartQuestion(props) {
    function InfoValues() {
        const arrayInfo = [props.EmailVal, props.PasswordVal]
        return arrayInfo
    }
    return (<div className="ask-question-bottom">
        <span>
            <ButtonLoginIn info={InfoValues()} {...props} />
            <span className="ask-question-bottom-left-double" onClick={() => props.setStart(0)}> Go Back </span>
        </span>
        <BottomImportantMessage />
    </div >);
}

export default function RegisterUserPageLogin(props) {
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [EmailError, setEmailError] = useState("");
    const [PasswordError, setPasswordError] = useState("");
    // const [loggedIn, setList] = useState(false)
    // useEffect(() => {
    //     axios.get('http://localhost:8000/checkLogin')
    //         .then(users => setList(users.data))
    // })

    // if (loggedIn === true) {
    //     props.setStart(-1);
    // }

    function getEmail(email) {
        setEmail(email)

    }
    function getPass(password) {
        setPassword(password)

    }

    function getEmailError(error) {
        setEmailError(error)
    }
    function getPasswordError(error) {
        setPasswordError(error)
    }



    return (
        <div>
            <div className="header">
                <span className="filler">
                    <h1 className="title">Fake Stack Overflow</h1>
                </span>
            </div>
            <div className="ask-question-content">
                <div className="ask-question-wrapper">
                    <LoginEmail EmailValue={getEmail} value={Email} valueE={EmailError} />
                    <LoginPassword PasswordValue={getPass} value={Password} valueE={PasswordError} />
                    <BottomPartQuestion EmailVal={Email} PasswordVal={Password} EmailE={getEmailError} PasswordE={getPasswordError} {...props} />
                </div >
            </div>
        </div>
    );
}