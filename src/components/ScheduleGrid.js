import GridLayout from 'react-grid-layout'
import ScheduleGridLines from "./ScheduleGridLines"

// Testing Vars

const testItemSize = 10
const testValidTimes =
{
  "M":[
    {hour: 10, minute: 30},
    {hour: 14, minute: 25},
    {hour: 17, minute: 40}
  ],
  "T":[
    {hour: 13, minute: 0},
    {hour: 10, minute: 0}
  ],
  "W":[
    {hour: 10, minute: 30},
    {hour: 14, minute: 25},
    {hour: 17, minute: 40}
  ],
  "R":[
    {hour: 13, minute: 0}
  ],
  "F":[]
}

function ScheduleGrid(props)
{
  // Display Variables

  const rowHeight = 4
  const columnCount = 5
  const gridWidth = 1200
  const gridMargins = [10, 0]

  const timeStart = {hour: 7, minute: 45}
  const timeEnd = {hour: 22, minute: 15}
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
    position: "relative",
    top: "0",
    border: "1px solid white",
    height: totalRows*(rowHeight+gridMargins[1]),
    width: gridWidth
  }

  const gridLinesStyle = {

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

  const weekColumns = [
    {id: "monday", letter: "M", name: "Monday"},
    {id: "tuesday", letter: "T", name: "Tuesday"},
    {id: "wednesday", letter: "W", name: "Wednesday"},
    {id: "thursday", letter: "R", name: "Thursday"},
    {id: "friday", letter: "F", name: "Friday"}
  ]

  const layout = [ // TODO: Update layout to have selected class items
    {i: 'a1', x: 0, y: 0, w: 1, h: testItemSize},
    {i: 'a2', x: 2, y: 0, w: 1, h: testItemSize},
    {i: 'b', x: 1, y: 0, w: 1, h: testItemSize},
    {i: 'c', x: 4, y: 0, w: 1, h: testItemSize}
  ]

  // Converter Functions

  function getTimeDifference(time1, time2)
  {
    var time1Minutes = 60*time1.hour+time1.minute
    var time2Minutes = 60*time2.hour+time2.minute
    return time2Minutes-time1Minutes
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
    return {hour: timeStart.hour+Math.floor(minutesAfterStart/60)+Math.floor((timeStart.minute+minutesAfterStart%60)/60), minute: (timeStart.minute+minutesAfterStart%60)%60} // Have to add extra hour if timeStart.minute+minutesAfterStart%60 is greater than 60
  }

  function getRow(time)
  {
    return getTimeDifference(timeStart, time)/timeIncrement
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

    layoutItem.y = getRow(newClosestValidTime)
  }

  // Drag Handlers

  var dragHandler = (layout, oldItem, newItem, placeholder, event, htmlElement) => {
    // TODO: Add detection for column change and set x

    if (newItem.i.startsWith("a")) // TODO: Replace with check of associated class(es) later; Add column checking and move x accordingly
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

    if (oldItem.y === newItem.y && oldItem.x === newItem.x) { return }

    setLayoutItemToClosestTime(placeholder, testValidTimes[weekColumns[placeholder.x].letter])
  }

  var dragStopHandler = (layout, oldItem, newItem, placeholder, event, htmlElement) => {
    setLayoutItemToClosestTime(newItem, testValidTimes[weekColumns[newItem.x].letter])

    //TODO: Eject any items that are in the way

    if (newItem.i.startsWith("a")) // TODO: Replace with check of associated class later
    {
      var associatedItem = layout.find(item => item.i === htmlElement.dataset.associd)
      var associatedElement = document.getElementById(htmlElement.dataset.associd)

      associatedElement.style.transitionDuration = null

      setLayoutItemToClosestTime(associatedItem, testValidTimes[weekColumns[associatedItem.x].letter], newItem)
    }
  }

  layout.forEach(item => {
    setLayoutItemToClosestTime(item, testValidTimes[weekColumns[item.x].letter])
  })

  function getNumberIterator(count)
  {
    return [...Array(count).keys()]
  }

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

  return ( // TODO: Update return html to have selected class items
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
          <GridLayout style={gridStyle} className="layout" layout={layout} cols={columnCount} rowHeight={rowHeight} width={gridWidth} margin={gridMargins} isBounded={true} isResizable={false} compactType={null} preventCollision={true} isDroppable={true} onDrag={dragHandler} onDragStop={dragStopHandler}>
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
        </div>
      </div>
    </div>
  )
}

export default ScheduleGrid
