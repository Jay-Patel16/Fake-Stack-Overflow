import React from 'react';
import { BottomImportantMessage, ErrorMessages, validEmail, validPassword } from './commonPageComponents';
import { useState, useEffect } from "react";
import axios from 'axios'




export function RegisterUser(props) {
    if (props.valueE !== "none") {
        return (<div >
            <div className="ask-question-h1">
                Username*
            </div>
            <input type="text" id="titleQuestion" className="input-normal" onChange={(e) => props.UserValue(e.target.value)} required ></input>
            <ErrorMessages value={props.valueE} />
        </div>);
    }
    return (<div >
        <div className="ask-question-h1">
            Username*
        </div>
        <input type="text" id="titleQuestion" className="input-normal" onChange={(e) => props.UserValue(e.target.value)} required ></input>
    </div>);

}

export function RegisterEmail(props) {
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

export function RegisterPassword(props) {
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


export function RegisterVerifyPassword(props) {
    if (props.valueE !== "none") {
        return (<div>
            <div className="ask-question-h1">
                Confirm Password*
            </div>
            <div className="ask-question-i">
                Confirm Password
            </div>
            <input type="password" id="tags" className="input-normal" value={props.value} onChange={(e) => props.PasswordConValue(e.target.value)} required></input>
            <ErrorMessages value={props.valueE} />
        </div>);
    }
    return (<div>
        <div className="ask-question-h1">
            Confirm Password*
        </div>
        <div className="ask-question-i">
            Confirm Password
        </div>
        <input type="password" id="tags" className="input-normal" value={props.value} onChange={(e) => props.PasswordConValue(e.target.value)} required></input>
    </div>);
}





export function ButtonSignUp(props) {
    const [userList, setUserList] = useState([])
    // const [userListName, setUserListName] = useState([])
    // axios.get('http://localhost:8000/userEmails')
    //     .then(users => setUserList(users.data))

    useEffect(() => {
        try {
            axios.get('http://localhost:8000/userEmails')
                .then(usersN => setUserList(usersN.data))
        } catch (error) {
            window.alert("Server Error")
        }
    }, [])
    function SendInfo() {

        let duplicate = false
        // let dupUser = false
        let userN = props.info[0].toLowerCase().trim()
        let email = props.info[1].toLowerCase().trim()
        let password = props.info[2]
        let passwordConfirm = props.info[3]

        let validEmailAnswer = validEmail(email)
        let validPasswordAnswer = validPassword(password, email, userN)



        if (userN === "") {
            // if (errorUser === false) {
            if (userN === "") {
                props.UserE("ERROR - Cannot Be Blank!")
            }

        }
        else {
            props.UserE("none")
        }
      
        if (email === "" || validEmailAnswer === "Too many" || validEmailAnswer === "Wrong") {
            // if (errorEmail === false) {
            if (email === "") {
                props.EmailE("ERROR - Cannot Be Blank!")
            }
            else if (validEmailAnswer === "Too many") {
                props.EmailE("ERROR - Cannot Have Multiple Emails!")
            }
            else if (validEmailAnswer === "Wrong") {
                props.EmailE("ERROR - Invalid Email!")
            }




        } else {
            let checking = false
            for (let e of userList) {

                if (e.email === email) {
                    checking = true
                    break
                }
            }
            if (checking === true) {
                props.EmailE("ERROR - Email Already In Use")
                duplicate = true
            }
            else if (checking === false) {
                props.EmailE("none");
                duplicate = false
            }
            // if (errorEmail === true) {

            //     errorEmail = false
            // }
        }
        if (password === "" || validPasswordAnswer === false) {
            // if (errorPassword === false) {
            if (password === "") {
                props.PasswordE("ERROR - Cannot Be Blank!")

            }
            else if (validPasswordAnswer === false) {
                props.PasswordE("ERROR - Cannot Contain Username or Email ID!")

            }
            //     errorPassword = true
            // }
            // else {
            //     if (password === "") {
            //         props.PasswordE("ERROR - Cannot Be Blank!")

            //     }
            //     else if (validPasswordAnswer === false) {
            //         props.PasswordE("ERROR - Cannot Contain Username or Email ID!")

            //     }

            // }
        } else {
            // if (errorPassword === true) {
            props.PasswordE("none");
            //     errorPassword = false
            // }
        }

        if (passwordConfirm === "" || passwordConfirm !== password) {
            // if (errorPassword === false) {
            if (passwordConfirm === "") {
                props.PasswordConE("ERROR - Cannot Be Blank!")

            }
            else if (passwordConfirm !== password) {
                props.PasswordConE("ERROR - Passoword Does Not Match!")

            }

        } else {
            // if (errorPassword === true) {
            props.PasswordConE("none");
            //     errorPassword = false
            // }
        }

        if (userN !== "" && email !== "" && password !== "" && validEmailAnswer !== "Too many" && validEmailAnswer !== "Wrong" && validPasswordAnswer !== false && duplicate === false && passwordConfirm !== "" && passwordConfirm === password) {
            (async () => {
                try {
                    await axios.post('http://localhost:8000/addUser', { UserName: userN, Email: email, Password: password, timeCreated: new Date() })
                    props.setStart(2)
                } catch (error) {
                    window.alert("Server Error")
                }
                // await sortNewest(props.setQuestions)
            })()
            
        }


    }
    return (
        <span id="PostQuestion" onClick={() => { SendInfo() }} className="ask-question-bottom-left">
            Sign Up
        </span>);
}


export function BottomPartQuestion(props) {
    function InfoValues() {
        const arrayInfo = [props.UserVal, props.EmailVal, props.PasswordVal, props.PasswordCon]
        return arrayInfo
    }
    return (
        <div className="ask-question-bottom">
            <span>
                <ButtonSignUp info={InfoValues()} {...props} />
                <span className="ask-question-bottom-left-double" onClick={() => props.setStart(0)}> Go Back </span>
            </span>
            <BottomImportantMessage />
        </div >);
}

export default function RegisterUserPage(props) {
    const [UserN, setUserN] = useState("");
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [PasswordCon, setPasswordConf] = useState("");
    const [UserError, setUserError] = useState("");
    const [EmailError, setEmailError] = useState("");
    const [PasswordError, setPasswordError] = useState("");
    const [PasswordConError, setPasswordConError] = useState("");
    function getUserN(User) {

        setUserN(User)
    }
    function getEmail(email) {
        setEmail(email)

    }
    function getPass(password) {
        setPassword(password)

    }
    function getPassConf(password) {
        setPasswordConf(password)

    }
    function getUserError(error) {
        setUserError(error)
    }
    function getEmailError(error) {
        setEmailError(error)
    }
    function getPasswordError(error) {
        setPasswordError(error)
    }
    function getPasswordConfError(error) {
        setPasswordConError(error)
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
                    <RegisterUser UserValue={getUserN} value={UserN} valueE={UserError} />
                    <RegisterEmail EmailValue={getEmail} value={Email} valueE={EmailError} />
                    <RegisterPassword PasswordValue={getPass} value={Password} valueE={PasswordError} />
                    <RegisterVerifyPassword PasswordConValue={getPassConf} value={PasswordCon} valueE={PasswordConError} />
                    <BottomPartQuestion UserVal={UserN} EmailVal={Email} PasswordVal={Password} PasswordCon={PasswordCon} PasswordConE={getPasswordConfError} UserE={getUserError} EmailE={getEmailError} PasswordE={getPasswordError} {...props} />
                </div >
            </div >
        </div>
    );
}