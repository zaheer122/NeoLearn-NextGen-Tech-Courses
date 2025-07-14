import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform, useInView } from 'framer-motion';

const AnimatedBackground = ({ className }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();
  
  // Activate animations when component enters viewport
  useEffect(() => {
    if (isInView) {
      controls.start("animate");
    }
  }, [isInView, controls]);
  
  // Track mouse movement for interactive elements with debouncing for performance
  useEffect(() => {
    let timeoutId = null;
    
    const handleMouseMove = (e) => {
      if (timeoutId) return;
      
      timeoutId = setTimeout(() => {
        setMousePosition({
          x: e.clientX,
          y: e.clientY
        });
        timeoutId = null;
      }, 10); // Small debounce for better performance
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);
  
  // Generate gradient animation values
  const gradientX = useMotionValue(0);
  const gradientY = useMotionValue(0);
  
  useEffect(() => {
    gradientX.set(mousePosition.x / window.innerWidth);
    gradientY.set(mousePosition.y / window.innerHeight);
  }, [mousePosition, gradientX, gradientY]);
  
  // Transform motion values to CSS values with enhanced gradient
  const background = useTransform(
    [gradientX, gradientY],
    ([x, y]) => `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(139, 92, 246, 0.18), rgba(30, 64, 175, 0.07))`
  );

  return (
    <motion.div 
      ref={ref}
      className={`absolute inset-0 overflow-hidden z-0 ${className}`}
      style={{ background }}
      initial="initial"
      animate={controls}
    >
      {/* Frosted glass effect container */}
      <div className="absolute inset-0 backdrop-blur-[2px] backdrop-saturate-150"></div>
      
      {/* Primary animated blobs with improved animations */}
      <motion.div
        className="absolute w-[35rem] h-[35rem] bg-gradient-to-r from-violet-400/30 to-fuchsia-400/20 rounded-full blur-3xl"
        style={{ 
          top: '10%', 
          left: '5%',
          filter: 'blur(120px)'
        }}
        variants={{
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 0.7, scale: 1 }
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
          rotate: [0, 10, 0],
          transition: {
            duration: 20,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: "easeInOut"
          }
        }}
        transition={{ duration: 2 }}
      />
      
      <motion.div
        className="absolute w-[30rem] h-[30rem] bg-gradient-to-r from-blue-400/30 to-cyan-300/20 rounded-full blur-3xl"
        style={{ 
          bottom: '10%', 
          right: '10%',
          filter: 'blur(100px)'
        }}
        variants={{
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 0.65, scale: 1 }
        }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -30, 0],
          y: [0, -50, 0],
          rotate: [0, -15, 0],
          transition: {
            duration: 25,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: "easeInOut"
          }
        }}
        transition={{ duration: 2, delay: 0.3 }}
      />
      
      <motion.div
        className="absolute w-[28rem] h-[28rem] bg-gradient-to-r from-pink-400/30 to-purple-300/20 rounded-full blur-3xl"
        style={{ 
          top: '50%', 
          right: '25%',
          filter: 'blur(90px)'
        }}
        variants={{
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 0.6, scale: 1 }
        }}
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -40, 0],
          y: [0, 40, 0],
          rotate: [0, 20, 0],
          transition: {
            duration: 18,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: "easeInOut"
          }
        }}
        transition={{ duration: 2, delay: 0.6 }}
      />
      
      {/* Interactive spotlight that follows mouse with improved responsiveness */}
      <motion.div 
        className="absolute w-[20rem] h-[20rem] rounded-full opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0) 70%)',
          left: mousePosition.x - 150,
          top: mousePosition.y - 150,
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.2, 0.15],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      />
      
      {/* Modern grid pattern overlay with animation */}
      <motion.svg
        className="absolute inset-0 w-full h-full opacity-5"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        variants={{
          initial: { opacity: 0 },
          animate: { opacity: 0.07 }
        }}
        transition={{ duration: 3 }}
      >
        <defs>
          <pattern
            id="grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.7"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </motion.svg>
      
      {/* Improved animated particles with performance optimizations */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, index) => {
          const size = Math.random() * 4 + 1;
          const speed = Math.random() * 8 + 3;
          const initialX = Math.random() * 100;
          const initialY = Math.random() * 100;
          const delay = Math.random() * 15;
          const opacity = Math.random() * 0.5 + 0.3;

          return (
            <motion.div
              key={index}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                backgroundColor: index % 4 === 0 ? '#a78bfa' : 
                               index % 4 === 1 ? '#93c5fd' : 
                               index % 4 === 2 ? '#f9a8d4' : '#c4b5fd',
                top: `${initialY}%`,
                left: `${initialX}%`,
                boxShadow: `0 0 ${size * 2}px ${size/1.5}px ${
                  index % 4 === 0 ? 'rgba(167, 139, 250, 0.5)' : 
                  index % 4 === 1 ? 'rgba(147, 197, 253, 0.5)' : 
                  index % 4 === 2 ? 'rgba(249, 168, 212, 0.5)' : 'rgba(196, 181, 253, 0.5)'
                }`
              }}
              variants={{
                initial: { opacity: 0 },
                animate: { opacity }
              }}
              animate={{
                y: [0, -70 * speed, 0],
                x: [0, Math.sin(index) * 50, 0],
                opacity: [0, opacity, 0],
                scale: [0, 1, 0],
                transition: {
                  duration: speed,
                  repeat: Infinity,
                  delay: delay,
                  ease: "easeInOut"
                }
              }}
            />
          );
        })}
      </div>
      
      {/* Modern geometric shapes with subtle 3D rotation effects */}
      {[...Array(4)].map((_, index) => {
        const shapes = [
          // Triangle with gradient
          <svg width="40" height="40" viewBox="0 0 40 40">
            <defs>
              <linearGradient id={`triangleGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(167, 139, 250, 0.5)" />
                <stop offset="100%" stopColor="rgba(139, 92, 246, 0.3)" />
              </linearGradient>
            </defs>
            <polygon points="20,0 40,35 0,35" fill={`url(#triangleGradient${index})`} />
          </svg>,
          
          // Square with rounded corners and gradient
          <svg width="40" height="40" viewBox="0 0 40 40">
            <defs>
              <linearGradient id={`squareGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(147, 197, 253, 0.5)" />
                <stop offset="100%" stopColor="rgba(96, 165, 250, 0.3)" />
              </linearGradient>
            </defs>
            <rect width="35" height="35" x="2.5" y="2.5" rx="8" ry="8" fill={`url(#squareGradient${index})`} />
          </svg>,
          
          // Circle with gradient
          <svg width="40" height="40" viewBox="0 0 40 40">
            <defs>
              <radialGradient id={`circleGradient${index}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="rgba(249, 168, 212, 0.5)" />
                <stop offset="100%" stopColor="rgba(244, 114, 182, 0.3)" />
              </radialGradient>
            </defs>
            <circle cx="20" cy="20" r="18" fill={`url(#circleGradient${index})`} />
          </svg>,
          
          // Hexagon with gradient
          <svg width="40" height="40" viewBox="0 0 40 40">
            <defs>
              <linearGradient id={`hexGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(196, 181, 253, 0.5)" />
                <stop offset="100%" stopColor="rgba(167, 139, 250, 0.3)" />
              </linearGradient>
            </defs>
            <polygon points="20,2 38,10 38,30 20,38 2,30 2,10" fill={`url(#hexGradient${index})`} />
          </svg>
        ];
        
        return (
          <motion.div
            key={`shape-${index}`}
            className="absolute opacity-30"
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              perspective: '1000px'
            }}
            variants={{
              initial: { opacity: 0, rotateX: 0, rotateY: 0 },
              animate: { opacity: 0.3, rotateX: 0, rotateY: 0 }
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 40, 0],
              rotateX: [0, 180, 360],
              rotateY: [0, 180, 0],
              scale: [0.8, 1.2, 0.8],
              transition: {
                duration: 30 + index * 5,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut"
              }
            }}
            transition={{ duration: 3, delay: index * 0.5 }}
          >
            {shapes[index % shapes.length]}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default AnimatedBackground; 