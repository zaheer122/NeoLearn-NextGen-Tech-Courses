import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { takeBreak } from '@/redux/screenTimeSlice'
import api from '@/lib/axiosConfig'
import { toast } from 'sonner'
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  GraduationCap, 
  BarChart, 
  CheckCircle, 
  PlayCircle, 
  AlertCircle,
  Search,
  ChevronRight,
  User,
  Bell,
  Calendar as CalendarIcon,
  Timer,
  Settings,
  Info
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

const StudentDashboard = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector(store => store.auth)
  const { totalScreenTime, screenTimeStarted } = useSelector(store => store.screenTime)
  
  // Local state for display enhancement
  const [displayTime, setDisplayTime] = useState(0)
  const displayTimeRef = useRef(null)
  
  // Update display time more frequently for smoother UI
  useEffect(() => {
    // Set initial display time from Redux
    setDisplayTime(totalScreenTime)
    
    // Clear any existing interval
    if (displayTimeRef.current) {
      clearInterval(displayTimeRef.current)
    }
    
    // Only start if we have a valid start time
    if (screenTimeStarted) {
      // Update local display time every 100ms for smoother counter
      displayTimeRef.current = setInterval(() => {
        const elapsed = Date.now() - screenTimeStarted
        setDisplayTime(elapsed)
      }, 100)
    }
    
    return () => {
      if (displayTimeRef.current) {
        clearInterval(displayTimeRef.current)
      }
    }
  }, [screenTimeStarted, totalScreenTime])
  
  const [loading, setLoading] = useState(true)
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [completedLectures, setCompletedLectures] = useState({})
  const [totalLectures, setTotalLectures] = useState({})
  const [searchInput, setSearchInput] = useState('')
  const [stats, setStats] = useState({
    totalCoursesEnrolled: 0,
    completedCourses: 0,
    totalHoursSpent: 0,
    daysActive: 0
  })
  
  // Remove local screen time state, using Redux instead
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([])
  const [notifications, setNotifications] = useState([])
  
  // Format milliseconds to hours:minutes:seconds
  const formatScreenTime = (milliseconds) => {
    if (!milliseconds) return '00:00:00';
    
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  // Reset screen time when user takes a break
  const handleBreakTaken = () => {
    console.log("Taking a break - resetting timer");
    dispatch(takeBreak());
    toast.success("Break taken! Screen time reset.");
  };

  // Helper function to determine user age group and screen time limit
  const getUserAgeGroup = (dateOfBirth) => {
    if (!dateOfBirth) return { group: 'adult', timeLimit: 6 * 60 * 1000 }; // FOR TESTING: 6 minutes
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // FOR TESTING: Using much shorter times
    if (age < 13) {
      return { group: 'children', timeLimit: 1 * 60 * 1000 }; // 1 minute
    } else if (age < 18) {
      return { group: 'teenage', timeLimit: 3 * 60 * 1000 }; // 3 minutes
    } else {
      return { group: 'adult', timeLimit: 6 * 60 * 1000 }; // 6 minutes
    }
  };

  // Format message based on user age group
  const getBreakReminderMessage = () => {
    const { group } = getUserAgeGroup(user?.dateOfBirth);
    
    switch (group) {
      case 'children':
        return "You've been studying for 1 minute. Time to take a break and rest your eyes!";
      case 'teenage':
        return "You've been studying for 3 minutes. Consider taking a short break to reduce eye strain.";
      case 'adult':
      default:
        return "You've been studying for 6 minutes. A short break would be beneficial for your eyes and health.";
    }
  };

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        
        if (!user || !user._id) {
          navigate('/login');
          return;
        }
        
        // Fetch all published courses using the correct endpoint
        const response = await api.get('/course/published-courses');
        
        if (response.data.success) {
          // Filter courses where user is enrolled
          const allCourses = response.data.courses;
          const userEnrolledCourses = allCourses.filter(course => 
            course.enrolledStudents && 
            course.enrolledStudents.some(studentId => {
              // Convert both to strings for proper comparison
              const studentIdStr = typeof studentId === 'object' ? studentId._id.toString() : studentId.toString();
              return studentIdStr === user._id.toString();
            })
          );
          
          // Set enrolled courses
          setEnrolledCourses(userEnrolledCourses);
          
          // Update total courses enrolled stat
          setStats(prev => ({
            ...prev,
            totalCoursesEnrolled: userEnrolledCourses.length
          }));
          
          // Track lecture data for each course
          const completedCoursesCount = 0;
          const totalTimeSpent = 0;
          const activityArray = [];
          
          // For each enrolled course, fetch lectures
          for (const course of userEnrolledCourses) {
            const lecturesResponse = await api.get(`/course/${course._id}/lecture`);
            
            if (lecturesResponse.data.success && lecturesResponse.data.lectures) {
              const lectures = lecturesResponse.data.lectures;
              const totalCourseLectures = lectures.length;
              
              // Store the total lectures count
              setTotalLectures(prev => ({
                ...prev,
                [course._id]: totalCourseLectures
              }));
              
              // For a real application, we would fetch the user's course progress from the backend
              // Since we don't have this data yet, we'll set initial progress to 0 for each course
              setCompletedLectures(prev => ({
                ...prev,
                [course._id]: 0 // Start with 0 completed lectures instead of random
              }));
              
              // Add course enrollment to activity
              if (course.createdAt) {
                activityArray.push({
                  id: `course-${course._id}`,
                  action: 'Enrolled in course',
                  course: course.courseTitle,
                  courseId: course._id,
                  timestamp: new Date(course.createdAt).toISOString()
                });
              }
            }
          }
          
          // Sort activities by timestamp (newest first)
          activityArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setRecentActivity(activityArray.slice(0, 5)); // Get most recent 5 activities
          
          // Set real stats - currently only the enrolled courses count is truly real
          // The rest would need additional backend endpoints to track this data
          setStats(prev => ({
            ...prev,
            completedCourses: 0, // This would come from the backend in a real app
            totalHoursSpent: 0,  // This would come from the backend in a real app
            daysActive: 1        // Just starting with day 1
          }));
          
          // Clear mock data for deadlines and notifications
          setUpcomingDeadlines([]);
          setNotifications([
            {
              id: 'welcome',
              message: 'Welcome to your student dashboard',
              time: 'just now',
              read: false
            }
          ]);
          
        } else {
          toast.error('Failed to fetch courses');
        }
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        toast.error('Error fetching your courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnrolledCourses();
  }, [user, navigate]);
  
  const calculateProgress = (courseId) => {
    const completed = completedLectures[courseId] || 0;
    const total = totalLectures[courseId] || 1; // Avoid division by zero
    return Math.round((completed / total) * 100);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };
  
  const filteredCourses = enrolledCourses.filter(course => 
    course.courseTitle.toLowerCase().includes(searchInput.toLowerCase()) ||
    (course.subTitle && course.subTitle.toLowerCase().includes(searchInput.toLowerCase()))
  );
  
  // Function to handle marking lecture as completed
  const handleMarkLectureAsCompleted = async (courseId) => {
    // In a real application, you would call an API to mark a lecture as completed
    // For now, we'll just increment the completed lecture count for demo purposes
    setCompletedLectures(prev => ({
      ...prev,
      [courseId]: Math.min((prev[courseId] || 0) + 1, totalLectures[courseId] || 1)
    }));
    
    toast.success("Progress updated. In a complete application, this would be saved to the server.");
  };
  
  // Render the screen time card
  const renderScreenTimeCard = () => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Timer className="mr-2 h-5 w-5 text-blue-500" />
          Screen Time Tracker
        </CardTitle>
        <CardDescription>
          Monitor your daily screen time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-center my-4">
          {formatScreenTime(displayTime)}
        </div>
        
        <div className="text-sm text-gray-500 text-center mt-2">
          {screenTimeStarted ? (
            <>Started at {new Date(screenTimeStarted).toLocaleTimeString()}</>
          ) : (
            <>Not tracking</>
          )}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={handleBreakTaken}
        >
          Take a Break
        </Button>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'Student'}!</h1>
          <p className="text-gray-600">Track your progress and continue your learning journey.</p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="bg-violet-100 rounded-full p-3 mb-4">
                <BookOpen className="h-7 w-7 text-violet-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalCoursesEnrolled}</h3>
              <p className="text-gray-500">Enrolled Courses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="bg-green-100 rounded-full p-3 mb-4">
                <GraduationCap className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.completedCourses}</h3>
              <p className="text-gray-500">Completed Courses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="bg-blue-100 rounded-full p-3 mb-4">
                <Clock className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalHoursSpent}</h3>
              <p className="text-gray-500">Hours of Learning</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="bg-amber-100 rounded-full p-3 mb-4">
                <Calendar className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stats.daysActive}</h3>
              <p className="text-gray-500">Days Active</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course List */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>My Courses</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input 
                      placeholder="Search courses..." 
                      className="pl-8"
                      value={searchInput}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredCourses.length > 0 ? (
                  <div className="space-y-4">
                    {filteredCourses.map(course => (
                      <div key={course._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col md:flex-row gap-4 mb-2">
                          {course.courseThumbnail ? (
                            <img 
                              src={course.courseThumbnail} 
                              alt={course.courseTitle} 
                              className="rounded-md w-full md:w-32 h-20 object-cover"
                            />
                          ) : (
                            <div className="bg-gray-200 rounded-md w-full md:w-32 h-20 flex items-center justify-center">
                              <BookOpen className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium text-lg mb-1">{course.courseTitle}</h3>
                              <Badge 
                                variant={calculateProgress(course._id) === 100 ? "success" : "default"}
                                className={calculateProgress(course._id) === 100 ? "bg-green-500" : "bg-violet-500"}
                              >
                                {calculateProgress(course._id) === 100 ? 'Completed' : 'In Progress'}
                              </Badge>
                            </div>
                            <p className="text-gray-500 text-sm mb-3">{course.subTitle || 'No description available'}</p>
                            
                            <div className="mt-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{calculateProgress(course._id)}%</span>
                              </div>
                              <Progress value={calculateProgress(course._id)} className="h-2" />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button 
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            onClick={() => navigate(`/courses/${course._id}`)}
                          >
                            View Details
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            onClick={() => handleMarkLectureAsCompleted(course._id)}
                          >
                            Mark Progress
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => {
                              // Find first lecture ID from course
                              api.get(`/course/${course._id}/lecture`)
                                .then(response => {
                                  if (response.data.success && response.data.lectures && response.data.lectures.length > 0) {
                                    navigate(`/courses/${course._id}/lecture/${response.data.lectures[0]._id}`);
                                  } else {
                                    navigate(`/courses/${course._id}`);
                                  }
                                })
                                .catch(error => {
                                  console.error("Error fetching lectures:", error);
                                  navigate(`/courses/${course._id}`);
                                });
                            }}
                          >
                            {calculateProgress(course._id) === 100 ? 'Review Course' : 'Continue Learning'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No courses found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchInput 
                        ? `No courses matching "${searchInput}"`
                        : "You haven't enrolled in any courses yet"}
                    </p>
                    <Button onClick={() => navigate('/courses')}>
                      Browse Courses
                    </Button>
                  </div>
                )}
              </CardContent>
              {filteredCourses.length > 0 && (
                <CardFooter className="border-t px-6 py-4">
                  <Button variant="outline" className="w-full" onClick={() => navigate('/courses')}>
                    Browse More Courses
                  </Button>
                </CardFooter>
              )}
            </Card>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map(activity => (
                      <div key={activity.id} className="flex items-start p-3 rounded-lg border">
                        <div className="bg-violet-100 rounded-full p-2 mr-4">
                          {activity.action.includes('Started') && <PlayCircle className="h-5 w-5 text-violet-600" />}
                          {activity.action.includes('Completed') && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {activity.action.includes('Enrolled') && <BookOpen className="h-5 w-5 text-violet-600" />}
                        </div>
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.course}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No recent activity to show</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Calendar, Deadlines, Notifications */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {user?.photoUrl ? (
                      <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-violet-100 text-violet-600 text-xl font-bold">
                        {user?.name?.charAt(0) || 'S'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{user?.name || 'Student'}</h3>
                    <p className="text-gray-500 text-sm">{user?.email || 'student@example.com'}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/profile')}
                >
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </CardContent>
            </Card>
            
            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-violet-500" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingDeadlines.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingDeadlines.map(deadline => (
                      <div key={deadline.id} className="border-l-4 border-amber-500 pl-4 py-2">
                        <p className="font-medium">{deadline.title}</p>
                        <p className="text-sm text-gray-500">{deadline.course}</p>
                        <p className="text-sm text-amber-600 mt-1">{formatDate(deadline.date)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No upcoming deadlines</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Deadlines will be shown here when instructors assign them to your courses
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Screen Time Management - Updated */}
            {renderScreenTimeCard()}
            
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-violet-500" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-3 border rounded-lg ${notification.read ? 'bg-white' : 'bg-violet-50 border-violet-200'}`}
                      >
                        <div className="flex justify-between">
                          <p className={`${notification.read ? 'font-normal' : 'font-medium'}`}>{notification.message}</p>
                          {!notification.read && (
                            <span className="h-2 w-2 bg-violet-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No notifications</p>
                  </div>
                )}
              </CardContent>
              {notifications.length > 0 && (
                <CardFooter className="border-t px-6 py-4 flex justify-between">
                  <small className="text-gray-500">
                    <Info className="h-3 w-3 inline mr-1" />
                    Feature in development
                  </small>
                  <Button variant="link" className="text-violet-600">
                    Mark All as Read
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard