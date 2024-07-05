import axios from 'axios'
import { useState, useEffect } from 'react'

export default function TagPage(props) {
    const [tagList, setTagList] = useState([]);
    useEffect(() => {
        try {
            if (props.currentPage.page === 7) {
                if (props.isAdmin === true) {
                    axios.post('http://localhost:8000/lookUser', { email: props.dummyUser.user.email }, { withCredentials: true }).then(http => setTagList(http.data.createdTags))
                }
                else {
                    axios.post('http://localhost:8000/user', {}, { withCredentials: true }).then(http => setTagList(http.data.createdTags))
                }
            }
            else {
                axios.get('http://localhost:8000/tags').then(http => { setTagList(http.data) })
            }
        } catch (error) {
            window.alert("Server Error")
        }
    }, [props.currentPage.page, props.tagsBit, props.dummyUser, props.isAdmin])
    return (
        <>
            <TagHeader {...props} tagTotal={tagList.length} />
            <div className="tag-page-content">
                <TagList {...props} tagList={tagList} {...props} />
            </div>
        </>
    );
}


//NEEDS TO ADD NUMBER OF QUESTIONS USING SEARCH AND ALSO EVENT ONCLICK FOR SEARCH
//findNumberQuestions(content.data.tags[i].name.toLowerCase()) 
//filterTag(content.data.tags[i].name.toLowerCase())
function TagList({ tagList, ...props }) {
    return (
        tagList.sort((a, b) => { if (a.tagNum === b.tagNum) return a.tagData.name > b.tagData.name; return b.tagNum - a.tagNum }).map(tag => { return <Tag tag={tag} key={tag.tagData.name + props.currentPage.page} {...props} /> })
    );
}

function Tag({ tag, ...props }) {
    const [edit, setEdit] = useState(0);
    let { tagData, tagNum } = tag;
    return (
        <span className={(() => {
            let stringName = "tag-page-content-items"
            if (props.currentPage.page !== 1) {
                stringName += " changing-height"
            }
            return stringName
        })()}>
            <div onClick={() => {
                try {
                    if (props.currentPage.page === 1) {
                        axios.get('http://localhost:8000/questions', { params: { tag: JSON.stringify(tagData) } }).then(http => props.setQuestions(http.data));
                        props.setPage({ page: 8 });
                    }
                } catch (error) {
                    window.alert("Server Error")
                }
            }} className="tag-page-content-name">
                <TagName name={tagData.name} data={tagData} number={tagNum} edit={edit} setEdit={setEdit} {...props} />
            </div>
            <div>
                {tagNum} question
            </div>
            <TagProfileButtons numOfTag={tagNum} tagInfo={tagData} edit={edit} setEdit={setEdit} {...props} />
        </span>
    );
}


function updatingTag(key, value, data, num, setTagsBit, tagsBit, edit, setEdit) {
    (async () => {
        if (key === "Enter") {
            let writing = value.toLowerCase().trim()
            if (writing === "") {
                window.alert("Cannot Be Blank!")
            }
            else if (writing.split(" ").length > 1) {
                window.alert("Cannot Be Multiple Tags!")
            }
            else if (writing.length > 10) {
                window.alert("The Tag Needs to be Less Than 10 Characters")
            }
            // const AnswerText = props.info[0].trim()
            // let validHyper = validHyperLink(writing)
            else {
                try {
                    let validUser = await axios.post('http://localhost:8000/updateTag', { parentID: data._id, number: num, text: writing }, { withCredentials: true })
                    if (validUser.data === "Not allowed to update - Not only user") {
                        window.alert("Not allowed to update - Not only user")
                    } else if (validUser.data === "updated") {
                        setEdit(edit^1)
                        setTagsBit(tagsBit ^ 1)
                        window.alert("Tag has been updated")
                        // setPage({ page: 7 })
                    }
                } catch (error) {
                    window.alert("Server Error")
                }
            }


        }

    })()
}


function deleteTag(numOfTag, tagInfo, setTagsBit, tagsBit) {
    (async () => {
        let id = tagInfo._id
        // const AnswerText = props.info[0].trim()
        // let validHyper = validHyperLink(writing)
        try {
            let validDelete = await axios.post('http://localhost:8000/deleteTag', { parentID: id, number: numOfTag }, { withCredentials: true })
            if (validDelete.data === "Not allowed to update - Not only user") {
                window.alert("Not allowed to update - Not only user")
            } else if (validDelete.data === "Tag Deleted") {
                setTagsBit(tagsBit ^ 1)
                window.alert("Tag has been deleted")
                // setPage({ page: 7 })
            }
        } catch (error) {
            window.alert("Server Error")
        }



    })()
}

function TagName({ name, edit, ...props }) {
    if (!edit || props.currentPage.page === 1) {
        return name
    }
    return (
        <input
            onKeyDown={(e) => updatingTag(e.key, e.target.value, props.data, props.number, props.setTagsBit, props.tagsBit, props.edit, props.setEdit)} defaultValue={name} />
    )
}

function TagHeader({ setPage, tagTotal, ...props }) {
    let header_title = "All Tags"
    if (props.currentPage.page === 7)
        header_title = "Created Tags"
    return (
        <div className="tag-page-header">
            <div className="tag-page-header-items tag-header-left">
                {tagTotal} Tags
            </div>
            <div className="tag-page-header-items tag-header-center">
                {header_title}
            </div>
            <div className="tag-page-header-items tag-header-right">
                {(!props.isAdmin && props.userID === null) ? <></> :
                    <button onClick={() => setPage({ page: 3 })} className="tag-right-question main-content-askQuestion ask-question" id="ask-question">
                        Ask Question
                    </button>
                }
            </div>
        </div>
    );
}

function TagProfileButtons({ numOfTag, tagInfo, setEdit, edit, ...props }) {
    if (props.currentPage.page !== 7) {
        return
    }
    return (
        <div className="top-margin">
            <span className="smaller-button main-content-askQuestion" onClick={() => { setEdit(edit ^ 1) }}>
                Edit
            </span>
            <span onClick={() => { deleteTag(numOfTag, tagInfo, props.setTagsBit, props.tagsBit) }} className="smaller-button main-content-askQuestion">
                Delete
            </span>
        </div>
    )
}