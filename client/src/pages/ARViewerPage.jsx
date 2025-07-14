import React, { useState } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import ARViewer from '../components/ARViewer';
import { useNavigate } from 'react-router-dom';

const ARViewerPage = () => {
  const navigate = useNavigate();
  const [showControls, setShowControls] = useState(false);

  // Toggle controls visibility
  const toggleControls = () => {
    setShowControls(prev => !prev);
  };

  // Handle going back to scanner
  const handleBack = () => {
    navigate('/ar/scanner');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">AR Viewer</h1>
          <div className="ar-viewer-page h-screen w-full relative" onClick={toggleControls}>
            {/* AR Viewer component takes full screen */}
            <ARViewer />
            
            {/* Minimalistic controls that appear only when tapped */}
            {showControls && (
              <div className="fixed top-4 left-0 right-0 flex justify-center items-center px-4 z-30 animate-fade-in">
                <button
                  onClick={handleBack}
                  className="bg-black bg-opacity-30 text-white px-4 py-2 rounded-full backdrop-blur-sm hover:bg-opacity-50 transition-all"
                >
                  Exit AR
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// CSS Animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
`;
document.head.appendChild(style);

export default ARViewerPage; 