import React, {useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Routes, Route, useLocation} from "react-router-dom";

import './index.css'


import HomePage from './home';
import LeadFinder from './leadFinder/leadfinderMain';


function AppContent() {
  // Main app content 
  return ( 
    <div className='m-0 p-0 bg-slate-50'>
      <Routes> 
        <Route path='/' element={<HomePage/>}/>
        <Route path='/home' element={<HomePage/>}/>
        {/* LeadFinder*/}
        <Route path='/leads' element={<LeadFinder/>}/>
      </Routes>
    </div>
  )
} 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> 
      <AppContent />
    </BrowserRouter>
  </React.StrictMode>,
)
