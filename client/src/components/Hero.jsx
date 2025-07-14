import { Award, Search, User, ChevronDown } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import HeroImg from '../assets/HeroImg.jpg'
import CountUp from 'react-countup'
import HeroModel3D from './HeroModel3D'
import { motion, useScroll, useTransform } from 'framer-motion'

const Hero = () => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { scrollY } = useScroll();
  
  // Parallax effects using scrollY
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  // Floating animation for accent elements
  const floatingAnimation = {
    y: ['-0.5rem', '0.5rem'],
    transition: {
      y: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }
    }
  };

  // Smooth scroll function
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Background gradient animation
  useEffect(() => {
    const bgElement = document.getElementById('hero-bg-gradient');
    if (bgElement) {
      const handleMouseMove = (event) => {
        const { clientX, clientY } = event;
        const x = clientX / window.innerWidth;
        const y = clientY / window.innerHeight;
        
        bgElement.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(139, 92, 246, 0.5), rgba(30, 41, 59, 0) 50%)`;
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <div className='bg-slate-900 relative overflow-hidden p-5'>
      {/* Dynamic background effect */}
      <div id="hero-bg-gradient" className="absolute inset-0 z-0 opacity-60"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
      
      <motion.div 
        className='min-h-[90vh] max-w-7xl mx-auto flex md:flex-row flex-col gap-10 items-center relative z-10 pt-24 md:pt-28 px-4 md:px-6'
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ opacity }}
      >
        {/* text section */}
        <motion.div className='space-y-7 md:w-1/2' variants={itemVariants} style={{ y: y1 }}>
          <motion.h1 
            className='text-4xl mt-8 md:mt-0 md:text-6xl font-extrabold text-gray-200 leading-tight'
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            "Unlock Your <span className='bg-gradient-to-r from-violet-500 to-indigo-400 bg-clip-text text-transparent'>Potential</span>,
            <br/> One Course at a Time."
          </motion.h1>
          
          <motion.p 
            className='text-gray-400 text-lg md:pr-10'
            variants={itemVariants}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            We make Learning simple, smart, and something you'll actually look forward to.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.button 
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl shadow-xl shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-300 transform"
              whileHover={{ scale: 1.05, boxShadow: '0 20px 25px -5px rgba(124, 58, 237, 0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started
            </motion.button>
            
            <motion.button 
              className="px-8 py-4 bg-transparent border-2 border-violet-400/50 text-violet-400 font-semibold rounded-xl backdrop-blur-sm hover:bg-violet-900/10 transition-colors duration-300"
              whileHover={{ scale: 1.05, borderColor: 'rgba(167, 139, 250, 0.8)' }}
              whileTap={{ scale: 0.98 }}
            >
              Explore Courses
            </motion.button>
          </motion.div>
          
          {/* Stats with animated counters */}
          <motion.div 
            className="grid grid-cols-2 gap-6 mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-violet-500/20"
              whileHover={{ y: -5, borderColor: 'rgba(167, 139, 250, 0.5)' }}
            >
              <motion.p className="text-violet-300 text-sm">Active Students</motion.p>
              <motion.h3 className="text-3xl font-bold text-white">
                <CountUp
                  end={150}
                  duration={2.5}
                  enableScrollSpy 
                  scrollSpyDelay={200}
                />+
              </motion.h3>
            </motion.div>
            
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-violet-500/20"
              whileHover={{ y: -5, borderColor: 'rgba(167, 139, 250, 0.5)' }}
            >
              <motion.p className="text-violet-300 text-sm">Certified Courses</motion.p>
              <motion.h3 className="text-3xl font-bold text-white">
                <CountUp
                  end={25}
                  duration={2}
                  enableScrollSpy
                  scrollSpyDelay={200}
                />+
              </motion.h3>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* 3D Model and image section */}
        <motion.div 
          className='md:w-1/2 flex flex-col md:h-[500px] items-center justify-center relative mt-0 md:-mt-12'
          variants={itemVariants}
          style={{ y: y2 }}
        >
          <div className="hidden md:block absolute top-0">
            <HeroModel3D />
          </div>
          
          <motion.div 
            className="relative -mt-4 md:mt-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: isImageLoaded ? 1 : 0, 
              scale: isImageLoaded ? 1 : 0.8 
            }}
            transition={{ duration: 0.5 }}
          >
            <motion.img 
              src={HeroImg} 
              alt="Learning platform" 
              className='w-full md:w-[420px] rounded-xl shadow-2xl shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-500'
              onLoad={() => setIsImageLoaded(true)}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            />
            
            <motion.div 
              className='bg-white/10 backdrop-blur-xl hidden md:flex gap-3 items-center rounded-xl absolute top-[15%] right-10 px-4 py-3 shadow-lg border border-white/20'
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
              whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)' }}
              {...floatingAnimation}
            >
              <div className='rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 p-2 text-white'>
                <User/>
              </div>
              <div>
                <h2 className='font-bold text-2xl text-white'><CountUp end={150} duration={2.5} />+</h2>
                <p className='italic text-sm text-gray-300 leading-none'>Active Students</p>
              </div>
            </motion.div> 

            <motion.div 
              className='bg-white/10 backdrop-blur-xl hidden md:flex gap-3 items-center rounded-xl absolute top-[1%] left-5 px-4 py-3 shadow-lg border border-white/20'
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 100 }}
              whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)' }}
              {...floatingAnimation}
            >
              <div className='rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 p-2 text-white'>
                <Award/>
              </div>
              <div>
                <h2 className='font-bold text-2xl text-white'><CountUp end={25} duration={2} />+</h2>
                <p className='italic text-sm text-gray-300 leading-none'>Certified Courses</p>
              </div>
            </motion.div> 
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer z-20"
        onClick={scrollToFeatures}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        whileHover={{ scale: 1.1 }}
      >
        <motion.div 
          className="flex flex-col items-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <p className="text-gray-400 text-sm mb-2">Discover More</p>
          <ChevronDown className="h-6 w-6 text-violet-400" />
        </motion.div>
      </motion.div>
      
      {/* Feature highlights with animation */}
      <motion.div 
        id="features-section"
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-16 px-4 relative z-10"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {[
          { 
            title: "Expert Instructors", 
            description: "Learn from industry professionals and academics with years of experience",
            color: "from-pink-500 to-violet-500"
          },
          { 
            title: "Interactive Learning", 
            description: "Engage with hands-on exercises, live projects, and interactive quizzes",
            color: "from-violet-500 to-indigo-500"
          },
          { 
            title: "Flexible Schedule", 
            description: "Study at your own pace, anytime, anywhere with our on-demand platform",
            color: "from-indigo-500 to-cyan-500"
          }
        ].map((feature, index) => (
          <motion.div 
            key={index}
            className="bg-slate-800/60 backdrop-blur-md p-8 rounded-xl border border-violet-500/20 h-full"
            whileHover={{ 
              y: -10, 
              boxShadow: "0 20px 40px -5px rgba(124, 58, 237, 0.3)",
              borderColor: "rgba(167, 139, 250, 0.5)"
            }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
          >
            <div className={`inline-block p-3 rounded-lg mb-4 bg-gradient-to-r ${feature.color}`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
            <p className="text-gray-300">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default Hero