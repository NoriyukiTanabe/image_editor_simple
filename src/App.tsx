import React from 'react';
import ImageEditor from './components/ImageEditor';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IE</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Image Editor</h1>
            </div>
            <div className="text-sm text-gray-500">
              Simple • Fast • Powerful
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ImageEditor />
      </main>
    </div>
  );
}

export default App;