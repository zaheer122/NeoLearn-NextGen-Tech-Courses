import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import CourseCard from "@/components/CourseCard";
import { Loader2, Search, Filter, BookOpen, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import api from '@/lib/axiosConfig';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');
  
  useEffect(() => {
    // Set the selected category from URL parameter if available
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    fetchPublishedCourses();
  }, [categoryParam]);
  
  const fetchPublishedCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/course/published-courses');
      
      if (response.data.success) {
        setCourses(response.data.courses);
        
        // Extract unique categories for filter dropdown
        const uniqueCategories = [...new Set(response.data.courses.map(course => course.category))];
        setCategories(uniqueCategories.filter(Boolean)); // Remove empty categories
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
  
  function filterCourses() {
    return courses.filter((course) => {
      const titleMatch = (course.courseTitle || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const subTitleMatch = (course.subTitle || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const descriptionMatch = (course.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const categoryMatch = selectedCategory === "all" || selectedCategory === "" || course.category === selectedCategory;

      return (titleMatch || subTitleMatch || descriptionMatch) && categoryMatch;
    });
  }

  const filteredCourses = filterCourses();
  const hasActiveFilters = searchTerm || (selectedCategory && selectedCategory !== "all");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center mb-6 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium">
            <BookOpen className="w-4 h-4 mr-2" />
            <span>Browse Our Course Collection</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
            Explore Our Courses
          </h1>
          <p className="text-lg text-slate-600">
            Discover a wide range of courses designed to help you acquire new skills and knowledge
          </p>
        </motion.div>
        
        {/* Search and Filter */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row items-stretch gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <Input
                placeholder="Search for courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 border-slate-300 h-12 text-base"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <div className="md:w-64">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white border-slate-300 h-12">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-slate-500" />
                    <SelectValue placeholder="All Categories" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center text-sm text-slate-600">
              <span className="mr-2">Active filters:</span>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="bg-slate-100 px-3 py-1 rounded-full flex items-center">
                    Search: "{searchTerm}"
                    <button onClick={() => setSearchTerm("")} className="ml-1 text-slate-500 hover:text-slate-700">
                      <X size={14} />
                    </button>
                  </span>
                )}
                {selectedCategory && selectedCategory !== "all" && (
                  <span className="bg-slate-100 px-3 py-1 rounded-full flex items-center">
                    Category: {selectedCategory}
                    <button onClick={() => setSelectedCategory("")} className="ml-1 text-slate-500 hover:text-slate-700">
                      <X size={14} />
                    </button>
                  </span>
                )}
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 px-3 py-1 h-auto"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("");
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center items-center h-72">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
              <p className="text-slate-500 font-medium">Loading courses...</p>
            </div>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-red-50 p-8 shadow-sm text-center">
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Courses</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              variant="outline" 
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => fetchPublishedCourses()}
            >
              Try Again
            </Button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <motion.div 
            className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-md mx-auto">
              <svg 
                className="w-24 h-24 mx-auto mb-6 text-slate-300" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No courses found</h3>
              <p className="text-slate-500 mb-6">
                {hasActiveFilters 
                  ? "Try adjusting your search or filter criteria."
                  : "Check back later for new courses."}
              </p>
              {hasActiveFilters && (
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                  }}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-6"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-slate-600">
                Showing <span className="font-medium text-slate-800">{filteredCourses.length}</span> {filteredCourses.length === 1 ? 'course' : 'courses'}
              </p>
            </div>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredCourses.map((course) => (
                <motion.div key={course._id} variants={itemVariants}>
                  <CourseCard course={formatCourseForCard(course)} />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Courses;