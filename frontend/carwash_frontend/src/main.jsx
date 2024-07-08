import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize dark mode state based on user preference or default to false
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return localStorage.getItem('theme') ? localStorage.getItem('theme') === 'dark' : userPrefersDark;
  });

  useEffect(() => {
    // Update the 'theme' in localStorage whenever the theme changes
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`${isDarkMode ? 'bg-charcoal text-white' : 'bg-white text-black'} min-h-screen`}>
      <header className="bg-dark-charcoal p-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Hey there!</h1>
          <p>Are you looking for car washes?</p>
        </div>
        <button onClick={toggleDarkMode} className="bg-gray-200 dark:bg-gray-600 p-2 rounded-full">
          {isDarkMode ? 'Dark' : 'Light'}
        </button>
      </header>
      <main>
        <section className="p-6">
          <h2 className="text-lg font-semibold">Section 1</h2>
          {/* Content for Section 1 */}
        </section>
        <section className="p-6">
          <h2 className="text-lg font-semibold">Section 2</h2>
          {/* Content for Section 2 */}
        </section>
        <section className="p-6">
          <h2 className="text-lg font-semibold">Section 3</h2>
          {/* Content for Section 3 */}
        </section>
      </main>
  </div>
  );
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
