import React, { useState, useEffect } from 'react'

import './App.css'
import './components/react-grid-styles.css'

import { getNumberIterator } from "./misc-util"
import * as gridConstants from "./grid-constants"

import ScheduleGrid from "./components/ScheduleGrid"

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

function App() {
  const [ layout, setLayout ] = useState([]) // TODO: Update layout to have selected course items

  useEffect(() => {
    var newLayout = []
    testCourses.forEach(course => {
      if (course.id == "HIST20") { return }
      if (course.lectures.length === 0) { return }

      var firstLecture = course.lectures[0]
      course.selectedLectureID = firstLecture.id

      for (var lectureSegmentNumber in getNumberIterator(course.lecturesPerWeek))
      {
        var fullLectureSegmentID = course.id + "-" + gridConstants.kLecture + "-" + lectureSegmentNumber
        var lectureDayLetter = Object.keys(firstLecture.times)[lectureSegmentNumber]
        var lectureTime = firstLecture.times[lectureDayLetter]

        var lectureSegmentToAdd = {i: fullLectureSegmentID, x: gridConstants.weekColumns.findIndex(weekColumn => weekColumn.letter === lectureDayLetter), y: 0/*gridConstants.getRow(lectureTime)*/, w: 1, h: lectureTime.duration/(gridConstants.timeIncrement+gridConstants.gridMargins[1])}
        newLayout.push(lectureSegmentToAdd)
      }

      var firstSection = firstLecture.sections[0]
      course.selectedSectionID = firstSection.id

      for (var sectionSegmentNumber in getNumberIterator(course.sectionPerWeek))
      {
        var fullSectionSegmentID = course.id + "-" + gridConstants.kSection + "-" + sectionSegmentNumber
        var sectionDayLetter = Object.keys(firstSection.times)[sectionSegmentNumber]
        var sectionTime = firstSection.times[sectionDayLetter]

        var sectionSegmentToAdd = {i: fullSectionSegmentID, x: gridConstants.weekColumns.findIndex(weekColumn => weekColumn.letter === sectionDayLetter), y: 0/*gridConstants.getRow(sectionTime)*/, w: 1, h: sectionTime.duration/(gridConstants.timeIncrement+gridConstants.gridMargins[1])}
        newLayout.push(sectionSegmentToAdd)
      }
    })

    setLayout(newLayout)
  }, [])

  return (
    <div>
      <div key={"scheduleGridContainer"} style={{margin: 20}}>
        <ScheduleGrid style={{marginLeft: 40}} testCourses={testCourses} layout={layout} setLayout={setLayout} />
      </div>
    </div>
  )
}

export default App
