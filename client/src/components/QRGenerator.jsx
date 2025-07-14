import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const QRGenerator = ({ modelUrl, modelName, modelDescription }) => {
  const [qrValue, setQrValue] = useState('');
  const [customModelUrl, setCustomModelUrl] = useState(modelUrl || '');
  const [customModelName, setCustomModelName] = useState(modelName || '');
  const [customModelDescription, setCustomModelDescription] = useState(modelDescription || '');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [localModelUrl, setLocalModelUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isLocalFile, setIsLocalFile] = useState(false);

  // Validate model URL
  const isValidModelUrl = (url) => {
    try {
      const parsedUrl = new URL(url);
      const isValidFormat = url.toLowerCase().endsWith('.glb') || url.toLowerCase().endsWith('.gltf');
      const isValidProtocol = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
      return isValidFormat && isValidProtocol;
    } catch {
      return false;
    }
  };

  // Generate QR code value as JSON with model information
  useEffect(() => {
    const modelUrlToUse = localModelUrl || customModelUrl;
    if (modelUrlToUse) {
      if (isLocalFile) {
        // For local files, we need to include additional information
        const modelData = {
          modelUrl: modelUrlToUse,
          name: customModelName,
          description: customModelDescription,
          isLocalFile: true,
          fileName: uploadedFile?.name,
          fileSize: uploadedFile?.size,
          fileType: uploadedFile?.type
        };
        setQrValue(JSON.stringify(modelData));
      } else {
        // For remote URLs, validate the URL
        if (!isValidModelUrl(modelUrlToUse)) {
          setError('Invalid model URL. Must be a valid URL ending with .glb or .gltf');
          return;
        }
        setError(null);
        const modelData = {
          modelUrl: modelUrlToUse,
          name: customModelName,
          description: customModelDescription,
          isLocalFile: false
        };
        setQrValue(JSON.stringify(modelData));
      }
    }
  }, [customModelUrl, customModelName, customModelDescription, localModelUrl, isLocalFile, uploadedFile]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
      return;
    }
    
    // Check if it's a .glb or .gltf file
    const fileType = file.name.split('.').pop().toLowerCase();
    if (fileType !== 'glb' && fileType !== 'gltf') {
      setError('Please upload a .glb or .gltf file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setUploadedFile(file);
    setIsLocalFile(true);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    // Create a local blob URL for the file
    const localUrl = URL.createObjectURL(file);
    setLocalModelUrl(localUrl);
    
    // Auto-fill the name if it's empty
    if (!customModelName) {
      setCustomModelName(file.name.split('.')[0]);
    }

    setIsUploading(false);
  };

  // Clear uploaded file
  const clearUploadedFile = () => {
    if (localModelUrl) {
      URL.revokeObjectURL(localModelUrl);
    }
    setUploadedFile(null);
    setLocalModelUrl('');
    setError(null);
    setIsLocalFile(false);
  };

  // Handle URL input change
  const handleUrlChange = (e) => {
    setCustomModelUrl(e.target.value);
    setIsLocalFile(false);
    if (localModelUrl) {
      clearUploadedFile();
    }
  };

  // Handle downloading QR code as image
  const handleDownloadQR = () => {
    const svgElement = document.getElementById('qr-svg');
    if (svgElement) {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Create a new image element
      const img = new Image();
      
      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        // Set canvas dimensions to match SVG
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0);
        
        // Convert canvas to PNG and trigger download
        const pngUrl = canvas.toDataURL('image/png');
        
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${customModelName || 'ar-model'}-qr-code.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    }
  };

  return (
    <div className="qr-generator bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">AR Model QR Code Generator</h2>
      
      {error && (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Upload Model</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-md p-4 mb-4">
          <label className="block w-full">
            <div className="flex flex-col items-center justify-center py-3">
              {uploadedFile ? (
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-gray-800 font-medium">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500">{Math.round(uploadedFile.size / 1024)} KB</p>
                  <button 
                    type="button" 
                    className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    onClick={clearUploadedFile}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-500 mb-1">Drag and drop your model file here</p>
                  <p className="text-xs text-gray-400">or click to browse (.glb or .gltf)</p>
                  <p className="text-xs text-gray-400 mt-1">Max file size: {MAX_FILE_SIZE / (1024 * 1024)}MB</p>
                </>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept=".glb,.gltf" 
                onChange={handleFileUpload}
                disabled={isUploading} 
              />
            </div>
          </label>
        </div>

        {/* Upload progress */}
        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div 
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div className="h-px flex-1 bg-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">OR</span>
          <div className="h-px flex-1 bg-gray-300"></div>
        </div>
        
        <label htmlFor="modelUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Enter Model URL
        </label>
        <input
          type="text"
          id="modelUrl"
          value={customModelUrl}
          onChange={handleUrlChange}
          placeholder="https://example.com/model.glb"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
          disabled={!!localModelUrl}
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter the URL to your 3D model (GLB/GLTF format recommended)
        </p>
      </div>
      
      <div className="mb-4">
        <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 mb-1">
          Model Name
        </label>
        <input
          type="text"
          id="modelName"
          value={customModelName}
          onChange={(e) => setCustomModelName(e.target.value)}
          placeholder="My 3D Model"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="modelDescription" className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          id="modelDescription"
          value={customModelDescription}
          onChange={(e) => setCustomModelDescription(e.target.value)}
          placeholder="Add a description for your 3D model..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
          rows="3"
        />
      </div>
      
      {(localModelUrl || customModelUrl) && !error ? (
        <div className="qr-code-container mb-6 flex justify-center">
          <div className="p-4 bg-white border-2 border-purple-200 rounded-lg">
            <QRCodeSVG
              id="qr-svg"
              value={qrValue}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>
      ) : (
        <div className="qr-placeholder flex justify-center items-center h-52 mb-6 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">Upload a file or enter a URL to generate QR code</p>
        </div>
      )}
      
      <div className="flex justify-center">
        <button
          onClick={handleDownloadQR}
          disabled={!(localModelUrl || customModelUrl) || !!error}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download QR Code
        </button>
      </div>
      
      {isLocalFile && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
          <p className="font-medium">Important Note about Local Files:</p>
          <p className="mt-1">The QR code generated for local files will only work on this device. To share the model with others:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Upload your model to a file hosting service</li>
            <li>Use the URL option above with the hosted file URL</li>
            <li>Or share the model file directly with others</li>
          </ul>
        </div>
      )}
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Scan this QR code with the AR scanner to view your 3D model in augmented reality
        </p>
      </div>
    </div>
  );
};

export default QRGenerator; 