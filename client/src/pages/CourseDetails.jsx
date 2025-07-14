import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setCourse } from '@/redux/courseSlice'
import { setLectures } from '@/redux/lectureSlice'
import { takeBreak, setBreakAlertShown } from '@/redux/screenTimeSlice'
import ReactPlayer from 'react-player/lazy'
import { 
  Clock, 
  Globe, 
  Loader2, 
  PlayCircle, 
  CheckCircle, 
  Lock, 
  BookOpen, 
  Users, 
  Calendar,
  ArrowLeft,
  Twitter,
  Linkedin,
  Globe2,
  Mail,
  FileVideo,
  Maximize,
  X,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import api from '@/lib/axiosConfig'
import { Link } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

const CourseDetails = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user } = useSelector(store => store.auth)
  const { lectures } = useSelector(store => store.lecture)
  const { screenTimeStarted, breakAlertShown } = useSelector(store => store.screenTime)
  
  const [course, setCourseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrollLoading, setEnrollLoading] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)
  const [previewLecture, setPreviewLecture] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [previewLectures, setPreviewLectures] = useState([])
  const [duration, setDuration] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const playerRef = useRef(null)
  const modalPlayerRef = useRef(null)
  const screenTimeTimerRef = useRef(null)

  // Helper function to check if user is enrolled
  const checkIfUserIsEnrolled = (courseData, userId) => {
    if (!courseData || !courseData.enrolledStudents || !userId) {
      return false;
    }
    
    return courseData.enrolledStudents.some(studentId => {
      // Convert both to strings for proper comparison
      const studentIdStr = typeof studentId === 'object' ? studentId._id.toString() : studentId.toString();
      const userIdStr = userId.toString();
      return studentIdStr === userIdStr;
    });
  };

  // Helper function to determine user age group and screen time limit
  const getUserAgeGroup = (dateOfBirth) => {
    if (!dateOfBirth) return { group: 'adult', timeLimit: 6 * 60 * 60 * 1000 }; // Default: 6 hours in ms
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 13) {
      return { group: 'children', timeLimit: 1 * 60 * 60 * 1000 }; // 1 hour in ms
    } else if (age < 18) {
      return { group: 'teenage', timeLimit: 3 * 60 * 60 * 1000 }; // 3 hours in ms
    } else {
      return { group: 'adult', timeLimit: 6 * 60 * 60 * 1000 }; // 6 hours in ms
    }
  };

  // Set up screen time tracker
  useEffect(() => {
    if (!user) return;
    
    // Start tracking screen time
    if (!screenTimeStarted) {
      dispatch(takeBreak());
      
      // Get user age group and time limit
      const { timeLimit } = getUserAgeGroup(user.dateOfBirth);
      
      // Set timer for reminder
      screenTimeTimerRef.current = setTimeout(() => {
        dispatch(setBreakAlertShown(true));
      }, timeLimit);
    }
    
    return () => {
      // Clear timer on unmount
      if (screenTimeTimerRef.current) {
        clearTimeout(screenTimeTimerRef.current);
      }
    };
  }, [user, dispatch, screenTimeStarted]);

  // Reset screen time when user takes a break
  const handleBreakTaken = () => {
    dispatch(takeBreak());
    dispatch(setBreakAlertShown(false));
    
    // Get user age group and time limit
    const { timeLimit } = getUserAgeGroup(user?.dateOfBirth);
    
    // Clear existing timer
    if (screenTimeTimerRef.current) {
      clearTimeout(screenTimeTimerRef.current);
    }
    
    // Set new timer
    screenTimeTimerRef.current = setTimeout(() => {
      dispatch(setBreakAlertShown(true));
    }, timeLimit);
  };

  // Format message based on user age group
  const getBreakReminderMessage = () => {
    const { group } = getUserAgeGroup(user?.dateOfBirth);
    
    switch (group) {
      case 'children':
        return "You've been using the screen for 1 hour. Time to take a break and rest your eyes!";
      case 'teenage':
        return "You've been using the screen for 3 hours. Consider taking a short break to reduce eye strain.";
      case 'adult':
      default:
        return "You've been using the screen for 6 hours. A short break would be beneficial for your eyes and health.";
    }
  };

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        setDebugInfo(null)
        
        if (!courseId || courseId === 'undefined') {
          setError('Invalid course ID');
          setDebugInfo(`CourseId: ${courseId}`);
          return;
        }

        if (!user || !user._id) {
          setError('Please log in to view course details');
          setDebugInfo('No user data found');
          navigate('/login');
          return;
        }
        
        console.log('Fetching course details for ID:', courseId);
        
        // Fetch course details
        const courseResponse = await api.get(`/course/${courseId}`);
        console.log('Course API response:', courseResponse.data);
        
        if (courseResponse.data.success) {
          const courseData = courseResponse.data.course;
          console.log('Course data:', courseData);
          
          // The creator field is now populated from the server
          // No need for additional API calls
          
          setCourseData(courseData);
          
          // Check if user is enrolled
          const enrolled = checkIfUserIsEnrolled(courseData, user._id);
          console.log('User enrolled status:', enrolled);
          setIsEnrolled(enrolled);
        } else {
          setError(courseResponse.data.message || 'Failed to fetch course details');
          setDebugInfo(`API returned success: false: ${courseResponse.data.message}`);
          return;
        }
        
        // Fetch lectures for this course
        const lecturesResponse = await api.get(`/course/${courseId}/lecture`);
        console.log('Lectures API response:', lecturesResponse.data);
        
        if (lecturesResponse.data.success) {
          dispatch(setLectures(lecturesResponse.data.lectures));
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
        
        // Create detailed debug info
        let debugData = {
          message: error.message,
          stack: error.stack,
          request: error.config ? {
            url: error.config.url,
            method: error.config.method,
            headers: error.config.headers,
          } : 'No request config'
        };
        
        if (error.response) {
          debugData.response = {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
          };
          setError(`Error ${error.response.status}: ${error.response.data?.message || 'Failed to fetch course details'}`);
        } else if (error.request) {
          debugData.request = 'Request was made but no response received';
          setError('No response from server. Please check if the server is running.');
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
        
        setDebugInfo(JSON.stringify(debugData, null, 2));
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourseDetails()
    } else {
      setError('Missing course ID');
      setDebugInfo('courseId parameter is missing from URL');
    }
  }, [courseId, dispatch, navigate, user])

  // Find a preview lecture when lectures are loaded
  useEffect(() => {
    if (!lectures) return
    
    console.log("All lectures:", lectures)
    
    // Find all preview lectures
    const previews = lectures.filter(lecture => {
      console.log(`Lecture "${lecture.lectureTitle}" isPreview:`, lecture.isPreview)
      return lecture.isPreview === true
    })
    
    console.log("Preview lectures found:", previews.length > 0 ? previews : "None")
    
    if (previews.length > 0) {
      setPreviewLectures(previews)
      // Set the first preview lecture as the current one
      setPreviewLecture(previews[0])
    }
  }, [lectures])
  
  // Function to select a specific preview lecture
  const selectPreviewLecture = (lectureId) => {
    const selected = previewLectures.find(lecture => lecture._id === lectureId);
    if (selected) {
      setPreviewLecture(selected);
      setIsPlaying(false); // Reset play state when changing videos
    }
  };

  const handleEnrollCourse = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      setEnrollLoading(true)
      
      // Call the enrollment API endpoint
      const response = await api.post(`/course/${courseId}/enroll`);
      console.log('Enrollment response:', response.data);
      
      if (response.data.success) {
        setIsEnrolled(true)
        
        // Update the course data with the new enrollment
        const updatedCourse = response.data.course;
        
        // Make sure we're updating the state correctly
        setCourseData(updatedCourse);
        
        toast.success(response.data.message || 'Successfully enrolled in the course')
      } else {
        toast.error(response.data.message || 'Failed to enroll in the course')
      }
    } catch (error) {
      console.error('Error enrolling in course:', error)
      
      // Create detailed error info for debugging
      let errorDetails = {
        message: error.message,
        code: error.code
      };
      
      // Provide more specific error messages based on the error
      if (error.response) {
        errorDetails.status = error.response.status;
        errorDetails.data = error.response.data;
        toast.error(error.response.data?.message || `Error (${error.response.status}): Failed to enroll in course`)
      } else if (error.request) {
        errorDetails.request = 'No response received';
        toast.error('No response from server. Please check your connection and try again.')
      } else {
        toast.error('Error preparing enrollment request. Please try again later.')
      }
      
      console.log('Enrollment error details:', errorDetails);
    } finally {
      setEnrollLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  // Format seconds to mm:ss format
  const formatDuration = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  const handlePlayerError = (error) => {
    console.error("Error playing video:", error);
    toast.error("Failed to load video preview. Please try again later.");
  }
  
  const toggleFullScreen = () => {
    if (playerRef.current) {
      const player = playerRef.current.getInternalPlayer();
      if (player) {
        if (player.requestFullscreen) {
          player.requestFullscreen();
        } else if (player.webkitRequestFullscreen) {
          player.webkitRequestFullscreen();
        } else if (player.mozRequestFullScreen) {
          player.mozRequestFullScreen();
        } else if (player.msRequestFullscreen) {
          player.msRequestFullscreen();
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        {debugInfo && (
          <div className="mb-4 max-w-2xl">
            <details>
              <summary className="text-sm text-gray-500 cursor-pointer">Debug Information</summary>
              <pre className="text-xs bg-gray-100 p-4 rounded mt-2 overflow-auto max-h-96">{debugInfo}</pre>
            </details>
          </div>
        )}
        <Button onClick={() => navigate('/courses')}>
          Back to Courses
        </Button>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-gray-500 text-xl mb-4">Course not found</p>
        <Button onClick={() => navigate('/courses')}>
          Back to Courses
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Screen time break reminder dialog */}
      <Dialog open={breakAlertShown} onOpenChange={(open) => dispatch(setBreakAlertShown(open))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Time for a break!
            </DialogTitle>
            <DialogDescription>
              {getBreakReminderMessage()}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Health Reminder</AlertTitle>
              <AlertDescription>
                Taking regular breaks helps reduce eye strain and improves focus.
                Try the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => dispatch(setBreakAlertShown(false))}>
              Remind me later
            </Button>
            <Button onClick={handleBreakTaken}>
              I'll take a break
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto px-4 py-8">
       <div className="mb-6">
          <Button 
            variant="ghost" 
            className="flex items-center text-gray-600 hover:text-gray-900"
            onClick={() => navigate('/courses')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Details - Left Section */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {course.courseTitle}
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              {course.subTitle}
            </p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-200">
                {course.category}
              </Badge>
              <div className="flex items-center text-gray-600">
                <Clock size={16} className="mr-1" />
                <span>{course.duration || 0} hours</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Globe size={16} className="mr-1" />
                <span>{course.language || "English"}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users size={16} className="mr-1" />
                <span>{course.enrolledStudents?.length || 0} students</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar size={16} className="mr-1" />
                <span>Created {formatDate(course.createdAt)}</span>
              </div>
            </div>
            
            {course.courseThumbnail && (
              <div className="mb-8">
                <img 
                  src={course.courseThumbnail} 
                  alt={course.courseTitle} 
                  className="w-full lg:w-1/3 rounded-md mb-4 lg:mb-0 shadow-md"
                />
              </div>
            )}
            
            {/* Course Preview Section - Modified for smaller preview with popup */}
            {previewLecture && (
              <Card className="shadow-sm mt-4 ">
                <CardHeader className="bg-gray-100">
                  <div className="flex justify-between items-center ">
                    <h5 className="text-lg font-medium m-0">Course Preview</h5>
                    {/* Show preview badge */}
                    <Badge className="bg-violet-100 text-violet-800">Preview</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <h6 className="text-md font-medium mb-3">{previewLecture.lectureTitle}</h6>
                  
                  {previewLecture.videoUrl ? (
                    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                      <DialogTrigger asChild>
                        {/* Small video thumbnail with play button */}
                        <div className="relative w-100 h-48 cursor-pointer bg-gray-100 rounded-md overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ReactPlayer
                              url={previewLecture.videoUrl}
                              width="100%"
                              height="100%"
                              light={true}
                              playIcon={
                                <div className="bg-violet-600 bg-opacity-80 rounded-full p-4 transition-transform transform hover:scale-110">
                                  <PlayCircle size={36} className="text-white" />
                                </div>
                              }
                              onClickPreview={() => setModalOpen(true)}
                              onDuration={setDuration}
                            />
                          </div>
                          <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                            <Badge className="bg-violet-600 text-white">
                              {formatDuration(duration)}
                            </Badge>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0">
                        <div className="h-300 w-500 relative">
                          <ReactPlayer
                            ref={modalPlayerRef}
                            url={previewLecture.videoUrl}
                            width="100%"
                            height="300px"
                            controls
                            playing={true}
                            onError={handlePlayerError}
                          />
                          <DialogClose className="absolute top-2 right-2 p-1 bg-white bg-opacity-70 rounded-full text-gray-800 hover:bg-opacity-100">
                            <X size={20} />
                          </DialogClose>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold">{previewLecture.lectureTitle}</h3>
                          {previewLecture.description && (
                            <p className="text-sm text-gray-600 mt-2">{previewLecture.description}</p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    // Display when no video URL exists
                    <div className="text-center p-5 bg-gray-100 rounded mb-3 w-100 h-48 flex flex-col items-center justify-center">
                      <FileVideo size={48} className="text-gray-500 mx-auto mb-3" />
                      <h6 className="text-gray-500">Video not available for this preview lecture</h6>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4">
                    <p className="m-0 text-gray-500">
                      <strong>Duration:</strong> {formatDuration(duration)}
                    </p>
                    {!isEnrolled && (
                      <Button
                        className="bg-violet-600 hover:bg-violet-700"
                        onClick={() => handleEnrollCourse()}
                      >
                        Enroll Now
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Tabs defaultValue="about" className="mb-8">
              <TabsList className="mb-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="p-4 bg-white rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">About This Course</h2>
                <div className="prose max-w-none">
                  {course.description ? (
                    <div dangerouslySetInnerHTML={{ __html: course.description }} />
                  ) : (
                    <p className="text-gray-500">No description available for this course.</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="curriculum" className="p-4 bg-white rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Course Curriculum</h2>
                {lectures && lectures.length > 0 ? (
                  <div className="space-y-3">
                    {lectures.map((lecture, index) => (
                      <Card key={lecture._id} className="hover:bg-gray-50 transition">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="mr-3 flex-shrink-0">
                              {index + 1}.
                            </div>
                            <div>
                              <h3 className="font-medium">{lecture.lectureTitle}</h3>
                              {lecture.description && (
                                <p className="text-sm text-gray-500">{lecture.description}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            {lecture.isPreview || isEnrolled ? (
                              <Button 
                                size="sm"
                                variant="outline"
                                className="flex items-center"
                                onClick={() => navigate(`/courses/${courseId}/lecture/${lecture._id}`)}
                              >
                                <PlayCircle className="mr-1 h-4 w-4" />
                                {lecture.isPreview ? 'Preview' : 'Watch'}
                              </Button>
                            ) : (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No lectures available for this course.</p>
                )}
              </TabsContent>
            </Tabs>
            
            {/* Instructor Details Section */}
            <div className="mt-10 p-6 bg-white rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-6">About the Instructor</h2>
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex-shrink-0">
                  {course.creator?.photoUrl ? (
                    <img 
                      src={course.creator.photoUrl} 
                      alt={course.creator.name || 'Instructor'} 
                      className="h-24 w-24 rounded-full object-cover border-2 border-violet-200"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-2xl font-bold">
                      {course.creator?.name ? course.creator.name.charAt(0).toUpperCase() : 'I'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {course.creator?.name || 'Anonymous Instructor'}
                  </h3>
                  
                  {/* Instructor email */}
                  <div className="flex items-center text-gray-600 mb-3">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{course.creator?.email || 'No email available'}</span>
                  </div>
                  
                  {/* Instructor bio */}
                  {course.creator?.description ? (
                    <p className="text-gray-600 mb-4">{course.creator.description}</p>
                  ) : (
                    <p className="text-gray-500 mb-4">This instructor has not added a bio yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Enrollment Card - Right Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-violet-500" />
                </div>
                
                <h3 className="text-2xl font-bold text-center mb-6">
                  Course Information
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-medium">{course.courseLevel || 'All Levels'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{course.duration || 0} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lectures:</span>
                    <span className="font-medium">{lectures?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-medium">{course.language || 'English'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-medium">{course.enrolledStudents?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Instructor:</span>
                    <span className="font-medium">{course.creator?.name || 'Anonymous'}</span>
                  </div>
                </div>
                
                {isEnrolled ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center text-green-600 mb-2">
                      <CheckCircle className="h-6 w-6 mr-2" />
                      <span className="font-medium">Enrolled</span>
                    </div>
                    <Button 
                      className="w-full mt-4"
                      onClick={() => navigate(`/courses/${courseId}/lecture/${lectures[0]?._id}`)}
                      disabled={!lectures || lectures.length === 0}
                    >
                      {lectures && lectures.length > 0 ? 'Start Learning' : 'No Content Yet'}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={handleEnrollCourse}
                    disabled={enrollLoading}
                  >
                    {enrollLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      'Enroll Now'
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetails 