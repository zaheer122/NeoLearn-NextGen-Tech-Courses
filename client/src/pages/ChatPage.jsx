import React, { Suspense, useState } from 'react';
import Chat from '../components/Chat';
import ErrorBoundary from '../components/ErrorBoundary';
import SuspenseLoader from '../components/SuspenseLoader';
import { MessageSquareText } from 'lucide-react';

const ChatPage = () => {
  const [key, setKey] = useState(0);

  // Function to reset the Chat component by changing its key
  const handleReset = () => {
    setKey(prevKey => prevKey + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pt-20 md:pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-white shadow-md p-3 rounded-full">
            <MessageSquareText className="h-8 w-8 text-violet-600" />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
          Chat Room
        </h1>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <ErrorBoundary onReset={handleReset}>
            <Suspense fallback={
              <div className="flex justify-center items-center p-10 h-96">
                <SuspenseLoader />
              </div>
            }>
              <Chat key={key} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 