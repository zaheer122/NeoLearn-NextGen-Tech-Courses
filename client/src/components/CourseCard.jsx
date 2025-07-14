import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from './ui/badge'
import { BookOpen, Users, Star, Clock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const CourseCard = ({ course }) => {
  const navigate = useNavigate()
  
  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden cursor-pointer h-full flex flex-col"
      onClick={() => navigate(`/courses/${course.id}`)}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        y: -8,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: { duration: 0.3, ease: "easeOut" }
      }}
    >
      <div className="relative overflow-hidden">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className="w-full h-48 overflow-hidden"
        >
          <motion.img 
            src={course.image} 
            alt={course.title}
            className="w-full h-48 object-cover transform transition-transform duration-700"
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
          />
        </motion.div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        
        {/* Category badge */}
        {course.category && (
          <Badge className="absolute top-3 right-3 bg-violet-600 hover:bg-violet-700 text-white font-medium px-2.5 py-1">
            {course.category}
          </Badge>
        )}
        
        {/* Course rating */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 bg-gray-900/70 text-yellow-400 text-sm px-2.5 py-1 rounded-md backdrop-blur-sm">
          <Star size={14} fill="currentColor" />
          <span className="font-medium">{(4 + Math.random()).toFixed(1)}</span>
        </div>

        {/* Lecture count pill on bottom right */}
        <div className="absolute bottom-3 right-3 flex items-center space-x-1.5 bg-gray-900/70 text-white text-sm px-2.5 py-1 rounded-md backdrop-blur-sm">
          <BookOpen size={14} />
          <span className="font-medium">{course.lectureCount || 0} lectures</span>
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <motion.h3 
          className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {course.title}
        </motion.h3>
        
        <motion.p 
          className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {course.description}
        </motion.p>
        
        <motion.div 
          className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mt-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-1">
            <Users size={16} className="text-violet-500" />
            <span>{course.enrolled || 0} enrolled</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock size={16} className="text-violet-500" />
            <span>{Math.floor(Math.random() * 10) + 2}h</span>
          </div>
        </motion.div>
        
        {/* Price and action area with visual divider */}
        <motion.div
          className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          
          
          <motion.div
            className="flex items-center gap-1 text-violet-700 dark:text-violet-400 font-semibold"
            whileHover={{ 
              x: 3,
              transition: { type: "spring", stiffness: 400 } 
            }}
          >
            View Details
            <motion.div
              initial={{ x: -5, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <ArrowRight size={16} />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default CourseCard