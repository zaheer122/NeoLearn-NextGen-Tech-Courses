import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CreateCourse = () => {
    const navigate = useNavigate()
    const [loading,setLoading] =useState(false)
    const [courseTitle, setCourseTitle] = useState("")
    const [category, setCatogory] = useState("")

    const getSelectedCategory =(value)=>{
        setCatogory(value)

    }
    const createCourseHandler = async ()=>{
        try {
            setLoading(true)
            const res = await axios.post('http://localhost:8000/api/v1/course/',{courseTitle,category},{
                headers:{
                    "Content-Type":"application/json"
                },
                withCredentials:true
            })
            if (res.data.success){
                navigate('/admin/course')
                toast.success(res.data.message)

            }
        } catch (error) {
            console.log(error);
                        
        }finally{
            setLoading(false)
        }
    }
  return (
    <div className="p-10 md:pr-20 h-screen">
      <h1 className="text-2xl font-bold">
        {" "}
        Lets Add <span className="text-violet-600">Courses</span>
      </h1>
      <p>
        The "Add Course" feature allows administrators or instructors to create
        and publish new courses by providing key details like title,
        description, and duration. Once added, courses become instantly
        available for students to explore and enroll, enabling dynamic and
        up-to-date learning content delivery.
      </p>
      <div className="mt-10">
        <div>
          <Label>Title</Label>
          <Input
            type="text"
            value={courseTitle}
            onChange={(e)=>setCourseTitle(e.target.value)}
            placeholder="Your Course Name"
            className="bg-white"
          />
        </div>
        <div className="mt-4 mb-5">
          <Label>Category</Label>
          <Select onValueChange={getSelectedCategory}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                <SelectItem value="Next Js">Next Js</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Full Stack Development">Full Stack Development</SelectItem>
                <SelectItem value="Web Development">Web Development</SelectItem>
                <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                <SelectItem value="IOT">IOT</SelectItem>
                <SelectItem value="Programming Language">Programming Language</SelectItem>
                <SelectItem value="Cloud">Cloud Computing</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Cyber Security ">Cyber Security </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
            <Button onClick={()=>navigate('/admin/course')} variant="outline">Cancel</Button>
            <Button className="bg-violet-500 hover:bg-violet-600" disabled={loading} onClick={createCourseHandler}>
                {
                    loading ? <><Loader2 className="animate-spin mr-1 h-4 w-4"/> Please wait</> : "Create"
                }
                </Button>

        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
