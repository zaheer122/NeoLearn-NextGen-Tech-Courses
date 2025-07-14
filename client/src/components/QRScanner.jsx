import React, { useRef, useState, useCallback, useEffect } from 'react';
import jsQR from 'jsqr';
import { useNavigate, useLocation } from 'react-router-dom';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const QRScanner = () => {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [modelData, setModelData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the AR viewer page
  const isARViewerPage = location.pathname === '/ar/viewer';

  // Helper: Draw QR code outline
  const drawQRCodeOutline = useCallback((location, context) => {
    context.beginPath();
    context.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
    context.lineTo(location.topRightCorner.x, location.topRightCorner.y);
    context.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
    context.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
    context.closePath();
    context.lineWidth = 4;
    context.strokeStyle = '#FF3B58';
    context.stroke();
  }, []);

  // Validate model URL
  const isValidModelUrl = useCallback((url) => {
    try {
      const parsedUrl = new URL(url);
      const isValidFormat = url.toLowerCase().endsWith('.glb') || url.toLowerCase().endsWith('.gltf');
      const isValidProtocol = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
      return isValidFormat && isValidProtocol;
    } catch {
      return false;
    }
  }, []);

  // Process QR code data centrally
  const processQRCode = useCallback(
    (code) => {
      try {
        const data = JSON.parse(code.data);
        
        // Check if the QR code contains the required fields
        if (!data.modelUrl) {
          setError('QR code does not contain a model URL');
          return false;
        }

        // Handle local files
        if (data.isLocalFile) {
          setError('This QR code contains a local file reference. Local files can only be accessed on the device that created them. Please use a hosted model URL instead.');
          return false;
        }

        // Validate the model URL
        if (!isValidModelUrl(data.modelUrl)) {
          setError('Invalid model URL. Must be a valid HTTP/HTTPS URL ending with .glb or .gltf');
          return false;
        }

        // Validate other fields
        if (!data.name) {
          setError('QR code is missing the model name');
          return false;
        }

        setModelData(data);
        navigate(`/ar/viewer?model=${encodeURIComponent(data.modelUrl)}`);
        return true;
      } catch (e) {
        if (e instanceof SyntaxError) {
          setError('Invalid QR code format. The QR code must contain valid JSON data');
        } else {
          setError('Error processing QR code data');
        }
        console.error('QR code processing error:', e);
        return false;
      }
    },
    [navigate, isValidModelUrl]
  );

  // Request camera permission and start scanning
  const startCamera = useCallback(async () => {
    // Only start camera if we're on the AR viewer page
    if (!isARViewerPage) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasCameraPermission(true);
        setIsScanning(true);
      }
    } catch (err) {
      setError('Camera permission denied or not available');
      setHasCameraPermission(false);
    }
  }, [isARViewerPage]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsScanning(false);
    }
  }, []);

  // Start/stop camera based on route
  useEffect(() => {
    if (isARViewerPage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isARViewerPage, startCamera, stopCamera]);

  // Scan QR code from video stream
  useEffect(() => {
    let animationFrameId;
    let scanAttempts = 0;
    const MAX_SCAN_ATTEMPTS = 3;

    const scanQRCode = () => {
      if (!isScanning || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { willReadFrequently: true });

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Try different inversion attempts
        const inversionMode = scanAttempts % 3 === 0 ? 'dontInvert' : 
                            scanAttempts % 3 === 1 ? 'onlyInvert' : 'attemptBoth';

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: inversionMode,
        });

        if (code) {
          drawQRCodeOutline(code.location, context);
          if (processQRCode(code)) {
            stopCamera();
            return;
          }
        }

        scanAttempts = (scanAttempts + 1) % MAX_SCAN_ATTEMPTS;
      }

      animationFrameId = requestAnimationFrame(scanQRCode);
    };

    if (isScanning) {
      scanQRCode();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isScanning, drawQRCodeOutline, processQRCode, stopCamera]);

  // Trigger file input click
  const triggerFileUpload = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  }, []);

  // Helper function to validate image data
  const validateImageData = (imageData) => {
    return imageData && 
           imageData.data && 
           imageData.width > 0 && 
           imageData.height > 0 && 
           imageData.data.length === imageData.width * imageData.height * 4;
  };

  // Helper function to resize image for better detection
  const resizeImage = (context, width, height, targetSize = 800) => {
    try {
      const scale = Math.min(targetSize / width, targetSize / height);
      const newWidth = Math.floor(width * scale);
      const newHeight = Math.floor(height * scale);

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = newWidth;
      tempCanvas.height = newHeight;
      const tempContext = tempCanvas.getContext('2d', { willReadFrequently: true });

      // Use better quality scaling
      tempContext.imageSmoothingEnabled = true;
      tempContext.imageSmoothingQuality = 'high';
      tempContext.drawImage(context.canvas, 0, 0, newWidth, newHeight);

      // Copy back to original canvas
      context.canvas.width = newWidth;
      context.canvas.height = newHeight;
      context.drawImage(tempCanvas, 0, 0);

      return { width: newWidth, height: newHeight };
    } catch (error) {
      console.error('Error resizing image:', error);
      return { width, height };
    }
  };

  // Helper function to preprocess image for better QR detection
  const preprocessImage = (context, width, height, options = {}) => {
    try {
      if (!width || !height) {
        throw new Error('Invalid image dimensions');
      }

      // Get the image data
      const imageData = context.getImageData(0, 0, width, height);
      if (!validateImageData(imageData)) {
        throw new Error('Invalid image data');
      }

      const data = imageData.data;
      const { brightness = 0, contrast = 1, threshold = 128, sharpen = false } = options;

      // Apply image adjustments
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        
        // Apply brightness and contrast
        let value = avg;
        value = value * contrast + brightness;
        value = Math.max(0, Math.min(255, value));
        
        // Apply threshold
        value = value > threshold ? 255 : 0;
        
        // Set RGB values
        data[i] = value;     // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
      }

      // Apply sharpening if requested
      if (sharpen) {
        const tempData = new Uint8ClampedArray(data);
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            const center = tempData[idx];
            const top = tempData[idx - width * 4];
            const bottom = tempData[idx + width * 4];
            const left = tempData[idx - 4];
            const right = tempData[idx + 4];
            
            // Simple sharpening kernel
            const sharpened = center * 5 - (top + bottom + left + right);
            data[idx] = data[idx + 1] = data[idx + 2] = Math.max(0, Math.min(255, sharpened));
          }
        }
      }

      // Put the processed image data back
      context.putImageData(imageData, 0, 0);
      return true;
    } catch (error) {
      console.error('Error preprocessing image:', error);
      return false;
    }
  };

  // Handle file upload and scan QR code
  const handleFileUpload = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError('File size exceeds 5MB limit');
        return;
      }

      setError(null);
      setIsScanning(false);

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        
        img.onload = () => {
          try {
            const canvas = canvasRef.current;
            if (!canvas) {
              throw new Error('Canvas not available');
            }

            // Ensure image has valid dimensions
            if (!img.width || !img.height) {
              throw new Error('Invalid image dimensions');
            }

            // Set canvas dimensions to match image
            canvas.width = img.width;
            canvas.height = img.height;

            const context = canvas.getContext('2d', { willReadFrequently: true });
            if (!context) {
              throw new Error('Could not get canvas context');
            }

            // Clear and draw the image
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Resize image for better detection
            const { width, height } = resizeImage(context, canvas.width, canvas.height);

            // Process the image multiple times with different settings
            const processImage = async () => {
              try {
                // Try different preprocessing options
                const preprocessingOptions = [
                  {}, // Original image
                  { brightness: 30, contrast: 1.3, threshold: 128 }, // Brighter
                  { brightness: -30, contrast: 1.3, threshold: 128 }, // Darker
                  { brightness: 0, contrast: 1.8, threshold: 128 }, // Higher contrast
                  { brightness: 0, contrast: 0.7, threshold: 128 }, // Lower contrast
                  { brightness: 0, contrast: 1.5, threshold: 128, sharpen: true }, // Sharpened
                  { brightness: 20, contrast: 1.4, threshold: 150 }, // High contrast bright
                  { brightness: -20, contrast: 1.4, threshold: 100 }, // High contrast dark
                ];

                // Try different scanning options
                const scanningOptions = [
                  { inversionAttempts: 'dontInvert' },
                  { inversionAttempts: 'onlyInvert' },
                  { inversionAttempts: 'attemptBoth' }
                ];

                // Try each preprocessing option
                for (const preprocessOpts of preprocessingOptions) {
                  // Apply preprocessing if not the original image
                  if (Object.keys(preprocessOpts).length > 0) {
                    if (!preprocessImage(context, width, height, preprocessOpts)) {
                      continue;
                    }
                  }

                  // Get the image data
                  const imageData = context.getImageData(0, 0, width, height);
                  if (!validateImageData(imageData)) {
                    continue;
                  }

                  // Try each scanning option
                  for (const scanOpts of scanningOptions) {
                    try {
                      const code = jsQR(imageData.data, imageData.width, imageData.height, scanOpts);
                      if (code) {
                        drawQRCodeOutline(code.location, context);
                        if (processQRCode(code)) {
                          return true;
                        }
                      }
                    } catch (scanError) {
                      console.warn('Scan attempt failed:', scanError);
                      continue;
                    }
                  }
                }

                // If we get here, no valid QR code was found
                setError('No valid QR code found in the image. Please ensure the QR code is clear and well-lit.');
                return false;
              } catch (error) {
                console.error('Error in processImage:', error);
                throw error;
              }
            };

            // Start processing
            processImage().catch(err => {
              console.error('Error processing image:', err);
              setError(`Error processing image: ${err.message}. Please try again with a different image.`);
            });
          } catch (error) {
            console.error('Error in image processing setup:', error);
            setError(`Error setting up image processing: ${error.message}. Please try again.`);
          }
        };

        img.onerror = (error) => {
          console.error('Error loading image:', error);
          setError('Error loading image. Please try again with a different image.');
        };

        img.src = event.target.result;
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        setError('Error reading file. Please try again.');
      };

      reader.readAsDataURL(file);
    },
    [drawQRCodeOutline, processQRCode]
  );

  return (
    <div className="qr-scanner-container flex flex-col items-center justify-center h-full p-4">
      <h2 className="text-xl font-bold mb-4">Upload QR Code for AR Model</h2>

      {error && (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-lg w-full">
          {error}
        </div>
      )}

      <div className="scanner-wrapper relative w-full max-w-lg aspect-square mb-6">
        {/* Camera video feed - only show when on AR viewer page */}
        {isARViewerPage && (
          <video
            ref={videoRef}
            className="scanner-video w-full h-full rounded-lg border-2 border-purple-500"
            autoPlay
            playsInline
            muted
          />
        )}

        {/* Canvas for QR code detection */}
        <canvas
          ref={canvasRef}
          className="scanner-canvas absolute top-0 left-0 w-full h-full"
        />

        <div
          className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-300"
          onClick={triggerFileUpload}
          style={{ opacity: modelData ? 0 : 1, pointerEvents: modelData ? 'none' : 'auto' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-purple-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-2-2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m0 0L7.5 9.5"
            />
          </svg>
          <p className="text-purple-700 font-semibold">Tap here to upload a QR code image</p>
        </div>
      </div>

      {/* Camera permission status - only show when on AR viewer page */}
      {isARViewerPage && !hasCameraPermission && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>Camera access is required for live scanning. Please grant camera permissions or use the upload option.</p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
