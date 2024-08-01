import React, {useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import '../index.css'

import SearchByLocation from './leadFinderLocation';
import SearchByZipcodes from './leadFinderZipcodes';
// Header component for the Application 
const Header = () => {
  return (
    <header className="bg-charcoal text-white p-4 shadow-md">
      <div className="container mx-auto">
        <h1 className="text-2xl font-semibold">Car Wash Lead Generator</h1>
      </div>
    </header>
  );
};

// Tabs component
const Tabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="flex justify-center border-b">
        {children.map((tab, index) => (
          <button
            key={index}
            className={`py-2 px-4 mx-2 ${activeTab === index ? 'border-b-2 border-charcoal' : 'border-gray-300 text-gray-500 opacity-75'}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div className="p-4">
        {children[activeTab]}
      </div>
    </div>
  );
};

const Tab = ({ children }) => {
  return <div>{children}</div>;
};


// The Main
const LeadFinder = () => {
    const backendUrl = "/api";
   
    return (
      <div className="min-h-screen bg-gray-100">
          <Header/>

          <main className="container mx-auto mt-6 p-4">
            <Tabs>
              <Tab label="General Location Search">
                <SearchByLocation backendUrl={backendUrl}/>
              </Tab>
              <Tab label="Zip Code Search">
                <SearchByZipcodes backendUrl={backendUrl}/>
              </Tab>
              <Tab label="Usage Guide & Documentation">
                {/* Add your UsageGuide component here */}
              </Tab>
            </Tabs>
          </main>
      </div>
    );
  };

export default LeadFinder;