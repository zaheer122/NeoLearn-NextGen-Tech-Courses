import Hero from "@/components/Hero";
import React, { useState, useEffect } from "react";
import CourseCard from "@/components/CourseCard";
import { Loader2, ChevronRight } from "lucide-react";
import api from '@/lib/axiosConfig';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublishedCourses = async () => {
      try {
        setLoading(true);
        const response = await api.get('/course/published-courses');
        
        if (response.data.success) {
          setCourses(response.data.courses);
        } else {
          setError(response.data.message || 'Failed to fetch courses');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        if (error.response) {
          setError(error.response.data?.message || `Error ${error.response.status}: Failed to fetch courses`)
        } else if (error.request) {
          setError('No response from server. Please check if the server is running.')
        } else {
          setError('An unexpected error occurred. Please try again later.')
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedCourses();
  }, []);

  const formatCourseForCard = (course) => {
    return {
      id: course._id,
      title: course.courseTitle,
      description: course.subTitle || course.description?.slice(0, 120) || 'No description available',
      image: course.courseThumbnail || 'https://via.placeholder.com/640x360?text=Course+Thumbnail',
      category: course.category,
      enrolled: course.enrolledStudents?.length || 0,
      lectureCount: course.lectures?.length || 0
    }
  };

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 12
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Hero />
      
      {/* Courses Section */}
      <motion.section 
        className="py-24 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <motion.div 
          className="mb-16 text-center max-w-3xl mx-auto"
          variants={cardVariants}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
              Featured Courses
            </span>
          </h2>
          <p className="text-lg text-slate-600 mt-4">
            Whether you're just beginning or leveling up your skills, our expert-led courses provide the knowledge you need to succeed in today's digital world.
          </p>
        </motion.div>
        
        {loading ? (
          <div className="flex justify-center items-center h-60 w-full">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
              <p className="text-slate-500 font-medium">Loading courses...</p>
            </div>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-red-50 p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Courses</h3>
            <p className="text-red-600">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4 text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={sectionVariants}
            >
              {courses.slice(0, 6).map((course, index) => (
                <motion.div key={course._id} variants={cardVariants} custom={index}>
                  <CourseCard course={formatCourseForCard(course)} />
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div 
              className="mt-16 text-center"
              variants={cardVariants}
            >
              <Link to="/courses">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-full px-8 py-6 text-lg font-medium shadow-md hover:shadow-xl transition-all duration-300 group"
                >
                  Explore All Courses
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </>
        )}
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        className="py-24 bg-slate-50 border-t border-b border-slate-200"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <span className="inline-block mb-2 text-sm font-semibold text-violet-600 tracking-wider uppercase">TESTIMONIALS</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">What Our Students Say</h2>
            <p className="text-slate-600 text-lg">Hear from our community about how NeoLearn has helped them grow professionally and personally.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Johnson",
                role: "UI/UX Designer",
                quote: "The courses on NeoLearn helped me transition from graphic design to UI/UX with confidence. The instructors are top-notch!",
                image: "https://randomuser.me/api/portraits/men/32.jpg"
              },
              {
                name: "Sophia Chen",
                role: "Full Stack Developer",
                quote: "I went from knowing basic HTML to building full-stack applications in just 3 months. The project-based learning approach really works.",
                image: "https://randomuser.me/api/portraits/women/44.jpg"
              },
              {
                name: "Marcus Williams",
                role: "Data Scientist",
                quote: "The data science curriculum is comprehensive and up-to-date. I landed a job at a tech startup right after completing the advanced course.",
                image: "https://randomuser.me/api/portraits/men/67.jpg"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
              >
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-8 h-full flex flex-col border border-slate-100">
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 mr-4">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="w-14 h-14 rounded-full border-2 border-violet-100 object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                      <p className="text-sm text-violet-600">{testimonial.role}</p>
                    </div>
                  </div>

                  <div className="mt-2 mb-4 text-yellow-400 flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                      </svg>
                    ))}
                  </div>
                  
                  <p className="text-slate-700 italic flex-grow">{testimonial.quote}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      

      {/* CTA Section */}
      <motion.section
        className="py-24 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 rounded-2xl p-8 md:p-12 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-8 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Ready to Start Learning?</h2>
              <p className="text-slate-600 max-w-xl">
                Join NeoLearn today and gain access to hundreds of courses taught by industry experts. 
                Start your journey to mastery now.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-6 rounded-full text-lg font-medium shadow-md hover:shadow-xl transition-all duration-300"
              >
                Get Started
              </Button>
              <Link to="/courses">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-violet-600 text-violet-600 hover:bg-violet-50 px-8 py-6 rounded-full text-lg font-medium"
                >
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
