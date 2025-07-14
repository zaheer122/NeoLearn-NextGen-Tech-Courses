import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ReactPlayer from 'react-player/lazy';
import { 
  ArrowLeft, 
  ArrowRight, 
  FileVideo, 
  List, 
  Loader2, 
  Lock, 
  Play,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import axios from '@/lib/axiosConfig';
import { toast } from 'sonner';

const LecturePlayer = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { lectures } = useSelector(state => state.lecture);
  
  const [currentLecture, setCurrentLecture] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  const playerRef = useRef(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch course details
        const courseResponse = await axios.get(`/course/${courseId}`);
        if (courseResponse.data.success) {
          setCourse(courseResponse.data.course);
          
          // Check if user is enrolled
          const enrolledStudents = courseResponse.data.course.enrolledStudents || [];
          const userEnrolled = enrolledStudents.some(student => 
            typeof student === 'object' 
              ? student._id === user._id 
              : student === user._id
          );
          setIsEnrolled(userEnrolled);
          
          // If not enrolled and lecture is not preview, redirect
          if (!userEnrolled) {
            const lecturesResponse = await axios.get(`/course/${courseId}/lecture`);
            if (lecturesResponse.data.success) {
              const lectures = lecturesResponse.data.lectures;
              const lecture = lectures.find(lec => lec._id === lectureId);
              
              if (lecture && !lecture.isPreview) {
                toast.error("Please enroll in this course to access this lecture");
                navigate(`/courses/${courseId}`);
                return;
              }
            }
          }
        }
        
        // Fetch lectures if not already in redux store
        if (!lectures || lectures.length === 0) {
          const lecturesResponse = await axios.get(`/course/${courseId}/lecture`);
          if (lecturesResponse.data.success) {
            const lecturesList = lecturesResponse.data.lectures;
            
            // Find the current lecture
            const lecture = lecturesList.find(lec => lec._id === lectureId);
            if (lecture) {
              setCurrentLecture(lecture);
            } else {
              setError("Lecture not found");
            }
          }
        } else {
          // Find current lecture from redux store
          const lecture = lectures.find(lec => lec._id === lectureId);
          if (lecture) {
            setCurrentLecture(lecture);
          } else {
            setError("Lecture not found");
          }
        }
      } catch (error) {
        console.error("Error fetching lecture data:", error);
        setError("Failed to load lecture. Please try again later.");
        toast.error("Failed to load lecture");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId, lectureId, user, lectures, navigate]);
  
  const getNextLecture = () => {
    if (!lectures || !currentLecture) return null;
    
    const currentIndex = lectures.findIndex(lec => lec._id === currentLecture._id);
    if (currentIndex < lectures.length - 1) {
      return lectures[currentIndex + 1];
    }
    return null;
  };
  
  const getPreviousLecture = () => {
    if (!lectures || !currentLecture) return null;
    
    const currentIndex = lectures.findIndex(lec => lec._id === currentLecture._id);
    if (currentIndex > 0) {
      return lectures[currentIndex - 1];
    }
    return null;
  };
  
  const navigateToLecture = (lecture) => {
    if (!lecture) return;
    
    // Check if user can access this lecture
    if (!isEnrolled && !lecture.isPreview) {
      toast.error("Please enroll in this course to access this lecture");
      return;
    }
    
    navigate(`/courses/${courseId}/lecture/${lecture._id}`);
  };
  
  const formatDuration = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        <Button onClick={() => navigate(`/courses/${courseId}`)}>
          Back to Course
        </Button>
      </div>
    );
  }
  
  if (!currentLecture) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-gray-500 text-xl mb-4">Lecture not found</p>
        <Button onClick={() => navigate(`/courses/${courseId}`)}>
          Back to Course
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Navigation */}
      <div className="bg-white shadow p-4 flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/courses/${courseId}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Course
        </Button>
        
        <div className="font-semibold text-lg hidden md:block">
          {course?.courseTitle}: {currentLecture.lectureTitle}
        </div>
        
        <Button 
          variant="ghost" 
          onClick={() => setShowSidebar(!showSidebar)}
          className="md:hidden"
        >
          {showSidebar ? <X size={16} /> : <List size={16} />}
        </Button>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content - Video Player */}
        <div className={`flex-1 p-4 overflow-auto ${showSidebar ? 'md:w-3/4' : 'w-full'}`}>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {currentLecture.videoUrl ? (
              <div className="aspect-video bg-black">
                <ReactPlayer
                  ref={playerRef}
                  url={currentLecture.videoUrl}
                  width="100%"
                  height="100%"
                  controls={true}
                  onDuration={setDuration}
                  onProgress={(state) => setProgress(state.played * 100)}
                />
              </div>
            ) : (
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                <div className="text-center p-6">
                  <FileVideo size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-600">No video available</h3>
                  <p className="text-gray-500 mt-2">This lecture does not have a video.</p>
                </div>
              </div>
            )}
            
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{currentLecture.lectureTitle}</h2>
              
              {currentLecture.description && (
                <div className="mb-6 text-gray-700">
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p>{currentLecture.description}</p>
                </div>
              )}
              
              {/* Navigation buttons */}
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => navigateToLecture(getPreviousLecture())}
                  disabled={!getPreviousLecture()}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Previous Lecture
                </Button>
                
                <Button 
                  onClick={() => navigateToLecture(getNextLecture())}
                  disabled={!getNextLecture()}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700"
                >
                  Next Lecture
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Quiz section if available */}
          {currentLecture.quiz && currentLecture.quiz.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <h3 className="text-xl font-bold">Quiz</h3>
              </CardHeader>
              <CardContent>
                {currentLecture.quiz.map((quiz, index) => (
                  <div key={index} className="mb-6">
                    <h4 className="font-medium mb-3">Question {index + 1}: {quiz.question}</h4>
                    <div className="space-y-2 ml-4">
                      {quiz.options.map((option, optIndex) => (
                        <div 
                          key={optIndex} 
                          className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                        >
                          <input 
                            type="radio" 
                            id={`q${index}-opt${optIndex}`} 
                            name={`quiz-${index}`} 
                          />
                          <label 
                            htmlFor={`q${index}-opt${optIndex}`}
                            className="cursor-pointer"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <Button className="mt-4 bg-violet-600 hover:bg-violet-700">Check Answers</Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Sidebar - Course Lectures */}
        <div 
          className={`bg-white border-l overflow-auto ${
            showSidebar ? 'block w-full md:w-1/4 max-w-xs' : 'hidden'
          }`}
        >
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-bold text-lg">Course Content</h3>
            <p className="text-sm text-gray-500 mt-1">
              {lectures?.length || 0} lecture{lectures?.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="divide-y">
            {lectures?.map((lecture, index) => (
              <div 
                key={lecture._id} 
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  currentLecture._id === lecture._id ? 'bg-violet-50 border-l-4 border-violet-500' : ''
                }`}
                onClick={() => navigateToLecture(lecture)}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <p className="font-medium">
                      {index + 1}. {lecture.lectureTitle}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      {lecture.videoUrl ? (
                        <Play size={14} className="mr-1 text-violet-500" />
                      ) : (
                        <FileVideo size={14} className="mr-1 text-gray-400" />
                      )}
                      <span>
                        {lecture.videoUrl ? 'Video' : 'No video'} 
                        {lecture.isPreview && ' • Preview'}
                      </span>
                    </div>
                  </div>
                  
                  {!isEnrolled && !lecture.isPreview && (
                    <Lock size={16} className="text-gray-400 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturePlayer; 