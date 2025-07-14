import React from 'react';
import QRGenerator from '../components/QRGenerator';
import { Link } from 'react-router-dom';

const ARGeneratorPage = () => {
  // Sample 3D models for demo purposes
  const sampleModels = [
    {
      url: 'https://models.readyplayer.me/63f8bff40e275d9b17308f95.glb',
      name: 'Avatar Model',
      description: 'A sample 3D character model'
    },
    {
      url: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/macbook/model.gltf',
      name: 'Laptop Model',
      description: 'A 3D laptop model example'
    },
    {
      url: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/chair-wooden/model.gltf',
      name: 'Chair Model',
      description: 'A wooden chair 3D model'
    }
  ];

  return (
    <div className="ar-generator-page min-h-screen bg-gradient-to-b from-purple-50 to-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-purple-800">AR QR Code Generator</h1>
          <Link 
            to="/ar/scanner"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none"
          >
            Scan QR Code
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <QRGenerator />
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Sample 3D Models</h2>
            <p className="text-gray-600 mb-4">
              You can use these sample 3D models to test the AR functionality. Click on any model to use it in the generator.
            </p>
            
            <div className="space-y-4">
              {sampleModels.map((model, index) => (
                <div 
                  key={index}
                  className="p-4 border border-gray-200 rounded-md hover:border-purple-300 cursor-pointer"
                  onClick={() => {
                    // Find the QRGenerator component inputs and set values
                    document.getElementById('modelUrl').value = model.url;
                    document.getElementById('modelUrl').dispatchEvent(new Event('input', { bubbles: true }));
                    document.getElementById('modelName').value = model.name;
                    document.getElementById('modelName').dispatchEvent(new Event('input', { bubbles: true }));
                    document.getElementById('modelDescription').value = model.description;
                    document.getElementById('modelDescription').dispatchEvent(new Event('input', { bubbles: true }));
                  }}
                >
                  <h3 className="font-medium text-purple-700">{model.name}</h3>
                  <p className="text-sm text-gray-600">{model.description}</p>
                  <p className="text-xs text-gray-400 truncate mt-2">{model.url}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-purple-50 rounded-md">
              <h3 className="font-medium text-purple-700 mb-2">Instructions:</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 text-sm">
                <li>Enter the URL of a 3D model (GLB or GLTF format)</li>
                <li>Add a name and optional description</li>
                <li>Download the generated QR code</li>
                <li>Use the AR Scanner page to scan the QR code</li>
                <li>View the 3D model in augmented reality!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARGeneratorPage; 