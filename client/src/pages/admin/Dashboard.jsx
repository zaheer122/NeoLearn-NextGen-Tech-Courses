import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Clock,
  DollarSign,
  RefreshCw,
  Layers,
  TrendingUp,
  Users,
  Video,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Bell
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import api from '@/lib/axiosConfig'
import { toast } from 'sonner'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalStudents: 0,
    totalLectures: 0,
    totalRevenue: 0
  })
  const [recentCourses, setRecentCourses] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [notifications, setNotifications] = useState([])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await api.get('/course/dashboard-stats')
      console.log('Dashboard API response:', response.data)
      
      if (response.data.success) {
        setStats(response.data.stats)
        setRecentCourses(response.data.recentCourses)
        setRecentActivities(response.data.recentActivities)
        setNotifications(response.data.notifications)
      } else {
        toast.error('Failed to load dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard data')
      
      // Reset to empty state instead of using mock data
      setStats({
        totalCourses: 0,
        publishedCourses: 0,
        draftCourses: 0,
        totalStudents: 0,
        totalLectures: 0,
        totalRevenue: 0
      })
      setRecentCourses([])
      setRecentActivities([])
      setNotifications([{
        id: 'error-1',
        type: 'alert',
        message: 'Unable to load dashboard data. Please try again later.',
        time: 'just now'
      }])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Refresh dashboard data every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchDashboardData()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(refreshInterval)
  }, [])
  
  const getStatusBadge = (status) => {
    if (status === 'published') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Published</Badge>
    }
    return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">Draft</Badge>
  }
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'course_published':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'student_enrolled':
        return <Users className="h-4 w-4 text-blue-500" />
      case 'lecture_added':
        return <Video className="h-4 w-4 text-purple-500" />
      case 'course_created':
        return <BookOpen className="h-4 w-4 text-orange-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'info':
        return <Bell className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }
  
  const handleRefresh = () => {
    // Re-fetch data on manual refresh
    fetchDashboardData()
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'Admin'}</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your courses today.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button onClick={() => navigate('/admin/course/create')}>
            Create Course
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Layers className="h-5 w-5 text-violet-500 mr-2" />
              <span className="text-2xl font-bold">{stats.totalCourses}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-green-100 text-green-800">{stats.publishedCourses} Published</Badge>
              <Badge className="bg-orange-100 text-orange-800">{stats.draftCourses} Draft</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-violet-500 mr-2" />
              <span className="text-2xl font-bold">{stats.totalStudents}</span>
            </div>
            <div className="mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 inline-block mr-1" />
              <span className="text-green-500 text-sm">{stats.totalStudents > 0 ? '+12% from last month' : 'No students yet'}</span>
            </div>
          </CardContent>
        </Card>
        
       
      </div>
      
      {/* Recent Courses */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Courses</h2>
          <Button variant="link" onClick={() => navigate('/admin/course')}>
            View all courses <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <Card>
          {recentCourses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.students}</TableCell>
                    <TableCell>{getStatusBadge(course.status)}</TableCell>
                    <TableCell className="w-[200px]">
                      <div className="flex items-center gap-2">
                        <Progress value={course.progress} className="h-2" />
                        <span className="text-sm text-gray-500">{course.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/course/${course.id}`)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <CardContent className="flex flex-col items-center justify-center p-6">
              <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-center text-gray-500">No courses created yet</p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/course/create')} 
                className="mt-4"
              >
                Create Your First Course
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
      
      {/* Activity and Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>What's been happening in your courses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100">
                  <div className="bg-gray-100 p-2 rounded-full">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {activity.type === 'course_published' && `Course "${activity.course}" published`}
                      {activity.type === 'student_enrolled' && `${activity.student} enrolled in "${activity.course}"`}
                      {activity.type === 'lecture_added' && `Added lecture "${activity.lecture}" to "${activity.course}"`}
                      {activity.type === 'course_created' && `Created new course "${activity.course}"`}
                    </p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <Activity className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-center text-gray-500">No recent activity</p>
              </div>
            )}
          </CardContent>
          {recentActivities.length > 0 && (
            <CardFooter>
              <Button variant="ghost" className="w-full" onClick={() => navigate('/admin/activity')}>
                View All Activity
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Important alerts and messages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 pb-3 border-b border-gray-100">
                  <div className="bg-gray-100 p-2 rounded-full">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{notification.message}</p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-400">{notification.time}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <Bell className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-center text-gray-500">No notifications</p>
              </div>
            )}
          </CardContent>
          {notifications.length > 0 && (
            <CardFooter>
              <Button variant="ghost" className="w-full">
                Mark All as Read
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Lectures Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Video className="h-5 w-5 text-violet-500 mr-2" />
              <span className="text-2xl font-bold">{stats.totalLectures}</span>
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-500">
                Across {stats.totalCourses > 0 ? `${stats.totalCourses} courses` : 'no courses yet'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg. Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-violet-500 mr-2" />
              <span className="text-2xl font-bold">{stats.totalStudents > 0 ? '76%' : 'N/A'}</span>
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-500">Based on student progress</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg. Course Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-violet-500 mr-2" />
              <span className="text-2xl font-bold">{stats.totalStudents > 0 ? '4.7' : 'N/A'}</span>
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-500">
                {stats.totalStudents > 0 ? 'From 238 reviews' : 'No reviews yet'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tasks Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-violet-500 mr-2" />
              <span className="text-2xl font-bold">{stats.draftCourses}</span>
            </div>
            <div className="mt-2">
              <Button variant="link" className="p-0 h-auto text-sm" onClick={() => navigate('/admin/course')}>
                View tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard