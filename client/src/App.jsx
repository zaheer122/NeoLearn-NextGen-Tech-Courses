import React, { Suspense, lazy } from 'react'
import Navbar from './components/Navbar'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import SuspenseLoader from './components/SuspenseLoader'
import StudentDashboard from './pages/StudentDashboard'
import ScreenTimeTracker from './components/ScreenTimeTracker'
import BreakTimeAlert from './components/BreakTimeAlert'
import ChatPage from './pages/ChatPage'
import { GoogleOAuthProvider } from '@react-oauth/google'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'))
const Courses = lazy(() => import('./pages/Courses'))
const Login = lazy(() => import('./pages/auth/Login'))
const Signup = lazy(() => import('./pages/auth/Signup'))
const Profile = lazy(() => import('./pages/Profile'))
const Admin = lazy(() => import('./pages/admin/Admin'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Course = lazy(() => import('./pages/admin/Course'))
const CreateCourse = lazy(() => import('./pages/admin/CreateCourse'))
const UpdateCourse = lazy(() => import('./pages/admin/UpdateCourse'))
const CreateLecture = lazy(() => import('./pages/admin/CreateLecture'))
const Lecture = lazy(() => import('./pages/admin/Lecture'))
const EditLecture = lazy(() => import('./pages/admin/EditLecture'))
const CourseDetails = lazy(() => import('./pages/CourseDetails.jsx'))
const LecturePlayer = lazy(() => import('./pages/LecturePlayer.jsx'))
const Footer = lazy(() => import('./components/Footer'))
const AboutUs = lazy(() => import('./pages/AboutUs'))
const ContactUs = lazy(() => import('./pages/ContactUs'))

// Lazy load AR components
const ARViewerPage = lazy(() => import('./pages/ARViewerPage'))
const ARScannerPage = lazy(() => import('./pages/ARScannerPage'))
const ARGeneratorPage = lazy(() => import('./pages/ARGeneratorPage'))

// Create router with future flags
const router = createBrowserRouter([
  {
    path:"/",
    element: (
      <Suspense fallback={<SuspenseLoader />}>
        <ErrorBoundary>
          <Navbar/>
          <Home/>
          <Footer/>
        </ErrorBoundary>
      </Suspense>
    )
  },
  {
    path:"/courses",
    element: (
      <Suspense fallback={<SuspenseLoader />}>
        <ErrorBoundary>
          <Navbar/>
          <Courses/>
          <Footer/>
        </ErrorBoundary>
      </Suspense>
    )
  },
  {
    path:"/about",
    element: (
      <Suspense fallback={<SuspenseLoader />}>
        <ErrorBoundary>
          <Navbar/>
          <AboutUs/>
          <Footer/>
        </ErrorBoundary>
      </Suspense>
    )
  },
  {
    path:"/contact",
    element: (
      <Suspense fallback={<SuspenseLoader />}>
        <ErrorBoundary>
          <Navbar/>
          <ContactUs/>
          <Footer/>
        </ErrorBoundary>
      </Suspense>
    )
  },
  {
    path:"/login",
    element: (
      <Suspense fallback={<SuspenseLoader />}>
        <ErrorBoundary>
          <Navbar/>
          <Login/>
          <Footer/>
        </ErrorBoundary>
      </Suspense>
    )
  },
  {
    path:"/signup",
    element: (
      <Suspense fallback={<SuspenseLoader />}>
        <ErrorBoundary>
          <Navbar/>
          <Signup/>
          <Footer/>
        </ErrorBoundary>
      </Suspense>
    )
  },
  {
    path:"/profile",
    element: (
      <Suspense fallback={<SuspenseLoader />}>
        <ErrorBoundary>
          <Navbar/>
          <Profile/>
          <Footer/>
        </ErrorBoundary>
      </Suspense>
    )
  },
  {
    path:"/dashboard",
    element: (
      <Suspense fallback={<SuspenseLoader />}>
        <ErrorBoundary>
          <Navbar/>
          <StudentDashboard/>
          <Footer/>
        </ErrorBoundary>
      </Suspense>
    )
  },
  {
    path:"/courses/:courseId",
    element: (
      <Suspense fallback={<SuspenseLoader />}>
        <ErrorBoundary>
          <Navbar/>
          <CourseDetails/>
          <Footer/>
        </ErrorBoundary>
      </Suspense>
    )
  },
  {
    path:"/courses/:courseId/lecture/:lectureId",
    element: (
      <Suspense fallback={<SuspenseLoader />}>
        <ErrorBoundary>
          <LecturePlayer/>
        </ErrorBoundary>
      </Suspense>
    )
  },
  {
    path:"/chat",
    element: (
      <Suspense fallback={<SuspenseLoader />}>
        <Navbar/>
        <ChatPage/>
        <Footer/>
      </Suspense>
    ),
    errorElement: <div className="error-page-container"><ErrorBoundary><div>Failed to load chat</div></ErrorBoundary></div>
  },
  
  {
    path:"/admin",
    element: (
      <Suspense fallback={<SuspenseLoader />}>
        <Navbar/>
        <Admin/>
      </Suspense>
    ),
    children: [
      {
        path:"dashboard",
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <Dashboard />
          </Suspense>
        )
      },
      {
        path:"course",
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <Course />
          </Suspense>
        )
      },
      {
        path:"course/create",
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <CreateCourse />
          </Suspense>
        )
      },
      {
        path:"course/:courseId",
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <UpdateCourse/>
          </Suspense>
        )
      },
      {
        path:"course/:courseId/lecture",
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <Lecture/>
          </Suspense>
        )
      },
      {
        path:"course/:courseId/lecture/create",
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <CreateLecture/>
          </Suspense>
        )
      },
      {
        path:"course/:courseId/lecture/:lectureId",
        element: (
          <Suspense fallback={<SuspenseLoader />}>
            <EditLecture/>
          </Suspense>
        )
      }
    ]
  },
  {
    path: "/ar/viewer",
    element: (
      <Suspense fallback={<SuspenseLoader />}>
        <ErrorBoundary>
          <ARViewerPage />
        </ErrorBoundary>
      </Suspense>
    )
  },
  {
    path: "/ar/scanner",
    element: (
      <Suspense fallback={<SuspenseLoader />}>
        <ErrorBoundary>
          <ARScannerPage />
        </ErrorBoundary>
      </Suspense>
    )
  },
  {
    path: "/ar/generator",
    element: (
      <Suspense fallback={<SuspenseLoader />}>
        <ErrorBoundary>
          <ARGeneratorPage />
        </ErrorBoundary>
      </Suspense>
    )
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
})

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      {/* Global components that work across all pages */}
      <ScreenTimeTracker />
      <BreakTimeAlert />
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </GoogleOAuthProvider>
  )
}

export default App