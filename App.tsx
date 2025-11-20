import React, { useState } from 'react';
import { AppView } from './types';
import { PlaceFinder } from './components/PlaceFinder';
import { ChatAssistant } from './components/ChatAssistant';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.SEARCH);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🍜</span>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Seoul Bites
              </span>
            </div>
            
            <div className="flex space-x-4 items-center">
              <button
                onClick={() => setCurrentView(AppView.SEARCH)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  currentView === AppView.SEARCH
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Find Places
              </button>
              <button
                onClick={() => setCurrentView(AppView.CHAT)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  currentView === AppView.CHAT
                    ? 'bg-purple-50 text-purple-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Ask AI
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {currentView === AppView.SEARCH && (
          <div className="animate-fade-in">
            <PlaceFinder />
          </div>
        )}

        {currentView === AppView.CHAT && (
          <div className="animate-fade-in pt-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Your Personal Seoul Guide</h2>
              <p className="text-gray-500">Ask anything about Korean food culture, history, or tips.</p>
            </div>
            <ChatAssistant />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Seoul Bites. Powered by Google Gemini.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
             <span className="text-xs text-gray-300">Images via Picsum</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;