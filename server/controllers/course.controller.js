import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";

export const createCourse = async(req, res)=>{
    try {
        const {courseTitle,category} = req.body;
        if (!courseTitle || !category){
            return res.status(400).json({
                message:"Course title and category is required",
                success:false
            })
        } 
        const course = await Course.create({
            courseTitle,
            category,
            creator: req.id

        })
        return res.status(201).json({
            success:true,
            course,
            message:"Course created successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create course",
            success:false
        })
        
        
    }
}




export const getPublishedCourse = async(_,res)=>{
    try {
        // Use populate to get the lectures array and enrolled students count
        const courses = await Course.find({isPublished:true}).populate('lectures');
        if(!courses){
            return res.status(404).json({
                message:"Course not found"
            })
        }
        return res.status(200).json({
            success:true,
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to fetch published courses",
            success:false
        })
    }
}


export const getCreatorCourses = async(req,res)=>{
    try {
        const userId =req.id;
        const courses = await Course.find({creator:userId});
        if(!courses){
            return res.status(404).json({
                message:"Course not found",
                course:[],
                success:false
            })
        }
        return res.status(200).json({
            success:true,
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create course",
            success:false
        })
        
    }

}








export const editCourse = async(req,res)=>{
    try {
        const courseId = req.params.courseId;
        const{courseTitle,subTitle,description,category,courseLevel,duration,language,} = req.body;
        const file = req.file;

        let course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message:"Course not found!"
            })
        }
        let courseThumbnail;
        if(file){
            const fileUri = getDataUri(file)
            courseThumbnail = await cloudinary.uploader.upload(fileUri)
        }
        const updateData = {courseTitle,subTitle,description,category,courseLevel,duration,language,
        courseThumbnail:courseThumbnail?.secure_url};
        
        course = await Course.findByIdAndUpdate(courseId,updateData,{new:true})
        return res.status(200).json({
            success:true,
            course,
            message:"Course updated successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to update course",
            success:false
        })
        
        
    }
}






export const getCourseById = async(req,res)=>{
    try {
        const {courseId} = req.params;
        
        // Validate courseId
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required"
            });
        }
        
        // Ensure user is authenticated
        if (!req.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required to view course details"
            });
        }
        
        // Convert to ObjectId if necessary (handle validation errors)
        let course;
        try {
            // Populate the creator field to get instructor details
            course = await Course.findById(courseId).populate({
                path: 'creator',
                select: 'name email photoUrl description' // Only select necessary fields, excluding password
            });
        } catch (err) {
            console.log("Error finding course by ID:", err);
            return res.status(400).json({
                success: false,
                message: "Invalid course ID format"
            });
        }
        
        // Check if course exists
        if(!course){
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }
        
        // Return course details
        return res.status(200).json({
            success: true,
            course
        });
    } catch (error) {
        console.log("Error in getCourseById:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch course details",
            error: error.message
        });
    }
}


// lecture controllers

export const createLecture = async(req, res)=> {
    try {
        const { lectureTitle, isPreview, description, quiz, videoUrl } = req.body;
        const { courseId } = req.params;
        const file = req.file; // Video file

        // Validation
        if(!lectureTitle || !courseId) {
            return res.status(400).json({
                message: "Lecture title and course ID are required",
                success: false
            });
        }

        // Find the course first to validate it exists and user has permission
        const course = await Course.findById(courseId);
        if(!course) {
            return res.status(404).json({
                message: "Course not found",
                success: false
            });
        }

        // Check if the user is the course creator
        if(course.creator.toString() !== req.id) {
            return res.status(403).json({
                message: "You are not authorized to add lectures to this course",
                success: false
            });
        }

        // Create lecture object with basic info
        let lectureData = {
            lectureTitle,
            isPreview: isPreview === 'true' || isPreview === true ? true : false,
            description: description || ""
        };

        // Add quiz if provided
        if (quiz) {
            try {
                // Parse quiz if it's a string
                const parsedQuiz = typeof quiz === 'string' ? JSON.parse(quiz) : quiz;
                lectureData.quiz = parsedQuiz;
            } catch (error) {
                console.error("Error parsing quiz data:", error);
            }
        }

        // Check if direct video URL is provided
        if (videoUrl) {
            lectureData.videoUrl = videoUrl;
            // No need for publicId as it's an external URL
            console.log("External video URL provided:", videoUrl);
        }
        // Handle video upload if file is provided
        else if(file) {
            try {
                const fileUri = getDataUri(file);
                const uploadResult = await cloudinary.uploader.upload(fileUri, {
                    resource_type: "video",
                    folder: "course_lectures"
                });

                // Add video URL and public ID to lecture data
                lectureData.videoUrl = uploadResult.secure_url;
                lectureData.publicId = uploadResult.public_id;
                
                console.log("Video uploaded successfully:", uploadResult.secure_url);
            } catch (uploadError) {
                console.error("Video upload failed:", uploadError);
                return res.status(500).json({
                    message: "Failed to upload lecture video",
                    success: false
                });
            }
        }

        // Create the lecture
        const lecture = await Lecture.create(lectureData);

        // Add lecture to course
        course.lectures.push(lecture._id);
        await course.save();

        return res.status(201).json({
            success: true,
            lecture,
            message: "Lecture created successfully"
        });
    } catch (error) {
        console.error("Error creating lecture:", error);
        return res.status(500).json({
            message: "Failed to create lecture",
            success: false,
            error: error.message
        });
    }
}


export const getCourseLecture = async (req, res) =>{
    try {
         const {courseId} = req.params;
         const course = await Course.findById(courseId).populate('lectures');
         if(!course){
            return res.status(404).json({
                message:"course not found"
            })
         }
         return res.status(200).json({
            success:true,
            lectures:course.lectures
         })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to get Lectures"
        })
    }
}

export const editLecture = async (req,res) => {
    try {
        const {courseId, lectureId} = req.params;
        const {lectureTitle, videoInfo, isPreview, description, quiz, videoUrl} = req.body;
        const file = req.file; // Get the file if uploaded
        
        const lecture = await Lecture.findById(lectureId);
        if(!lecture){
            return res.status(404).json({
                message: "Lecture not found!",
                success: false
            });
        }
        
        // Update basic lecture fields
        if (lectureTitle) lecture.lectureTitle = lectureTitle;
        if (description !== undefined) lecture.description = description;
        
        // Handle video URL provided directly
        if (videoUrl) {
            lecture.videoUrl = videoUrl;
            
            // If lecture had a previously uploaded video on Cloudinary, delete it
            if (lecture.publicId) {
                try {
                    await cloudinary.uploader.destroy(lecture.publicId, {
                        resource_type: "video"
                    });
                    console.log("Old video deleted from Cloudinary");
                    lecture.publicId = null; // Clear the publicId as we're using an external URL now
                } catch (deleteError) {
                    console.error("Error deleting old video:", deleteError);
                    // Continue even if delete fails
                }
            }
        }
        // Handle video info if no new file or direct URL is provided
        else if (!file && !videoUrl && videoInfo?.videoUrl) {
            lecture.videoUrl = videoInfo.videoUrl;
            if (videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
        }
        
        // Convert isPreview to boolean
        if (isPreview !== undefined) {
            lecture.isPreview = isPreview === 'true' || isPreview === true ? true : false;
        }
        
        // Handle new video file upload if provided and no direct URL is given
        if (file && !videoUrl) {
            try {
                // If lecture already has a video, delete the old one from cloudinary
                if (lecture.publicId) {
                    try {
                        await cloudinary.uploader.destroy(lecture.publicId, {
                            resource_type: "video"
                        });
                        console.log("Old video deleted successfully");
                    } catch (deleteError) {
                        console.error("Error deleting old video:", deleteError);
                        // Continue with upload even if delete fails
                    }
                }
                
                // Upload new video
                const fileUri = getDataUri(file);
                const uploadResult = await cloudinary.uploader.upload(fileUri, {
                    resource_type: "video",
                    folder: "course_lectures"
                });
                
                // Update lecture with new video info
                lecture.videoUrl = uploadResult.secure_url;
                lecture.publicId = uploadResult.public_id;
                
                console.log("New video uploaded successfully:", uploadResult.secure_url);
            } catch (uploadError) {
                console.error("Video upload failed:", uploadError);
                return res.status(500).json({
                    message: "Failed to upload new lecture video",
                    success: false,
                    error: uploadError.message
                });
            }
        }
        
        // Update quiz if provided
        if (quiz) {
            try {
                // Parse quiz if it's a string
                const parsedQuiz = typeof quiz === 'string' ? JSON.parse(quiz) : quiz;
                lecture.quiz = parsedQuiz;
            } catch (error) {
                console.error("Error parsing quiz data:", error);
            }
        }
        
        // Save the updated lecture
        await lecture.save();
        
        // Ensure lecture is associated with the course
        const course = await Course.findById(courseId);
        if (course && !course.lectures.includes(lecture._id)) {
            course.lectures.push(lecture._id);
            await course.save();
        }
        
        return res.status(200).json({
            success: true,
            lecture,
            message: "Lecture updated successfully"
        });
    } catch (error) {
        console.error("Error updating lecture:", error);
        return res.status(500).json({
            message: "Failed to edit lecture",
            success: false,
            error: error.message
        });
    }
}

export const removeLecture = async(req,res)=>{
    try {
       const {lectureId} = req.params;
       const lecture =await Lecture.findByIdAndDelete(lectureId)
       if(!lecture){
        return res.status(404).json({
            message:"Lecture not found!"
        })
       }
       //Remove the lecture refference from the associated course
       await Course.updateOne(
        {lectures:lectureId}, //find the course that contains the lecture
        {$pull:{lectures:lectureId}} // remove the lectures id from the lectures array
    );
     return res.status(200).json({
        success:true,
        message:"Lecture removed successfully"
     })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to remove lecture"
        })
        
    }
}








export const togglePublishedCourse = async(req,res)=>{
    try {
        const { courseId } = req.params;
        
        // Find the course by ID
        const course = await Course.findById(courseId);
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }
        
        // Verify the user is the course creator
        if (course.creator.toString() !== req.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to publish/unpublish this course"
            });
        }
        
        // Check if course has at least one lecture before publishing
        if (!course.isPublished && (!course.lectures || course.lectures.length === 0)) {
            return res.status(400).json({
                success: false,
                message: "Cannot publish a course without any lectures"
            });
        }

        // Toggle the published status
        course.isPublished = !course.isPublished;
        
        // Save the updated course
        await course.save();
        
        return res.status(200).json({
            success: true,
            isPublished: course.isPublished,
            message: course.isPublished ? "Course published successfully" : "Course unpublished successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update course publication status"
        });
    }
}

export const enrollCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;
        
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required"
            });
        }
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }
        
        // Find the course by ID
        const course = await Course.findById(courseId);
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }
        
        // Check if the course is published
        if (!course.isPublished) {
            return res.status(400).json({
                success: false,
                message: "Cannot enroll in an unpublished course"
            });
        }
        
        // Check if user is already enrolled
        // Convert ObjectId to string for comparison
        const enrolledStudentIds = course.enrolledStudents.map(id => id.toString());
        if (enrolledStudentIds.includes(userId.toString())) {
            return res.status(400).json({
                success: false,
                message: "You are already enrolled in this course"
            });
        }
        
        // Add user to enrolled students
        course.enrolledStudents.push(userId);
        
        // Save the updated course
        await course.save();
        
        // Return the updated course to the client
        return res.status(200).json({
            success: true,
            course,
            message: "Successfully enrolled in the course"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to enroll in the course",
            error: error.message
        });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        // Check if user is admin or instructor
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Get total courses created by this instructor/admin
        const totalCourses = await Course.countDocuments({ creator: userId });
        
        // Count published and draft courses
        const publishedCourses = await Course.countDocuments({ creator: userId, isPublished: true });
        const draftCourses = totalCourses - publishedCourses;
        
        // Aggregate total enrolled students across all courses
        const courseData = await Course.find({ creator: userId }, 'enrolledStudents');
        const totalStudents = courseData.reduce((acc, course) => acc + course.enrolledStudents.length, 0);
        
        // Count total lectures
        const totalLectures = await Lecture.countDocuments({ 
            courseId: { $in: courseData.map(course => course._id) } 
        });
        
        // Get recent courses (limit to 5)
        const recentCourses = await Course.find({ creator: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('courseTitle isPublished enrolledStudents');
            
        // Format recent courses
        const formattedRecentCourses = recentCourses.map(course => {
            // Calculate progress (for demo: published = 100%, draft depends on if it has lectures)
            const progress = course.isPublished ? 100 : 60;
            
            return {
                id: course._id,
                title: course.courseTitle,
                students: course.enrolledStudents.length,
                progress: progress,
                status: course.isPublished ? 'published' : 'draft'
            };
        });

        // Get recent activities
        // For a real app, you'd have a dedicated Activity model
        // Here we'll simulate by looking at recent course and lecture changes
        const recentCoursesForActivity = await Course.find({ creator: userId })
            .sort({ updatedAt: -1 })
            .limit(2)
            .select('courseTitle isPublished updatedAt');
            
        const recentLectures = await Lecture.find({ 
                courseId: { $in: courseData.map(course => course._id) } 
            })
            .sort({ updatedAt: -1 })
            .limit(2)
            .select('lectureTitle courseId updatedAt');
            
        // Resolve course titles for lectures
        const lecturesWithCourses = await Promise.all(recentLectures.map(async (lecture) => {
            const course = await Course.findById(lecture.courseId).select('courseTitle');
            return {
                ...lecture.toObject(),
                courseTitle: course ? course.courseTitle : 'Unknown Course'
            };
        }));
        
        // Create activity items
        const recentActivities = [
            // Course-related activities
            ...recentCoursesForActivity.map(course => ({
                id: `course-${course._id}`,
                type: course.isPublished ? 'course_published' : 'course_created',
                course: course.courseTitle,
                time: getTimeAgo(course.updatedAt)
            })),
            
            // Lecture-related activities
            ...lecturesWithCourses.map(lecture => ({
                id: `lecture-${lecture._id}`,
                type: 'lecture_added',
                course: lecture.courseTitle,
                lecture: lecture.lectureTitle,
                time: getTimeAgo(lecture.updatedAt)
            })),
            
            // Add enrollment activities (simulated)
            {
                id: 'enroll-1',
                type: 'student_enrolled',
                course: recentCoursesForActivity[0]?.courseTitle || 'React Fundamentals',
                student: 'John Doe',
                time: '5 hours ago'
            }
        ];
        
        // Sort by time (in a real app with timestamps this would be more accurate)
        recentActivities.sort(() => Math.random() - 0.5);
        
        // Sample notifications based on course state
        const notifications = [];
        
        // Check for courses without lectures
        const coursesWithoutLectures = await Course.find({
            creator: userId,
            lectures: { $size: 0 }
        }).select('courseTitle');
        
        if (coursesWithoutLectures.length > 0) {
            notifications.push({
                id: 'notification-1',
                type: 'alert',
                message: `Your course "${coursesWithoutLectures[0].courseTitle}" needs at least one lecture`,
                time: '1 hour ago'
            });
        }
        
        // Add enrollment notification if there are students
        if (totalStudents > 0) {
            notifications.push({
                id: 'notification-2',
                type: 'success',
                message: `New student enrolled in "${recentCoursesForActivity[0]?.courseTitle || 'your course'}"`,
                time: '3 hours ago'
            });
        }
        
        // Add reminder for draft courses
        if (draftCourses > 0) {
            notifications.push({
                id: 'notification-3',
                type: 'info',
                message: `Remember to complete your course "${recentCoursesForActivity.find(c => !c.isPublished)?.courseTitle || 'draft course'}"`,
                time: '1 day ago'
            });
        }
        
        // Prepare response data
        const stats = {
            totalCourses,
            publishedCourses,
            draftCourses,
            totalStudents,
            totalLectures,
            // Placeholder for revenue - in a real app you'd calculate this
            totalRevenue: totalStudents * 20 // Assuming $20 per student for example
        };
        
        res.status(200).json({
            success: true,
            stats,
            recentCourses: formattedRecentCourses,
            recentActivities,
            notifications
        });
        
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics",
            error: error.message
        });
    }
};

// Helper function to format time ago
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) {
        return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
}