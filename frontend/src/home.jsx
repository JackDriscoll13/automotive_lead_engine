import React from 'react';

// Header component for the Application 
const HomeHeader = () => {
    return (
      <header className="bg-charcoal text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <a href="/home" className="text-2xl font-semibold">
            Qfresheners.com
          </a>
          <nav className="flex space-x-4">
            <a href="/home" className="text-lg hover:underline">Products</a>
            <a href="/home" className="text-lg hover:underline">About</a>
            <a href="/home" className="text-lg hover:underline">Contact</a>
          </nav>
        </div>
      </header>
    );
  };

function HomePage() {
    return (
        <div className="h-screen flex flex-col">
            <HomeHeader/>
            <main className="flex-grow flex flex-col">
                <div className="mt-32 text-center">
                    <h1 className="text-4xl font-bold mb-4 text-teal-600">Welcome to Qfresheners!</h1>
                    <div className="mt-8 p-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 inline-block rounded-lg shadow-lg">
                        <p className="mb-4">This website is still under development. Stay tuned for more updates!</p>
                        <p>If you have any questions about your order, please contact chris at <a href="mailto:chris@qfresheners.com" className="text-blue-500 underline">chris@qfresheners.com</a>.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default HomePage;