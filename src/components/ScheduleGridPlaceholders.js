function ScheduleGridPlaceholders(props)
{
  var placeholders = props.placeholders
  var gridMargins = props.gridMargins
  var gridWidth = props.gridWidth
  var columnCount = props.columnCount
  var rowHeight = props.rowHeight

  document.querySelectorAll(".react-grid-item.react-grid-placeholder").forEach(placeholder => {
    placeholder.style.background = placeholders[0] ? placeholders[0].color : "deepskyblue"
  })

  return (
    placeholders.map(placeholderData => {
      var placeholderStyle = {position: "absolute", outlineRadius: 5, outline: "2px dashed rgba(0, 191, 255, 1)", opacity: 0.7, background: "rgba(0, 149, 199, 0.2)"} //TODO: Change outline to have rounded corners, maybe even thicker:: https://stackoverflow.com/questions/2771171/control-the-dashed-border-stroke-length-and-distance-between-strokes

      placeholderStyle.marginLeft = gridMargins[0]+(gridWidth-gridMargins[0])/columnCount*placeholderData.column+1 // Manual shifting by 1 due to grid border?
      placeholderStyle.marginTop = gridMargins[1]+placeholderData.row*(rowHeight+gridMargins[1])+1 // Manual shifting by 1 due to grid border?

      placeholderStyle.width = (gridWidth-gridMargins[0])/columnCount-gridMargins[0]
      placeholderStyle.height = rowHeight*placeholderData.numRowSize

      placeholderStyle.outlineColor = placeholderData.color

      return (
        <div key={"placeholder-" + placeholderData.column + "-" + placeholderData.row} style={placeholderStyle}>
        </div>
      )
    })
  )
}

export default ScheduleGridPlaceholders
