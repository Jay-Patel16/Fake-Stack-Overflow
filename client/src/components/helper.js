import axios from 'axios'

export function getTimeString(dateTime) {
  let dateTime_1 = new Date(dateTime)
  var timeDiff = (Date.now() - dateTime_1.valueOf()) / 1000; // milliseconds to seconds
  var timeString = " ";
  if (timeDiff >= 60) {
    timeDiff /= 60;
    if (timeDiff >= 60) {
      timeDiff /= 60;
      if (timeDiff >= 24) {
        timeDiff /= 24;
        var tempStringArray = dateTime_1.toString().split(" ");
        if (timeDiff >= 365) {
          timeString += tempStringArray[1] + " " + tempStringArray[2] + ", " + tempStringArray[3] + " at " + tempStringArray[4].slice(0, -3);
        }
        else {
          timeString += tempStringArray[1] + " " + tempStringArray[2] + " at " + tempStringArray[4].slice(0, -3);
        }
      }
      else {
        timeString += Math.floor(timeDiff) + " hours ago";
      }
    }
    else {
      timeString += Math.floor(timeDiff) + " minutes ago";
    }
  }
  else {
    timeString += Math.floor(timeDiff) + " seconds ago";
  }
  return timeString;
}

export function getTimeString_Day(dateTime) {
  let dateTime_1 = new Date(dateTime)
  var timeDiff = (Date.now() - dateTime_1.valueOf()) / 1000; // milliseconds to seconds
  var timeString = " ";
  if (timeDiff >= 60) {
    timeDiff /= 60;
    if (timeDiff >= 60) {
      timeDiff /= 60;
      if (timeDiff >= 24) {
        timeDiff /= 24;
        timeString += Math.floor(timeDiff) + " days ago"
      }
      else {
        timeString += Math.floor(timeDiff) + " hours ago";
      }
    }
    else {
      timeString += Math.floor(timeDiff) + " minutes ago";
    }
  }
  else {
    timeString += Math.floor(timeDiff) + " seconds ago";
  }
  return timeString;
}

export async function sortActive(setState) {
  try {
    let ret = [];
    await axios.get("http://localhost:8000/activeQuestions").then(res => ret = res.data)
    ret = ret.map(q => q.q)
    setState(ret)
  } catch (error) {
    window.alert("Server Error")
  }
  return
}

export async function sortNewest(setState) {
  try {
    let ret = [];
    await axios.get("http://localhost:8000/questions").then(res => ret = res.data)
    ret.sort(function (a, b) {
      return new Date(b.ask_date_time).valueOf() - new Date(a.ask_date_time).valueOf()
    })
    setState(ret)
  } catch (error) {
    window.alert("Server Error")
  }
  return
  
}

export async function sortUnans(setState) {
  try {
    let ret = [];
    await axios.get("http://localhost:8000/unansQuestions").then(res => ret = res.data)
    ret.sort(function (a, b) {
      return new Date(b.ask_date_time).valueOf() - new Date(a.ask_date_time).valueOf()
    })
    setState(ret)
  } catch (error) {
    window.alert("Server Error")
  }
  return
}

export function filter(tags, wordsSearch, tagList, questionsList) {
  let tagIdSet = new Set()
  let questionsNeed = []
  for (let x in tagList) {
    if (tags.has(tagList[x].name.toLowerCase())) {
      tagIdSet.add(tagList[x]._id)
    }
  }
  for (let i = 0; i < questionsList.length; i++) {
    for (let j = 0; j < questionsList[i].tags.length; j++) {
      if (tagIdSet.has(questionsList[i].tags[j]._id)) {
        questionsNeed.push(questionsList[i])

      }

    }
  }



  //search words
  for (let i = 0; i < questionsList.length; i++) {
    for (let x of wordsSearch) {
      if ((questionsList[i].title.toLowerCase()).split(" ").includes(x) || (questionsList[i].text.toLowerCase()).split(" ").includes(x) || (questionsList[i].summary.toLowerCase()).split(" ").includes(x)) {
        questionsNeed.push(questionsList[i])

      }
      else {
        for (let j = 0; j < questionsList[i].answers.length; j++) {
          for (let y of wordsSearch) {
            if ((questionsList[i].answers[j].text.toLowerCase()).split(" ").includes(y)) {
              questionsNeed.push(questionsList[i])
            }
          }
        }
      }
    }
  }
  let arraySet = new Set(questionsNeed)
  let arrayQuestions = Array.from(arraySet)
  return arrayQuestions
}


export function searching(event, eventValue, tagList, questionList, setPage, setQuestions) {
  (async () => {
    try {
      let questionList = await axios.get('http://localhost:8000/questions')
      let tagList = await axios.get('http://localhost:8000/tagOnly')
      if (event === "Enter") {
        const wordsSearch = new Set()
        var tags = new Set()

        const outlierTags = []
        for (let x of tagList.data) {
          if (x.name.length > 10)
            outlierTags.push(x.name)
        }
        outlierTags.sort(function (a, b) { return a.length - b.length })
        for (let i = 0; i < outlierTags.length; i++) {
          if (eventValue.includes("[" + outlierTags[i] + "]")) {
            eventValue = eventValue.replaceAll("[" + outlierTags[i] + "]", " ")
            tags.add(outlierTags[i])
          }
        }

        let arrayTag = eventValue.match(/\[([^[\]]+)\]/gm);
        if (arrayTag != null) {
          for (let x of arrayTag) {
            tags.add(x.slice(1, -1).toLowerCase());
          }
        }
        let remainingWords = eventValue.replaceAll(/\[(.){1,10}\]/gm, " ");
        for (let x of remainingWords.split(" ")) {
          wordsSearch.add(x.toLowerCase())
        }

        wordsSearch.delete("")
        let filteredQuestions = filter(tags, wordsSearch, tagList.data, questionList.data)
        setQuestions(filteredQuestions)
        setPage({ page: 8 })
      }
    } catch (error) {
      window.alert("Server Error")
    }
    // depending on the response back it would do error cases or just go back to question page

    // await sortNewest(props.setQuestions)
  })()

}
