import './App.css'
import './components/react-grid-styles.css'

import ScheduleGrid from "./components/ScheduleGrid"

function App() {
  return (
    <div>
      <div key={"scheduleGridContainer"} style={{margin: 20}}>
        <ScheduleGrid style={{marginLeft: 40}} />
      </div>
    </div>
  )
}

export default App
