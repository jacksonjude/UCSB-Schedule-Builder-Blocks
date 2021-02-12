import React, { useState } from 'react'

import GridLayout from 'react-grid-layout'
import ScheduleGridLines from "./ScheduleGridLines"
import ScheduleGridPlaceholders from "./ScheduleGridPlaceholders"

// Testing Vars

// ECON 10A is a strange one (W21)

/*

Course:
{
  id: string, id of the course
  name: string, name of the course
  selectedLectureID: string, id of the currently selected lecture id
  selectedSectionID: string, id of the currently selected section id
  lecturesPerWeek: int, number of lectures that happen per week
  sectionPerWeek: int, number of sections that happen per week
  lectures:
  [
    {
      id: string, id of the lecture
      teacher: string, teacher of the lecture
      times:
      {
        (weekday letter index):
        {
          hour: int, start hour of lecture
          minute: int, start minute of lecture
          duration: int, lecture length in minutes
        }
        // End of time
      }
      // End of times
      sections:
      [
        {
          id: string, id of section
          teacher: string, teacher of section
          times:
          {
            (weekday letter index):
            {
              hour: int, start hour of section
              minute: int, start minute of section
              duration: int, lecture length in minutes
            }
            // End of time
          }
          // End of times
        }
        // End of section
      ]
      // End of sections
    }
    // End of lecture
  ]
  // End of lectures
}
// End of course

*/

const kLecture = "lecture"
const kSection = "section"

const weekColumns = [
  {id: "monday", letter: "M", name: "Monday"},
  {id: "tuesday", letter: "T", name: "Tuesday"},
  {id: "wednesday", letter: "W", name: "Wednesday"},
  {id: "thursday", letter: "R", name: "Thursday"},
  {id: "friday", letter: "F", name: "Friday"}
]

const rowHeight = 4
const columnCount = 5
const gridWidth = 1200
const gridMargins = [10, 0]

const timeStart = {hour: 7, minute: 45}
const timeEnd = {hour: 22, minute: 15}
const timeIncrement = 5

const totalRows = getTimeDifference(timeStart, timeEnd)/timeIncrement

const testCourses = [
  {id: "HIST20", name: "History 20", selectedLectureID: null, selectedSectionID: null, lecturesPerWeek: 3, sectionsPerWeek: 1, lectures: [
    {id: "100", teacher: "Mark", times: {
      "M":{hour: 9, minute: 0, duration: 50}, "W":{hour: 9, minute: 0, duration: 50}, "F":{hour: 9, minute: 0, duration: 50}
    }, sections: [
      {id: "101", teacher: "Gary", times: {
        "W":{hour: 13, minute: 0, duration: 50}
      }},
      {id: "102", teacher: "Larry", times: {
        "R":{hour: 15, minute: 0, duration: 50}
      }}
    ]},
    {id: "110", teacher: "James", times: {
      "M":{hour: 16, minute: 0, duration: 50}, "W":{hour: 16, minute: 0, duration: 50}, "F":{hour: 16, minute: 0, duration: 50}
    }, sections: [
      {id: "111", teacher: "Perry", times: {
        "T":{hour: 11, minute: 0, duration: 50}
      }},
      {id: "112", teacher: "Carrey", times: {
        "M":{hour: 15, minute: 0, duration: 50}
      }}
    ]}
  ]},
  {id: "PHYS1", name: "Physics 1", selectedLectureID: null, selectedSectionID: null, lecturesPerWeek: 2, sectionsPerWeek: 1, lectures: [
    {id: "300", teacher: "Fred", times: {
      "T":{hour: 12, minute: 0, duration: 100}, "R":{hour: 12, minute: 0, duration: 100}
    }, sections: [
      {id: "301", teacher: "Rachel", times: {
        "W":{hour: 12, minute: 0, duration: 50}
      }},
      {id: "302", teacher: "Jeremy", times: {
        "R":{hour: 11, minute: 0, duration: 50}
      }}
    ]},
    {id: "310", teacher: "Louis", times: {
      "W":{hour: 10, minute: 0, duration: 100}, "F":{hour: 10, minute: 0, duration: 100}
    }, sections: [
      {id: "311", teacher: "Jerry", times: {
        "F":{hour: 17, minute: 0, duration: 50}
      }},
      {id: "312", teacher: "Terry", times: {
        "F":{hour: 15, minute: 0, duration: 50}
      }}
    ]}
  ]}
]

function getNumberIterator(count)
{
  return [...Array(count).keys()]
}

// Converter Functions

function getTimeDifference(time1, time2)
{
  var time1Minutes = 60*time1.hour+time1.minute
  var time2Minutes = 60*time2.hour+time2.minute
  return time2Minutes-time1Minutes
}

function getTime(row)
{
  var minutesAfterStart = row*timeIncrement
  return {hour: timeStart.hour+Math.floor(minutesAfterStart/60)+Math.floor((timeStart.minute+minutesAfterStart%60)/60), minute: (timeStart.minute+minutesAfterStart%60)%60} // Have to add extra hour if timeStart.minute+minutesAfterStart%60 is greater than 60
}

function getRow(time)
{
  return getTimeDifference(timeStart, time)/timeIncrement
}

var layout = [ // TODO: Update layout to have selected course items

]

testCourses.forEach(course => {
  if (course.lectures.length === 0) { return }

  var firstLecture = course.lectures[0]
  course.selectedLectureID = firstLecture.id

  for (var segmentNumber in getNumberIterator(course.lecturesPerWeek))
  {
    var fullSegmentID = course.id + "-" + kLecture + "-" + segmentNumber
    var lectureDayLetter = Object.keys(firstLecture.times)[segmentNumber]
    var lectureTime = firstLecture.times[lectureDayLetter]
    layout.push({i: fullSegmentID, x: weekColumns.findIndex(weekColumn => weekColumn.letter === lectureDayLetter), y: getRow(lectureTime), w: 1, h: lectureTime.duration/(timeIncrement+gridMargins[1])})
  }

  var firstSection = firstLecture.sections[0]
  course.selectedSectionID = firstSection.id

  for (var segmentNumber in getNumberIterator(course.sectionPerWeek))
  {
    var fullSegmentID = course.id + "-" + kSection + "-" + segmentNumber
    var sectionDayLetter = Object.keys(firstSection.times)[segmentNumber]
    var sectionTime = firstSection.times[sectionDayLetter]
    layout.push({i: fullSegmentID, x: weekColumns.findIndex(weekColumn => weekColumn.letter === sectionDayLetter), y: getRow(lectureTime), w: 1, h: sectionTime.duration/(timeIncrement+gridMargins[1])})
  }
})

// const testItemSize = 10
// const testValidTimes =
// {
//   "M":[
//     {hour: 10, minute: 30},
//     {hour: 14, minute: 25},
//     {hour: 17, minute: 40}
//   ],
//   "T":[
//     {hour: 13, minute: 0},
//     {hour: 10, minute: 0}
//   ],
//   "W":[
//     {hour: 10, minute: 30},
//     {hour: 14, minute: 25},
//     {hour: 17, minute: 40}
//   ],
//   "R":[
//     {hour: 13, minute: 0}
//   ],
//   "F":[]
// }

function ScheduleGrid(props)
{
  // Display Variables

  const boxContainerStyle = {
    display: "block"
  }

  const boxStyle = {
    border: "1px solid white",
    borderRadius: "5px",
    backgroundColor: "rgba(68,68,68,0.8)",
    color: "white",
    paddingLeft: "10px",
    paddingRight: "10px",
  }

  const gridStyle = {
    position: "relative",
    top: "0",
    border: "1px solid white",
    height: totalRows*(rowHeight+gridMargins[1]),
    width: gridWidth,
    borderRadius: 5
  }

  const gridLinesStyle = {

  }

  const gridPlaceholdersStyle = {
    position: "relative",
    top: "0"
  }

  const gridContainerStyle = {
    marginTop: 5,
    marginLeft: 50,
    position: "relative"
  }

  const gridTimeStyle = {
    float: "left",
    height: totalRows*(rowHeight+gridMargins[1]),
    color: "white"
  }

  const gridWeekdayStyle = {
    width: gridWidth+gridContainerStyle.marginLeft+gridMargins[0],
    color: "white"
  }

  function addStyleProperties(styleProperties, stylesToAdd)
  {
    for (var key in stylesToAdd)
    {
      if (!(key in styleProperties))
      {
        styleProperties[key] = stylesToAdd[key]
      }
    }
  }

  // Layout Creation

  function getValidSegmentTimes(courseObject, segmentType, segmentNumber)
  {
    var validSegmentTimes = {"M":[], "T":[], "W":[], "R":[], "F":[]}
    switch (segmentType)
    {
      case kLecture:
      courseObject.lectures.forEach(lecture => {
        var daysWithLecture = Object.keys(lecture.times)
        if (daysWithLecture.length <= segmentNumber) { return }
        var lectureTime = lecture.times[daysWithLecture[segmentNumber]]
        lectureTime.id = lecture.id
        validSegmentTimes[daysWithLecture[segmentNumber]].push(lectureTime)
      })
      break

      case kSection:
      if (courseObject.selectedLectureID == null) { return validSegmentTimes }
      courseObject.lectures.find(lecture => {
        return lecture.id === courseObject.selectedLectureID
      }).sections.forEach(section => {
        var daysWithSection = Object.keys(section.times)
        if (daysWithSection.length <= segmentNumber) { return }
        var sectionTime = section.times[daysWithSection[segmentNumber]]
        sectionTime.id = section.id
        validSegmentTimes[daysWithSection[segmentNumber]].push(sectionTime)
      })
      break
    }

    return validSegmentTimes
  }

  function splitSegmentIDParts(segmentID)
  {
    var courseID = segmentID.split("-")[0] // ID of the course of this item
    var segmentType = segmentID.split("-")[1] // Type of the segment this item represents (lecture, section)
    var segmentNumber = parseInt(segmentID.split("-")[2]) // Position in the week of this segment type for the course (ex. a course may have lecture 2 times a week, so a segment representing lecture 0 for that course would be representing the first one of the week, which may vary depending on the lecture object)

    return [courseID, segmentType, segmentNumber]
  }

  function getValidAssociatedTimes(course, segmentType, associatedSegmentNumber)
  {
    var validAssociatedSegmentTimes = getValidSegmentTimes(course, segmentType, associatedSegmentNumber)

    if (segmentType == kLecture && !course.selectedLectureID || segmentType == kSection && !course.selectedSectionID) { return }

    Object.keys(validAssociatedSegmentTimes).forEach(dayLetter => {
      validAssociatedSegmentTimes[dayLetter] = validAssociatedSegmentTimes[dayLetter].filter(time => {
        return time.id == (segmentType == kLecture ? course.selectedLectureID : course.selectedSectionID)
      })
    })

    return validAssociatedSegmentTimes
  }

  // Closest Time Functions

  function getClosestTime(currentTime, validTimes)
  {
    var closestTime
    var minTimeDifference
    validTimes.forEach(time => {
      var currentTimeDifference = Math.abs(getTimeDifference(currentTime, time))

      if (minTimeDifference == null || currentTimeDifference <  minTimeDifference)
      {
        closestTime = time
        minTimeDifference = currentTimeDifference
        return
      }
    })

    return closestTime
  }

  function setLayoutItemToClosestTime(layoutItem, validTimes, referenceLayoutItem)
  {
    var rowToCheck = referenceLayoutItem ? referenceLayoutItem.y : layoutItem.y

    var newItemTime = getTime(rowToCheck)
    var newClosestValidTime = getClosestTime(newItemTime, validTimes)

    if (newClosestValidTime == null) { return } //TODO: Eject this item to outside

    var newClosestValidTimeRow = getRow(newClosestValidTime)

    if (layoutItem.y != getRow(newClosestValidTime))
    {
      layoutItem.y = getRow(newClosestValidTime)
    }
    else if (referenceLayoutItem != null)
    {
      var itemToMoveHTML = document.getElementById(layoutItem.i)
      var referenceItemHTML = document.getElementById(referenceLayoutItem.i) // Could also try to determine y using function + newClosestValidTime

      setTimeout(() => {
        var relativeY = /(\d+)px.*?(\d+)px/.exec(referenceItemHTML.style.transform)[2]
        var translateString = itemToMoveHTML.style.transform
        itemToMoveHTML.style.transform = translateString.replace(/, \d+px/g, ", " + relativeY + "px")
      }, 0)
    }
  }

  // Drag Handlers

  const [ customPlaceholders, setPlaceholders ] = useState([])

  var dragHandler = (layout, oldItem, newItem, placeholder, event, htmlElement) => {
    // TODO: Add detection for column change and set x

    var [courseID, segmentType, segmentNumber] = splitSegmentIDParts(newItem.i)
    var courseObject = testCourses.find(course => {
      return course.id === courseID
    })
    var validSegmentTimes = getValidSegmentTimes(courseObject, segmentType, segmentNumber)

    var placeholders = []
    Object.values(validSegmentTimes).forEach((timesForColumn, i) => {
      timesForColumn.forEach(item => {
        placeholders.push({column: i, row: getRow(item), numRowSize: newItem.h, color: "deepskyblue"}) // TODO: Set color to subject color
      })
    })
    setPlaceholders(placeholders)

    if (oldItem.y !== newItem.y || oldItem.x !== newItem.x)
    {
      if (validSegmentTimes[weekColumns[placeholder.x].letter].length == 0)
      {
        placeholder.x = oldItem.x
        setLayoutItemToClosestTime(placeholder, validSegmentTimes[weekColumns[oldItem.x].letter])
      }
      else
      {
        setLayoutItemToClosestTime(placeholder, validSegmentTimes[weekColumns[placeholder.x].letter])
      }
    }

    var selectedSegmentID
    var placeholderDay = weekColumns[placeholder.x]
    var placeholderTime = getTime(placeholder.y)
    if (segmentType == kLecture)
    {
      courseObject.lectures.forEach(lecture => {
        Object.keys(lecture.times).forEach(dayLetter => {
          if (dayLetter == placeholderDay.letter && placeholderTime.hour == lecture.times[dayLetter].hour && placeholderTime.minute == lecture.times[dayLetter].minute)
          {
            selectedSegmentID = lecture.id
          }
        })
      })

      courseObject.selectedLectureID = selectedSegmentID
    }
    else if (segmentType == kSection && courseObject.selectedLectureID)
    {
      var lecture = courseObject.lectures.find(lecture => lecture.id == courseObject.selectedLectureID)
      lecture.sections.forEach(section => {
        Object.keys(section.times).forEach(dayLetter => {
          if (dayLetter == placeholderDay.letter && placeholderTime.hour == section.times[dayLetter].hour && placeholderTime.minute == section.times[dayLetter].minute)
          {
            selectedSegmentID = section.id
          }
        })
      })

      courseObject.selectedSectionID = selectedSegmentID
    }

    if (segmentType == kLecture ? courseObject.lecturesPerWeek > 1 : courseObject.sectionsPerWeek > 1) // TODO: Replace with check of associated course(es) later; Add column checking and move x accordingly
    {
      var relativeY = /(\d+)px.*?(\d+)px/.exec(htmlElement.style.transform)[2]

      var associatedIDList = htmlElement.dataset.associd.split(",")

      associatedIDList.forEach(associd => {
        var associatedElement = document.getElementById(associd)
        var associatedSegmentNumber = splitSegmentIDParts(associd)[2]

        if (associatedElement == null) { return }

        var transitionDuration = associatedElement.style.transitionDuration
        associatedElement.style.transitionDuration = "0s"

        var translateString = associatedElement.style.transform
        associatedElement.style.transform = translateString.replace(/, \d+px/g, ", " + relativeY + "px")

        if (placeholder.x != oldItem.x)
        {
          var validAssociatedSegmentTimes = getValidAssociatedTimes(courseObject, segmentType, associatedSegmentNumber)

          var columnWithValidTime
          Object.keys(validAssociatedSegmentTimes).forEach(dayLetter => {
            if (validAssociatedSegmentTimes[dayLetter].length > 0)
            {
              columnWithValidTime = weekColumns.findIndex(weekday => weekday.letter === dayLetter)
            }
          })
          // Move associated segment to columnWithValidTime via translation, probably in the setTimeout call after resetting the transitionDuration
        }

        setTimeout(() => {associatedElement.style.transitionDuration = transitionDuration}, 0)
      })
    }
  }

  var dragStopHandler = (layout, oldItem, newItem, placeholder, event, htmlElement) => {
    setPlaceholders([])

    var [courseID, segmentType, segmentNumber] = splitSegmentIDParts(newItem.i)
    var courseObject = testCourses.find(course => {
      return course.id === courseID
    })

    var validSegmentTimes = getValidSegmentTimes(courseObject, segmentType, segmentNumber)

    if (validSegmentTimes[weekColumns[newItem.x].letter].length == 0)
    {
      if (validSegmentTimes[weekColumns[oldItem.x].letter].length == 0)
      {
        for (var dayLetter in validSegmentTimes) // Could use something like this block for re-organization; USE THIS BLOCK IN THE OTHER HANDLER TO MOVE TRUE PLACEHOLDER
        {
          if (validSegmentTimes[dayLetter].length > 0)
          {
            newItem.x = weekColumns.findIndex(weekday => weekday.letter === dayLetter)
            break
          }
        }
      }
      else
      {
        newItem.x = oldItem.x
      }
    }
    setLayoutItemToClosestTime(newItem, validSegmentTimes[weekColumns[newItem.x].letter])

    //TODO: Eject any items that are in the way

    if (segmentType == kLecture ? courseObject.lecturesPerWeek > 1 : courseObject.sectionsPerWeek > 1) // TODO: Replace with check of associated course later
    {
      var associatedIDList = htmlElement.dataset.associd.split(",")

      associatedIDList.forEach(associd => {
        var associatedItem = layout.find(item => item.i === associd)
        var associatedElement = document.getElementById(associd)

        if (associatedElement == null) { return }

        associatedElement.style.transitionDuration = null

        var associatedSegmentNumber = splitSegmentIDParts(associd)[2]
        var validAssociatedSegmentTimes = getValidAssociatedTimes(courseObject, segmentType, associatedSegmentNumber)

        var columnWithValidTime
        Object.keys(validAssociatedSegmentTimes).forEach(dayLetter => {
          if (validAssociatedSegmentTimes[dayLetter].length > 0)
          {
            columnWithValidTime = weekColumns.findIndex(weekday => weekday.letter === dayLetter)
          }
        })

        associatedItem.x = columnWithValidTime

        setLayoutItemToClosestTime(associatedItem, validAssociatedSegmentTimes[weekColumns[columnWithValidTime].letter], newItem)
      })
    }
  }

  layout.forEach(item => {
    var [courseID, segmentType, segmentNumber] = splitSegmentIDParts(item.i)
    var courseObject = testCourses.find(course => {
      return course.id === courseID
    })
    var validSegmentTimes = getValidSegmentTimes(courseObject, segmentType, segmentNumber)

    setLayoutItemToClosestTime(item, validSegmentTimes[weekColumns[item.x].letter])
  })

  var gridTimes = []
  for (var rowOn in getNumberIterator(totalRows))
  {
    var timeForRow = getTime(rowOn)
    if (timeForRow.minute !== 0) { continue }

    var timeData = {style:{}}
    if (rowOn < 60/timeIncrement)
    {
      timeData.style.marginTop = rowOn*rowHeight-(16+2)/2
    }
    else
    {
      timeData.style.marginTop = 60/timeIncrement*rowHeight-(16+2)
    }
    timeData.style.textAlign = "right"

    var hour24 = timeForRow.hour
    var hour12
    if (hour24 === 0)
    {
      hour12 = "12 AM"
    }
    else if (hour24 < 12)
    {
      hour12 = hour24 + " AM"
    }
    else if (hour24 === 12)
    {
      hour12 = "12 PM"
    }
    else
    {
      hour12 = (hour24-12) + " PM"
    }

    timeData.hour12 = hour12

    gridTimes.push(timeData)
  }

  var gridWeekdays = []
  for (var columnOn in getNumberIterator(columnCount))
  {
    var weekdayData = {style: {display: "inline-flex", justifyContent: "center", fontWeight: "bold"}}
    if (columnOn == 0)
    {
      weekdayData.style.marginLeft = gridContainerStyle.marginLeft+gridMargins[0]+4 // +4 is manual shifting
      weekdayData.style.marginRight = gridMargins[0]
      weekdayData.style.width = gridWidth/columnCount-2*gridMargins[0]
    }
    else
    {
      weekdayData.style.marginLeft = gridMargins[0]
      weekdayData.style.marginRight = gridMargins[0]
      weekdayData.style.width = gridWidth/columnCount-2*gridMargins[0]-2 // -2 is manual shifting
    }

    weekdayData.name = weekColumns[columnOn].name

    gridWeekdays.push(weekdayData)
  }

  // React Return HTML

  return ( // TODO: Update return html to have selected course items
    <div>
      <div style={gridWeekdayStyle}>
        {
          gridWeekdays.map(weekdayData => {
            return (
              <div style={weekdayData.style} key={"weekday-" + weekdayData.name}>
                {weekdayData.name}
              </div>
            )
          })
        }
      </div>
      <div>
        <div style={gridTimeStyle}>
          {
            gridTimes.map(timeData => {
              return (
                <div style={timeData.style} key={"time-" + timeData.hour12}>
                  {timeData.hour12}
                </div>
              )
            })
          }
        </div>
        <div style={gridContainerStyle}>
          <ScheduleGridLines style={gridLinesStyle} width={gridWidth} columnCount={columnCount} rowCount={totalRows} rowHeight={rowHeight} margins={gridMargins} timeStart={timeStart} timeIncrement={timeIncrement} />
          <ScheduleGridPlaceholders style={gridPlaceholdersStyle} placeholders={customPlaceholders} gridMargins={gridMargins} gridWidth={gridWidth} columnCount={columnCount} rowHeight={rowHeight} />
          <GridLayout style={gridStyle} className="layout" layout={layout} cols={columnCount} rowHeight={rowHeight} width={gridWidth} margin={gridMargins} isBounded={true} isResizable={false} compactType={null} preventCollision={true} isDroppable={true} onDrag={dragHandler} onDragStop={dragStopHandler}>
            {
              layout.map(item => { // TODO: setup associd stuff (and in drag handling)
                var itemBoxStyle = {minHeight: rowHeight*item.h+gridMargins[1]*8}
                addStyleProperties(itemBoxStyle, boxStyle)

                var [courseID, segmentType, segmentNumber] = splitSegmentIDParts(item.i)
                var courseObject = testCourses.find(course => {
                  return course.id === courseID
                })

                var numberOfSegmentsPerWeek = segmentType == kLecture ? courseObject.lecturesPerWeek : courseObject.sectionsPerWeek

                var associatedIDs = ""
                for (var idNumber in getNumberIterator(numberOfSegmentsPerWeek))
                {
                  if (idNumber == segmentNumber) { continue }

                  if (associatedIDs != "") { associatedIDs += "," }
                  associatedIDs += courseID + "-" + segmentType + "-" + idNumber
                }

                return (
                  <div style={boxContainerStyle} key={item.i} id={item.i} data-associd={associatedIDs}>
                    <div style={itemBoxStyle}>{item.i}</div>
                  </div>
                )
              })
            }
          </GridLayout>
        </div>
      </div>
    </div>
  )
}

export default ScheduleGrid
