import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileVideo, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setLectures, deleteLecture, setLoading, setError } from "@/redux/lectureSlice";

const Lecture = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { lectures, loading } = useSelector(state => state.lecture);
  const [courseTitle, setCourseTitle] = React.useState("");

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        dispatch(setLoading());
        
        // Get course details to show the course title
        const courseResponse = await axios.get(
          `http://localhost:8000/api/v1/course/${courseId}`,
          { withCredentials: true }
        );
        
        if (courseResponse.data.success) {
          setCourseTitle(courseResponse.data.course.courseTitle);
        }
        
        // Get lectures for this course
        const lecturesResponse = await axios.get(
          `http://localhost:8000/api/v1/course/${courseId}/lecture`,
          { withCredentials: true }
        );
        
        if (lecturesResponse.data.success) {
          dispatch(setLectures(lecturesResponse.data.lectures));
        }
      } catch (error) {
        console.error("Error fetching lectures:", error);
        dispatch(setError(error.response?.data?.message || "Failed to fetch lectures"));
        toast.error("Failed to fetch lectures");
      }
    };

    fetchLectures();
  }, [courseId, dispatch]);

  const handleDeleteLecture = async (lectureId) => {
    if (!confirm("Are you sure you want to delete this lecture?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:8000/api/v1/course/lecture/${lectureId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update Redux state
        dispatch(deleteLecture(lectureId));
        toast.success("Lecture deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting lecture:", error);
      toast.error(error.response?.data?.message || "Failed to delete lecture");
    }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/admin/course/${courseId}`)}
            className="mb-4 md:mb-0"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Course
          </Button>
        </div>
        <Button 
          onClick={() => navigate(`/admin/course/${courseId}/lecture/create`)}
          className="bg-violet-500 hover:bg-violet-600"
        >
          <Plus size={16} className="mr-2" />
          Add Lecture
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{courseTitle || "Course"} - Lectures</CardTitle>
          <CardDescription>
            Manage the lectures for this course. Add, edit, or remove lectures as needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
          ) : lectures && lectures.length > 0 ? (
            <Table>
              <TableCaption>List of lectures for this course</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Video</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lectures.map((lecture, index) => (
                  <TableRow key={lecture._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      Lecture {index + 1}: {lecture.lectureTitle}
                    </TableCell>
                    <TableCell>
                      {lecture.isPreview ? (
                        <Badge className="bg-green-500">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {lecture.videoUrl ? (
                        <a 
                          href={lecture.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-500 hover:text-blue-700"
                        >
                          <FileVideo size={16} className="mr-1" />
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">No video</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => navigate(`/admin/course/${courseId}/lecture/${lecture._id}`)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => handleDeleteLecture(lecture._id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <FileVideo className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium">No lectures yet</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first lecture</p>
              <Button 
                onClick={() => navigate(`/admin/course/${courseId}/lecture/create`)}
                className="bg-violet-500 hover:bg-violet-600"
              >
                <Plus size={16} className="mr-2" />
                Add Lecture
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Lecture; 