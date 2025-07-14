import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Mail, Lock, Calendar, UserPlus, Rocket, BookOpen } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate()
  const [user,setUser] = useState({
    name:"",
    email:"",
    password:"",
    role:"student",
    dateOfBirth:""
  })
  const handleChange = (e)=>{
    const {name,value} = e.target;
    setUser((prev)=>({
      ...prev,
      [name]:value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault(),
    console.log(user)
    try {
      const response = await axios.post('http://localhost:8000/api/v1/user/register', user,{
        headers:{
          "Content-Type":"application/json"
        },
        withCredentials:true
      })
      if(response.data.success){
        navigate('/login')
        toast.success(response.data.message)
      }else{
        toast.error("Something went wrong")
      }
    } catch (error) {
       console.log(error)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 pt-24 pb-8">
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
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-white text-3xl font-bold mb-6 text-center">Start Your Learning Journey Today</h2>
            <p className="text-white/80 text-center mb-8 max-w-md">
              Create an account to track your progress, access courses, and connect with a community of learners.
            </p>
            
            {/* Illustration - Education concept */}
            <div className="w-full max-w-md">
              <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-lg">
                {/* Books stack */}
                <rect x="100" y="280" width="300" height="30" rx="2" fill="#ffffff" opacity="0.6" />
                <rect x="120" y="250" width="260" height="30" rx="2" fill="#ffffff" opacity="0.7" />
                <rect x="140" y="220" width="220" height="30" rx="2" fill="#ffffff" opacity="0.8" />
                
                {/* Graduation cap */}
                <path d="M250,80 L150,130 L250,180 L350,130 L250,80Z" fill="#ffffff" opacity="0.9" />
                <path d="M170,160 L170,200 L250,240 L330,200 L330,160" stroke="#ffffff" strokeWidth="10" opacity="0.6" strokeLinecap="round" fill="none" />
                <circle cx="250" cy="80" r="15" fill="#ffffff" />
                
                {/* Connection lines */}
                <path d="M250,180 L250,220" stroke="#ffffff" strokeWidth="4" strokeDasharray="5,5" opacity="0.6" />
                
                {/* Stars */}
                <path d="M120,120 L130,100 L140,120 L120,110 L140,110 Z" fill="#ffffff" opacity="0.8" />
                <path d="M380,130 L390,110 L400,130 L380,120 L400,120 Z" fill="#ffffff" opacity="0.8" />
                <path d="M100,200 L110,180 L120,200 L100,190 L120,190 Z" fill="#ffffff" opacity="0.6" />
                <path d="M370,220 L380,200 L390,220 L370,210 L390,210 Z" fill="#ffffff" opacity="0.6" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Right side - Sign up Form */}
        <div className="w-full lg:w-1/2 bg-white p-8 lg:p-12 overflow-y-auto max-h-screen">
          <div className="lg:hidden flex justify-center mb-6">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-violet-600" />
            </div>
          </div>
          
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-500">
              Join us today! It's quick and easy
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input 
                  id="name"
                  name="name" 
                  type="text" 
                  value={user.name} 
                  onChange={handleChange}
                  placeholder="John Doe" 
                  className="pl-10 bg-gray-50 border border-gray-300 text-gray-900 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input 
                  id="email"
                  name="email" 
                  type="email" 
                  value={user.email} 
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
                  value={user.password} 
                  onChange={handleChange}
                  placeholder="••••••••" 
                  className="pl-10 bg-gray-50 border border-gray-300 text-gray-900 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                Date of Birth
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <Input 
                  id="dateOfBirth"
                  name="dateOfBirth" 
                  type="date" 
                  value={user.dateOfBirth} 
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="pl-10 bg-gray-50 border border-gray-300 text-gray-900 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Used to personalize your screen time reminders based on age group
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                I am a
              </Label>
              <div className="mt-2">
                <RadioGroup 
                  value={user.role}
                  onValueChange={(value) => setUser((prev) => ({ ...prev, role: value }))}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <RadioGroupItem value="student" id="role1" className="text-violet-600" />
                    <Label htmlFor="role1" className="flex items-center cursor-pointer">
                      <BookOpen className="h-4 w-4 mr-2 text-violet-500" />
                      Student
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <RadioGroupItem value="instructor" id="role2" className="text-violet-600" />
                    <Label htmlFor="role2" className="flex items-center cursor-pointer">
                      <Rocket className="h-4 w-4 mr-2 text-violet-500" />
                      Instructor
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <Button 
              type="submit"
              className="w-full py-6 relative overflow-hidden bg-violet-600 hover:bg-violet-700 text-white text-base font-medium rounded-lg transition-all duration-200 mt-4"
            >
              Create Account
            </Button>
          </form>
          
          <p className="mt-6 text-center text-gray-600">
            Already have an account? 
            <Link to='/login' className="ml-1 font-medium text-violet-600 hover:text-violet-800">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
