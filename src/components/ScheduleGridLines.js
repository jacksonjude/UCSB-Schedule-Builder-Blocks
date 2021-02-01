function ScheduleGridLines(props)
{
  const verticalLineStyle = {
    position: "absolute",
    borderLeft: "4px solid white",
    opacity: 0.5
  }

  const horizontalLineStyle = {
    position: "absolute",
    borderTop: "2px solid white",
    opacity: 0.2
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

  function getNumberIterator(count)
  {
    return [...Array(count).keys()]
  }

  var gridLines = []

  for (var columnOn in getNumberIterator(props.columnCount+1))
  {
    var columnLine = {}
    columnLine.left = columnOn*(props.width-props.margins[0])/(props.columnCount)+props.margins[0]/2-1
    columnLine.height = props.rowCount*(props.rowHeight+props.margins[1])+2
    addStyleProperties(columnLine, verticalLineStyle)

    gridLines.push({key: "columnLine" + columnOn, style: columnLine})
  }

  for (var rowOn in getNumberIterator(props.rowCount))
  {
    var minuteOn = props.timeStart.minute+rowOn*props.timeIncrement
    if (minuteOn % 60 !== 0) { continue }

    var rowLine = {}
    rowLine.left = props.margins[0]-2
    rowLine.top = rowOn*(props.rowHeight+props.margins[1])+props.margins[1]
    rowLine.width = props.width-props.margins[0]-2*2
    addStyleProperties(rowLine, horizontalLineStyle)

    gridLines.push({key: "rowLine" + rowOn, style: rowLine})
  }

  return (
    gridLines.map(lineData => {
      return (
        <div key={lineData.key} style={lineData.style}></div>
      )
    })
  )
}

export default ScheduleGridLines
