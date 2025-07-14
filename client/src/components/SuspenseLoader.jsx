import React from 'react';
import { motion } from 'framer-motion';

const SuspenseLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/80 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="relative h-24 w-24 mb-5">
          {/* Pulsing circle */}
          <motion.div
            className="absolute top-0 left-0 h-full w-full rounded-full bg-violet-500"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Spinning dots */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-3 w-3 rounded-full bg-white"
              initial={{
                x: 0,
                y: 0,
              }}
              style={{
                top: '50%',
                left: '50%',
                marginTop: '-6px',
                marginLeft: '-6px',
              }}
              animate={{
                x: Math.cos(i * (Math.PI / 4)) * 40,
                y: Math.sin(i * (Math.PI / 4)) * 40,
                scale: [1, 0.8, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
          
          {/* Center logo */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-white rounded-full flex items-center justify-center"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="h-6 w-6 rounded-full bg-violet-600"></div>
          </motion.div>
        </div>
        
        <motion.p
          className="text-lg font-medium text-white"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
};

export default SuspenseLoader; 