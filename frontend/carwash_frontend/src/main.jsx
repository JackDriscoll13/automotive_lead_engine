import {useState } from 'react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        Hello World
      </div>
    </>
  )
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
