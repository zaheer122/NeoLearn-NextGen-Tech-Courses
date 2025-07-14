import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Clock, Globe, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setCourse } from "@/redux/courseSlice";

const CourseTab = () => {
    const params = useParams();
    const id = params.courseId;
    const navigate = useNavigate();
    const dispatch = useDispatch(); // Redux dispatch hook
    const { course: courses } = useSelector(state => state.course); // Access courses from Redux
    
    const [loading, setLoading] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [formData, setFormData] = useState({
      courseTitle: "",
      subTitle: "",
      description: "",
      category: "",
      courseLevel: "",
      duration: 0,
      language: "English",
      file: null
    });
    const [previewThumbnail, setPreviewThumbnail] = useState("");
    const [publishLoading, setPublishLoading] = useState(false);

    const getCourseById = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/v1/course/${id}`, {withCredentials: true});
            if (res.data.success) {
                setSelectedCourse(res.data.course);
                // Initialize form data with course values
                setFormData({
                    courseTitle: res.data.course.courseTitle || "",
                    subTitle: res.data.course.subTitle || "",
                    description: res.data.course.description || "",
                    category: res.data.course.category || "",
                    courseLevel: res.data.course.courseLevel || "",
                    duration: res.data.course.duration || 0,
                    language: res.data.course.language || "English",
                    file: null
                });
                setPreviewThumbnail(res.data.course.courseThumbnail);
            }
        } catch (error) {
            console.log("Error fetching course:", error);
            toast.error("Failed to load course data");
        }
    };
    
    useEffect(() => {
        getCourseById();
    }, [id]); // Add id as dependency to prevent infinite loop

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Handle file selection
    const selectThumbnail = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({...prev, file}));
            const fileReader = new FileReader();
            fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
            fileReader.readAsDataURL(file);
        }
    };

    const UpdateCourseHandler = async () => {
        try {
            setLoading(true);
            
            // Validate required fields
            if (!formData.courseTitle || !formData.category) {
                toast.error("Course title and category are required");
                setLoading(false);
                return;
            }
            
            // Create form data for API request (to handle file upload)
            const updateFormData = new FormData();
            updateFormData.append("courseTitle", formData.courseTitle);
            updateFormData.append("subTitle", formData.subTitle);
            updateFormData.append("description", formData.description);
            updateFormData.append("category", formData.category);
            updateFormData.append("courseLevel", formData.courseLevel);
            updateFormData.append("duration", formData.duration);
            updateFormData.append("language", formData.language);
            
            // Only append file if it exists
            if (formData.file) {
                updateFormData.append("file", formData.file);
            }
            
            console.log("Updating course with data:", {
                courseTitle: formData.courseTitle,
                subTitle: formData.subTitle,
                description: formData.description,
                category: formData.category,
                courseLevel: formData.courseLevel,
                duration: formData.duration,
                language: formData.language,
                hasFile: !!formData.file
            });
            
            // Send API request to update course
            const response = await axios.put(
                `http://localhost:8000/api/v1/course/${id}`,
                updateFormData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );
            
            if (response.data.success) {
                // Update Redux store with the updated course
                if (courses) {
                    // Create a new array with the updated course
                    const updatedCourses = courses.map(course => 
                        course._id === id ? response.data.course : course
                    );
                    
                    // Dispatch to update Redux store
                    dispatch(setCourse(updatedCourses));
                }
                
                toast.success("Course updated successfully");
                navigate("lecture");
            } else {
                toast.error(response.data.message || "Failed to update course");
            }
        } catch (error) {
            console.error("Error updating course:", error);
            toast.error(error.response?.data?.message || "Failed to update course");
        } finally {
            setLoading(false);
        }
    };

    const togglePublishCourse = async () => {
        try {
            setPublishLoading(true);
            
            const response = await axios.patch(
                `http://localhost:8000/api/v1/course/${id}/toggle-publish`,
                {},
                { withCredentials: true }
            );
            
            if (response.data.success) {
                // Update the course in Redux
                if (courses) {
                    // Create a new array with the updated isPublished status
                    const updatedCourses = courses.map(course => 
                        course._id === id ? { ...course, isPublished: response.data.isPublished } : course
                    );
                    
                    dispatch(setCourse(updatedCourses));
                }
                
                // Update the selected course state
                setSelectedCourse(prev => ({
                    ...prev,
                    isPublished: response.data.isPublished
                }));
                
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message || "Failed to update course status");
            }
        } catch (error) {
            console.error("Error toggling course status:", error);
            toast.error(
                error.response?.data?.message || 
                "Failed to update course status. Ensure you have added lectures to the course."
            );
        } finally {
            setPublishLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex md:flex-row justify-between">
                <div>
                    <CardTitle>Basic Course Information</CardTitle>
                    <CardDescription>
                        Make changes to your courses here. Click save when you're done.
                    </CardDescription>
                </div>
                <div className="space-x-2">
                    <Button 
                        onClick={togglePublishCourse} 
                        className={selectedCourse?.isPublished ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"}
                        disabled={publishLoading}
                    >
                        {publishLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            selectedCourse?.isPublished ? "Unpublish" : "Publish"
                        )}
                    </Button>
                    <Button variant="destructive" onClick={() => {
                        if (confirm("Are you sure you want to remove this course? This action cannot be undone.")) {
                            // Add removal logic here
                            navigate('/admin/course');
                        }
                    }}>
                        Remove Course
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 mt-5 ">
                    <div>
                        <Label htmlFor="courseTitle">Title</Label>
                        <Input
                            id="courseTitle"
                            type="text"
                            name="courseTitle"
                            value={formData.courseTitle}
                            onChange={handleInputChange}
                            placeholder="Example: Fullstack Developer"
                        />
                    </div>
                </div>
                <div className="space-y-4 mt-5 ">
                    <div>
                        <Label htmlFor="subTitle">Subtitle</Label>
                        <Input
                            id="subTitle"
                            type="text"
                            name="subTitle"
                            value={formData.subTitle}
                            onChange={handleInputChange}
                            placeholder="Example: Become a Fullstack developer from zero to hero in 2 months"
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <RichTextEditor 
                            initialValue={formData.description}
                            onChange={(value) => handleSelectChange("description", value)}
                        />
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select 
                                value={formData.category}
                                onValueChange={(value) => handleSelectChange("category", value)}
                            >
                                <SelectTrigger id="category" className="w-full">
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
                        
                        <div>
                            <Label htmlFor="courseLevel">Course Level</Label>
                            <Select 
                                value={formData.courseLevel}
                                onValueChange={(value) => handleSelectChange("courseLevel", value)}
                            >
                                <SelectTrigger id="courseLevel" className="w-full">
                                    <SelectValue placeholder="Select a course level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Course Level</SelectLabel>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Advance">Advance</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <Label htmlFor="duration" className="flex items-center gap-1">
                                <Clock size={16} className="text-gray-500" />
                                Duration (hours)
                            </Label>
                            <Input
                                id="duration"
                                type="number"
                                name="duration"
                                min="0"
                                value={formData.duration}
                                onChange={handleInputChange}
                                placeholder="Course duration in hours"
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="language" className="flex items-center gap-1">
                                <Globe size={16} className="text-gray-500" />
                                Language
                            </Label>
                            <Select 
                                value={formData.language}
                                onValueChange={(value) => handleSelectChange("language", value)}
                            >
                                <SelectTrigger id="language" className="w-full">
                                    <SelectValue placeholder="Select a language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Language</SelectLabel>
                                        <SelectItem value="English">English</SelectItem>
                                        <SelectItem value="Spanish">Spanish</SelectItem>
                                        <SelectItem value="French">French</SelectItem>
                                        <SelectItem value="German">German</SelectItem>
                                        <SelectItem value="Hindi">Hindi</SelectItem>
                                        <SelectItem value="Chinese">Chinese</SelectItem>
                                        <SelectItem value="Arabic">Arabic</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        
                    </div>
                    <div>
                        <Label> Course Thumbnail</Label>
                        <Input
                            type="file"
                            id="file"
                            onChange={selectThumbnail}
                            placeholder=""
                            accept="image/*"
                            className="w-fit"
                        />
                        {previewThumbnail && (
                            <img src={previewThumbnail} alt="Thumbnail" className="w-64 my-2"/>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={()=>navigate('/admin/course')} variant="outline">Cancel</Button>
                        <Button 
                            className="bg-gray-800" 
                            onClick={UpdateCourseHandler}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CourseTab;
