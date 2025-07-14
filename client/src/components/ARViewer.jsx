import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { useLocation } from 'react-router-dom';

// Fallback cube component for errors or loading
const FallbackCube = ({ color = '#6d28d9' }) => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color={color} />
  </mesh>
);

// Loading indicator component
const LoadingIndicator = () => (
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
    <p className="text-white mt-4 text-center">Loading 3D Model...</p>
  </div>
);

const ARModel = ({ modelUrl, onLoad, onError,hasInteracted }) => {
  const [rotation, setRotation] = useState([0, 0, 0]);
  const modelRef = React.useRef();
  const [hasPermission, setHasPermission] = useState(false);

  // Check and request device orientation permission
  const checkDeviceOrientationPermission = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        setHasPermission(permission === 'granted');
      } catch (error) {
        console.error('Error requesting device orientation permission:', error);
        setHasPermission(false);
      }
    } else {
      setHasPermission(true);
    }
  };

  // Load the 3D model
  const { scene, error } = useGLTF(modelUrl, true);

  useEffect(() => {
    if (error) {
      onError(error);
    } else if (scene) {
      onLoad();
    }
  }, [error, scene, onError, onLoad]);

  useEffect(() => {
    const handleOrientation = (event) => {
      if (modelRef.current && hasPermission) {
        const x = event.beta ? event.beta * (Math.PI / 180) : 0;
        const y = event.gamma ? event.gamma * (Math.PI / 180) : 0;
        setRotation([x * 0.1, y * 0.1, 0]);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [hasPermission]);

  useEffect(() => {
    checkDeviceOrientationPermission();
  }, []);

  if (error) {
    return <FallbackCube color="#ef4444" />;
  }

  if (!scene) {
    return <FallbackCube />;
  }

  return (
    <group
  ref={modelRef}
  scale={[0.5, 0.5, 0.5]}
  rotation={hasInteracted ? undefined : rotation}
>
  <primitive object={scene} />
</group>

  );
};

const ARViewer = () => {
  const location = useLocation();
  const [modelUrl, setModelUrl] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Check WebGL support
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setWebGLSupported(!!gl);
  }, []);

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  const handleModelLoad = () => {
    setIsLoading(false);
  };

  const handleModelError = (error) => {
    setLoadError(error.message);
    setIsLoading(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const model = params.get('model');
    if (model) {
      setModelUrl(model);
    }

    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'environment',
              width: { ideal: window.innerWidth },
              height: { ideal: window.innerHeight },
            },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
          }
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraError("Camera access denied or not available.");
      }
    };

    startCamera();

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleInteraction);
      container.addEventListener('mousedown', handleInteraction);
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (container) {
        container.removeEventListener('touchstart', handleInteraction);
        container.removeEventListener('mousedown', handleInteraction);
      }
    };
  }, [location.search]);

  if (!webGLSupported) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-white p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">WebGL Not Supported</h2>
          <p>Your device or browser does not support WebGL, which is required for AR viewing.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="ar-container h-screen w-full relative overflow-hidden bg-black"
      onClick={handleInteraction}
    >
      {/* Camera video feed */}
      {cameraError ? (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black text-white z-10 p-4">
          <p>{cameraError}</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          autoPlay
          playsInline
          muted
        />
      )}

      {/* Loading indicator */}
      {isLoading && <LoadingIndicator />}

      {/* Error message */}
      {loadError && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-75 text-white z-20 p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Error Loading Model</h2>
            <p>{loadError}</p>
          </div>
        </div>
      )}

      {/* 3D Model Canvas */}
      <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-auto">
        {modelUrl ? (
          <Suspense fallback={<LoadingIndicator />}>
            <Canvas
              shadows
              camera={{ position: [0, 0, 3], fov: 70 }}
              gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
              style={{ background: 'transparent' }}
            >
              <ambientLight intensity={0.6} />
              <spotLight position={[0, 5, 5]} intensity={0.8} castShadow />
              <directionalLight position={[-5, 5, -5]} intensity={0.5} />

              <ARModel 
                modelUrl={modelUrl} 
                onLoad={handleModelLoad}
                onError={handleModelError}
              />

              <Environment preset="sunset" background={false} />
              <OrbitControls
                enableZoom={true}
                enablePan={false}
                minDistance={1.5}
                maxDistance={10}
                dampingFactor={0.2}
                enabled={hasInteracted}
              />
            </Canvas>
          </Suspense>
        ) : (
          <FallbackCube />
        )}
      </div>

      {/* Interaction hint */}
      {!hasInteracted && (
        <div className="absolute bottom-10 left-0 right-0 mx-auto text-center text-white bg-black bg-opacity-30 p-2 w-auto inline-block rounded-full z-20 animate-pulse max-w-xs">
          <p className="text-sm">Tap to interact with the model</p>
        </div>
      )}
    </div>
  );
};

export default ARViewer;
