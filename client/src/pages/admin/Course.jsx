import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCourse } from "@/redux/courseSlice";
import axios from "axios";
import { Clock, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";



const Course = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const {course} = useSelector(store=>store.course)
    useEffect(()=>{
        const getCreatorCourse = async ()=>{
            try {
                const res = await axios.get('http://localhost:8000/api/v1/course/creator-courses',{withCredentials:true})
                if(res.data.success){
                    dispatch(setCourse(res.data.courses))
                }
            } catch (error) {
                console.log(error);
                
            }
        }
        getCreatorCourse()
    }, [])
    
  return (
    <div className="md:p-10 p-4 w-full min-h-screen">
      <Button className="bg-violet-500" onClick={()=>navigate('create')}> Create Course</Button>
      <Table className="mt-10">
        <TableCaption>A list of your recent courses.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Course</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {course?.map((course) => (
            <TableRow key={course._id}>
              <TableCell className="md:w-[300px] flex items-center gap-2 ">
                <img src={course?.courseThumbnail} alt="Thumbnail" className="w-12 h-12 object-cover rounded"/>
                <span className="font-medium">{course.courseTitle}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Clock size={16} className="text-gray-500" />
                  <span>{course.duration || 0} hours</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Globe size={16} className="text-gray-500" />
                  <span>{course.language || "English"}</span>
                </div>
              </TableCell>
              <TableCell><Badge className={course.isPublished ? "bg-green-400":"bg-red-400"}>{course.isPublished ? "Published" : "Draft"}</Badge></TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/admin/course/${course._id}`)}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Course;
