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

const newDroppingElementID = "__dropping-elem__"

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

export { kLecture, kSection, weekColumns, rowHeight, columnCount, gridWidth, gridMargins, timeStart, timeEnd, timeIncrement, totalRows, newDroppingElementID, getTimeDifference, getTime, getRow }
