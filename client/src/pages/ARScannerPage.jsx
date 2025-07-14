import React from 'react';
import QRScanner from '../components/QRScanner';
import { Link } from 'react-router-dom';

const ARScannerPage = () => {
  return (
    <div className="ar-scanner-page min-h-screen bg-gradient-to-b from-purple-50 to-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-purple-800">AR Scanner</h1>
          <Link 
            to="/ar/generator"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none"
          >
            Create QR Code
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <QRScanner />
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">How to Use AR Scanner</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Grant camera permissions when prompted</li>
            <li>Point your camera at a valid AR model QR code</li>
            <li>Hold steady until the QR code is recognized</li>
            <li>The app will automatically load the 3D model in AR view</li>
            <li>Move your device around to view the 3D model from different angles</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ARScannerPage; 