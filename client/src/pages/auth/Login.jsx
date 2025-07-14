import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { setUser } from '@/redux/authSlice'
import { startScreenTimeTracking } from '@/redux/screenTimeSlice'
import axios from 'axios'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AtSign, Lock, LogIn, ArrowRight } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [input, setInput] = useState({
    email:"",
    password:""
  })
  const handleChange =(e)=>{

    const{name,value} = e.target
    setInput((prev)=>({
      ...prev,
      [name]:value,
    }))
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log(input);
    try {

      const response =await axios.post('http://localhost:8000/api/v1/user/login', input,{
        headers:{
          "Content-Type":"application/json"
        },
        withCredentials:true
      })
      if(response.data.success){
        navigate('/')
        dispatch(setUser(response.data.user))
        
        // Screen time tracking will auto-start via the ScreenTimeTracker component
        toast.success(response.data.message)

      }else{
        toast.error("Something went wrong")
      }
    } catch (error) {
       console.log(error)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Left side - Illustration */}
        <div className="hidden lg:block lg:w-1/2 bg-violet-600 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-900 opacity-90"></div>
          
          {/* Abstract Shapes */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute top-1/3 right-20 w-16 h-16 bg-white/10 rounded-full"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 z-10">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-8">
              <LogIn className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-white text-3xl font-bold mb-6 text-center">Welcome to Your Learning Platform</h2>
            <p className="text-white/80 text-center mb-8 max-w-md">
              Access your courses, track your progress, and connect with peers and mentors.
            </p>
            
            {/* Illustration - Abstract learning concept */}
            <div className="w-full max-w-md">
              <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-lg">
                <path d="M90,261c-6,0-11-5-11-11v-82c0-6,5-11,11-11h105c6,0,11,5,11,11v82c0,6-5,11-11,11H90z" fill="#ffffff" opacity="0.4"/>
                <path d="M305,168c-6,0-11-5-11-11V75c0-6,5-11,11-11h105c6,0,11,5,11,11v82c0,6-5,11-11,11H305z" fill="#ffffff" opacity="0.4"/>
                <path d="M305,345c-6,0-11-5-11-11v-82c0-6,5-11,11-11h105c6,0,11,5,11,11v82c0,6-5,11-11,11H305z" fill="#ffffff" opacity="0.4"/>
                <path d="M130,130 L280,90" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.6"/>
                <path d="M140,200 L310,200" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.6"/>
                <path d="M280,280 L140,240" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.6"/>
                <circle cx="130" cy="130" r="15" fill="#ffffff" opacity="0.8"/>
                <circle cx="280" cy="90" r="15" fill="#ffffff" opacity="0.8"/>
                <circle cx="140" cy="200" r="15" fill="#ffffff" opacity="0.8"/>
                <circle cx="310" cy="200" r="15" fill="#ffffff" opacity="0.8"/>
                <circle cx="280" cy="280" r="15" fill="#ffffff" opacity="0.8"/>
                <circle cx="140" cy="240" r="15" fill="#ffffff" opacity="0.8"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 bg-white p-8 lg:p-12">
          <div className="lg:hidden flex justify-center mb-6">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center">
              <LogIn className="w-8 h-8 text-violet-600" />
            </div>
          </div>
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-500">
              Sign in to continue to your account
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <AtSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input 
                    id="email"
                    name="email" 
                    type="email" 
                    value={input.email} 
                    onChange={handleChange}
                    placeholder="name@example.com" 
                    className="pl-10 bg-gray-50 border border-gray-300 text-gray-900 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input 
                    id="password"
                    name="password" 
                    type="password" 
                    value={input.password} 
                    onChange={handleChange}
                    placeholder="••••••••" 
                    className="pl-10 bg-gray-50 border border-gray-300 text-gray-900 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>
              </div>
              
              <Button 
                type="submit"
                onClick={handleSubmit} 
                className="w-full py-6 relative overflow-hidden bg-violet-600 hover:bg-violet-700 text-white text-base font-medium rounded-lg transition-all duration-200"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Sign in <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </div>
          </form>
          
          <p className="mt-8 text-center text-gray-600">
            Don't have an account? 
            <Link to='/signup' className="ml-1 font-medium text-violet-600 hover:text-violet-800">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login