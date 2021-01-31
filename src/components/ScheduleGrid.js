import GridLayout from 'react-grid-layout'
import ScheduleGridLines from "./ScheduleGridLines"

const testItemSize = 10
const testValidTimes = [
  {hour: 10, minute: 30},
  {hour: 14, minute: 25},
  {hour: 20, minute: 40}
]

function ScheduleGrid(props)
{
  const rowHeight = 3
  const columnCount = 5
  const gridWidth = 1200
  const gridMargins = [10, 2]

  const timeStart = {hour: 8, minute: 0}
  const timeEnd = {hour: 22, minute: 0}
  const timeIncrement = 5

  const totalRows = getTimeDifference(timeStart, timeEnd)/timeIncrement

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
    minHeight: rowHeight*testItemSize+gridMargins[1]*8
  }

  const gridStyle = {
    border: "1px solid white",
    height: totalRows*(rowHeight+gridMargins[1]),
    width: gridWidth
  }

  const weekColumns = [
    {id: "monday", letter: "M", name: "Monday"},
    {id: "tuesday", letter: "T", name: "Tuesday"},
    {id: "wednesday", letter: "W", name: "Wednesday"},
    {id: "thursday", letter: "R", name: "Thursday"},
    {id: "friday", letter: "F", name: "Friday"}
  ]

  const layout = [
    {i: 'a1', x: 0, y: 0, w: 1, h: testItemSize},
    {i: 'a2', x: 2, y: 0, w: 1, h: testItemSize},
    {i: 'b', x: 1, y: 0, w: 1, h: testItemSize},
    {i: 'c', x: 4, y: 0, w: 1, h: testItemSize}
  ]

  function getTimeDifference(time1, time2)
  {
    return (time2.hour-time1.hour)*60+(time2.hour-time1.hour >= 0 ? 1 : -1)*(time2.minute-time1.minute)
  }

  function getYPos(time)
  {
    var yPos = gridMargins[1]
    yPos += getRow(time)*rowHeight

    return yPos
  }

  function getTime(row)
  {
    var minutesAfterStart = row*timeIncrement
    return {hour: timeStart.hour+minutesAfterStart/60, minute: timeStart.minute+minutesAfterStart%60}
  }

  function getRow(time)
  {
    return getTimeDifference(timeStart, time)/timeIncrement
  }

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

    layoutItem.y = getRow(newClosestValidTime)
  }

  var dragHandler = (layout, oldItem, newItem, placeholder, event, htmlElement) => {
    if (newItem.i.startsWith("a"))
    {
      var relativeY = /(\d+)px.*?(\d+)px/.exec(htmlElement.style.transform)[2]

      var associatedElement = document.getElementById(htmlElement.dataset.associd)

      var transitionDuration = associatedElement.style.transitionDuration
      associatedElement.style.transitionDuration = "0s"

      var translateString = associatedElement.style.transform
      associatedElement.style.transform = translateString.replace(/, \d+px/g, ", " + relativeY + "px")

      var associatedItem = layout.find(item => item.i === htmlElement.dataset.associd)
      associatedItem.y = newItem.y

      setTimeout(() => {associatedElement.style.transitionDuration = transitionDuration}, 1)
    }

    if (oldItem.y === newItem.y) { return }

    setLayoutItemToClosestTime(placeholder, testValidTimes)
  }

  var dragStopHandler = (layout, oldItem, newItem, placeholder, event, htmlElement) => {
    setLayoutItemToClosestTime(newItem, testValidTimes)

    if (newItem.i.startsWith("a"))
    {
      var associatedItem = layout.find(item => item.i === htmlElement.dataset.associd)
      var associatedElement = document.getElementById(htmlElement.dataset.associd)

      associatedElement.style.transitionDuration = null

      var transitionDuration = associatedElement.style.transitionDuration

      console.log(transitionDuration)

      // associatedItem.y = oldItem.y

      setLayoutItemToClosestTime(associatedItem, testValidTimes, newItem)

      // setTimeout(() => {
      //   associatedElement.style.transitionDuration = transitionDuration
      //
      //
      //   console.log(newItem.y, associatedItem.y)
      // }, 0)
    }
  }

  return (
    <GridLayout style={gridStyle} className="layout" layout={layout} cols={columnCount} rowHeight={rowHeight} width={gridWidth} margin={gridMargins} isBounded={true} isResizeable={false} compactType={null} onDrag={dragHandler} onDragStop={dragStopHandler}>
      <div style={boxContainerStyle} key="a1" id="a1" data-associd="a2">
        <div style={boxStyle}>abcd</div>
      </div>
      <div style={boxContainerStyle} key="a2" id="a2" data-associd="a1">
        <div style={boxStyle}>abcd</div>
      </div>
      <div style={boxContainerStyle} key="b">
        <div style={boxStyle}>bcda</div>
      </div>
      <div style={boxContainerStyle} key="c">
        <div style={boxStyle}>cdab</div>
      </div>
    </GridLayout>
  )
}

export default ScheduleGrid
