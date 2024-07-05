import React from 'react';


export function BottomImportantMessage() {
    return (<span className="ask-question-bottom-right">
        *indicates mandatory fields
    </span>);
}

export function ErrorMessages(props) {
    return (<div className="issue">{props.value}</div>);
}

export function validHyperLink(rawText) {
    let regex = RegExp(/\[.*\]\(.*\)/g)
    let regexExtract = RegExp(/\[(?<highlightedWord>.+)\]\((?<linkToTab>https?:\/\/.+)\)/)
    let matches = rawText.matchAll(regex)
    for (let x of matches) {
        if (!(regexExtract.test(x)))
            return false
    }
    return true
}

export function validEmail(rawText) {
    let regex = /\b[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}\b/g
    let matches = rawText.match(regex)
    if (matches === null) {
        return "Wrong"
    }
    let size = 0
    matches.forEach(() => {
        size += 1;
    });
    if (size > 1) {
        return "Too many"
    }
    else if (size === 1) {
        return matches[0]
    }
}

export function validPassword(rawText, email, user) {
    let startingEmail = (email.toLowerCase()).split("@")
    let start = startingEmail[0]
    let lower = rawText.toLowerCase()
    if (lower.includes(start) || lower.includes(user.toLowerCase())) {
        return false
    }
    return true
}