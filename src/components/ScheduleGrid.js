import React, { useState, useEffect } from 'react'

import GridLayout from 'react-grid-layout'
import ScheduleGridLines from "./ScheduleGridLines"
import ScheduleGridPlaceholders from "./ScheduleGridPlaceholders"

import { getNumberIterator, addStyleProperties } from "../misc-util"
import * as gridConstants from "../grid-constants"

var shouldFixLayout = true

var currentDropCourseID

var gridTimes = []
var gridWeekdays = []

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
    height: gridConstants.totalRows*(gridConstants.rowHeight+gridConstants.gridMargins[1]),
    width: gridConstants.gridWidth,
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
    height: gridConstants.totalRows*(gridConstants.rowHeight+gridConstants.gridMargins[1]),
    color: "white"
  }

  const gridWeekdayStyle = {
    width: gridConstants.gridWidth+gridContainerStyle.marginLeft+gridConstants.gridMargins[0],
    color: "white"
  }

  // Layout Creation

  function getValidSegmentTimes(courseObject, segmentType, segmentNumber)
  {
    var validSegmentTimes = {"M":[], "T":[], "W":[], "R":[], "F":[]}
    switch (segmentType)
    {
      case gridConstants.kLecture:
      courseObject.lectures.forEach(lecture => {
        var daysWithLecture = Object.keys(lecture.times)
        if (daysWithLecture.length <= segmentNumber) { return }
        var lectureTime = lecture.times[daysWithLecture[segmentNumber]]
        lectureTime.id = lecture.id
        validSegmentTimes[daysWithLecture[segmentNumber]].push(lectureTime)
      })
      break

      case gridConstants.kSection:
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

    if (segmentType == gridConstants.kLecture && !course.selectedLectureID || segmentType == gridConstants.kSection && !course.selectedSectionID) { return }

    Object.keys(validAssociatedSegmentTimes).forEach(dayLetter => {
      validAssociatedSegmentTimes[dayLetter] = validAssociatedSegmentTimes[dayLetter].filter(time => {
        return time.id == (segmentType == gridConstants.kLecture ? course.selectedLectureID : course.selectedSectionID)
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
      var currentTimeDifference = Math.abs(gridConstants.getTimeDifference(currentTime, time))

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

    var newItemTime = gridConstants.getTime(rowToCheck)
    var newClosestValidTime = getClosestTime(newItemTime, validTimes)

    if (newClosestValidTime == null) { return } //TODO: Eject this item to outside

    var newClosestValidTimeRow = gridConstants.getRow(newClosestValidTime)

    if (layoutItem.y != gridConstants.getRow(newClosestValidTime))
    {
      layoutItem.y = gridConstants.getRow(newClosestValidTime)
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

  function setLayoutItemToValidColumn(newItem, oldItem, validWeekTimes)
  {
    if (validWeekTimes[gridConstants.weekColumns[newItem.x].letter].length == 0)
    {
      if (oldItem == null || validWeekTimes[gridConstants.weekColumns[oldItem.x].letter].length == 0)
      {
        for (var dayLetter in validWeekTimes) // Could use something like this block for re-organization
        {
          if (validWeekTimes[dayLetter].length > 0)
          {
            newItem.x = gridConstants.weekColumns.findIndex(weekday => weekday.letter === dayLetter)
            break
          }
        }
      }
      else if (oldItem)
      {
        newItem.x = oldItem.x
      }
    }
  }

  function ejectOverlappingItems()
  {

  }

  // Drag / Drop Handlers

  const [ customPlaceholders, setPlaceholders ] = useState([])

  var dragHandler = (layout, oldItem, newItem, placeholder, event, htmlElement) => {
    // TODO: Add detection for column change and set x

    var itemID = newItem.i

    if (itemID === gridConstants.newDroppingElementID)
    {
      // TODO: Set item to correct size if not already done, could attach multiple divs and position them according to selected placeholder
      itemID = currentDropCourseID + "-" + gridConstants.kLecture + "-" + 0
    }

    var [courseID, segmentType, segmentNumber] = splitSegmentIDParts(itemID)
    var courseObject = props.testCourses.find(course => {
      return course.id === courseID
    })
    if (courseObject == null) { return }
    var validSegmentTimes = getValidSegmentTimes(courseObject, segmentType, segmentNumber)

    var placeholders = []
    Object.values(validSegmentTimes).forEach((timesForColumn, i) => {
      timesForColumn.forEach(item => {
        placeholders.push({column: i, row: gridConstants.getRow(item), numRowSize: newItem.h, color: "deepskyblue"}) // TODO: Set color to subject color
      })
    })
    setPlaceholders(placeholders)

    if (oldItem.y !== newItem.y || oldItem.x !== newItem.x)
    {
      if (validSegmentTimes[gridConstants.weekColumns[placeholder.x].letter].length == 0)
      {
        placeholder.x = oldItem.x
        setLayoutItemToClosestTime(placeholder, validSegmentTimes[gridConstants.weekColumns[oldItem.x].letter])
      }
      else
      {
        setLayoutItemToClosestTime(placeholder, validSegmentTimes[gridConstants.weekColumns[placeholder.x].letter])
      }
    }

    var selectedSegmentID
    var placeholderDay = gridConstants.weekColumns[placeholder.x]
    var placeholderTime = gridConstants.getTime(placeholder.y)
    if (segmentType == gridConstants.kLecture)
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
    else if (segmentType == gridConstants.kSection && courseObject.selectedLectureID)
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

    if (segmentType == (gridConstants.kLecture ? courseObject.lecturesPerWeek > 1 : courseObject.sectionsPerWeek > 1) && htmlElement.dataset.associd) // TODO: Replace with check of associated course(es) later; Add column checking and move x accordingly
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
              columnWithValidTime = gridConstants.weekColumns.findIndex(weekday => weekday.letter === dayLetter)
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
    var courseObject = props.testCourses.find(course => {
      return course.id === courseID
    })

    var validSegmentTimes = getValidSegmentTimes(courseObject, segmentType, segmentNumber)

    setLayoutItemToValidColumn(newItem, oldItem, validSegmentTimes)
    setLayoutItemToClosestTime(newItem, validSegmentTimes[gridConstants.weekColumns[newItem.x].letter])

    //TODO: Eject any items that are in the way

    if (segmentType == (gridConstants.kLecture ? courseObject.lecturesPerWeek > 1 : courseObject.sectionsPerWeek > 1) && htmlElement.dataset.associd) // TODO: Replace with check of associated course later
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
            columnWithValidTime = gridConstants.weekColumns.findIndex(weekday => weekday.letter === dayLetter)
          }
        })

        associatedItem.x = columnWithValidTime

        setLayoutItemToClosestTime(associatedItem, validAssociatedSegmentTimes[gridConstants.weekColumns[columnWithValidTime].letter], newItem)
      })
    }

    if (segmentType == gridConstants.kLecture)
    {
      for (var i in getNumberIterator(courseObject.sectionsPerWeek))
      {
        var validSectionTimes = getValidSegmentTimes(courseObject, gridConstants.kSection, i)
        var sectionItem = layout.find(item => item.i === courseObject.id + "-" + gridConstants.kSection + "-" + i)
        if (sectionItem == null) { continue }

        setLayoutItemToValidColumn(sectionItem, null, validSectionTimes)
        setLayoutItemToClosestTime(sectionItem, validSectionTimes[gridConstants.weekColumns[sectionItem.x].letter])
      }
    }
  }

  var onDrop = (layout, layoutItem, event) => {
    layoutItem.h = 20
    layoutItem.i = currentDropCourseID + "-" + gridConstants.kLecture + "-0"

    // TODO: Add associated items to "layout" here

    props.setLayout(layout)

    setPlaceholders([])
  }

  props.layout.forEach(item => {
    var [courseID, segmentType, segmentNumber] = splitSegmentIDParts(item.i)
    var courseObject = props.testCourses.find(course => {
      return course.id === courseID
    })
    var validSegmentTimes = getValidSegmentTimes(courseObject, segmentType, segmentNumber)

    var itemYBefore = item.y

    setLayoutItemToClosestTime(item, validSegmentTimes[gridConstants.weekColumns[item.x].letter])
  })

  gridTimes = []
  for (var rowOn in getNumberIterator(gridConstants.totalRows))
  {
    var timeForRow = gridConstants.getTime(rowOn)
    if (timeForRow.minute !== 0) { continue }

    var timeData = {style:{}}
    if (rowOn < 60/gridConstants.timeIncrement)
    {
      timeData.style.marginTop = rowOn*gridConstants.rowHeight-(16+2)/2
    }
    else
    {
      timeData.style.marginTop = 60/gridConstants.timeIncrement*gridConstants.rowHeight-(16+2)
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

  gridWeekdays = []
  for (var columnOn in getNumberIterator(gridConstants.columnCount))
  {
    var weekdayData = {style: {display: "inline-flex", justifyContent: "center", fontWeight: "bold"}}
    if (columnOn == 0)
    {
      weekdayData.style.marginLeft = gridContainerStyle.marginLeft+gridConstants.gridMargins[0]+4 // +4 is manual shifting
      weekdayData.style.marginRight = gridConstants.gridMargins[0]
      weekdayData.style.width = gridConstants.gridWidth/gridConstants.columnCount-2*gridConstants.gridMargins[0]
    }
    else
    {
      weekdayData.style.marginLeft = gridConstants.gridMargins[0]
      weekdayData.style.marginRight = gridConstants.gridMargins[0]
      weekdayData.style.width = gridConstants.gridWidth/gridConstants.columnCount-2*gridConstants.gridMargins[0]-2 // -2 is manual shifting
    }

    weekdayData.name = gridConstants.weekColumns[columnOn].name

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
          <ScheduleGridLines style={gridLinesStyle} width={gridConstants.gridWidth} columnCount={gridConstants.columnCount} rowCount={gridConstants.totalRows} rowHeight={gridConstants.rowHeight} margins={gridConstants.gridMargins} timeStart={gridConstants.timeStart} timeIncrement={gridConstants.timeIncrement} />
          <ScheduleGridPlaceholders style={gridPlaceholdersStyle} placeholders={customPlaceholders} gridMargins={gridConstants.gridMargins} gridWidth={gridConstants.gridWidth} columnCount={gridConstants.columnCount} rowHeight={gridConstants.rowHeight} />
          <GridLayout style={gridStyle} className="layout" layout={props.layout} cols={gridConstants.columnCount} rowHeight={gridConstants.rowHeight} width={gridConstants.gridWidth} margin={gridConstants.gridMargins} isBounded={true} isResizable={false} compactType={null} preventCollision={true} isDroppable={true} onDrag={dragHandler} onDragStop={dragStopHandler} onDrop={onDrop}>
            {
              props.layout.map(item => { // TODO: setup associd stuff (and in drag handling)
                var itemBoxStyle = {minHeight: gridConstants.rowHeight*item.h+gridConstants.gridMargins[1]*8}
                addStyleProperties(itemBoxStyle, boxStyle)

                var [courseID, segmentType, segmentNumber] = splitSegmentIDParts(item.i)
                var courseObject = props.testCourses.find(course => {
                  return course.id === courseID
                })
                if (courseObject == null) { return }

                var numberOfSegmentsPerWeek = segmentType == gridConstants.kLecture ? courseObject.lecturesPerWeek : courseObject.sectionsPerWeek

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
          <div>
            <div
              className="droppable-element"
              draggable={true}
              unselectable="on"
              onDragStart={e => {
                // this is a hack for firefox
                // Firefox requires some kind of initialization
                // which we can do by adding this attribute
                // @see https://bugzilla.mozilla.org/show_bug.cgi?id=568313
                e.dataTransfer.setData("text/plain", "")

                currentDropCourseID = "HIST20"
              }}
            >
              Droppable Element (Drag me!)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScheduleGrid
