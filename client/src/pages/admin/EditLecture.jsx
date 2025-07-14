import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, FileVideo, Plus, Trash2, Upload, LinkIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { updateLecture, setLoading, clearLoading } from "@/redux/lectureSlice";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const EditLecture = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { courseId, lectureId } = useParams();
  const { lectures } = useSelector(state => state.lecture);
  const [loading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [lectureTitle, setLectureTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState("content");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize a new quiz form
  const [newQuiz, setNewQuiz] = useState({
    question: "",
    options: ["", "", "", ""],
    correctOption: 0
  });

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        setFetchLoading(true);
        
        // First try to get the lecture from Redux store
        const lectureFromStore = lectures.find(lec => lec._id === lectureId);
        
        if (lectureFromStore) {
          setLectureTitle(lectureFromStore.lectureTitle);
          setDescription(lectureFromStore.description || "");
          setIsPreview(lectureFromStore.isPreview || false);
          setVideoUrl(lectureFromStore.videoUrl || "");
          setQuizzes(lectureFromStore.quiz || []);
          setFetchLoading(false);
          return;
        }
        
        // If not in store, fetch from API
        const courseResponse = await axios.get(
          `http://localhost:8000/api/v1/course/${courseId}/lecture`,
          { withCredentials: true }
        );
        
        if (courseResponse.data.success) {
          const lectures = courseResponse.data.lectures;
          const lecture = lectures.find(lec => lec._id === lectureId);
          
          if (lecture) {
            setLectureTitle(lecture.lectureTitle);
            setDescription(lecture.description || "");
            setIsPreview(lecture.isPreview || false);
            setVideoUrl(lecture.videoUrl || "");
            setQuizzes(lecture.quiz || []);
          } else {
            toast.error("Lecture not found");
            navigate(`/admin/course/${courseId}/lecture`);
          }
        }
      } catch (error) {
        console.error("Error fetching lecture:", error);
        toast.error("Failed to fetch lecture details");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchLecture();
  }, [courseId, lectureId, navigate, lectures]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is a video
      if (!file.type.startsWith('video/')) {
        setFileError("Please select a valid video file");
        setVideoFile(null);
        return;
      }
      
      // Check file size (limit to 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setFileError("File size should be less than 100MB");
        setVideoFile(null);
        return;
      }
      
      setFileError("");
      setVideoFile(file);
    }
  };

  // Quiz functions
  const handleQuizChange = (field, value) => {
    setNewQuiz({
      ...newQuiz,
      [field]: value
    });
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuiz.options];
    updatedOptions[index] = value;
    setNewQuiz({
      ...newQuiz,
      options: updatedOptions
    });
  };

  const addQuiz = () => {
    // Validate quiz
    if (!newQuiz.question.trim()) {
      toast.error("Question is required");
      return;
    }

    if (newQuiz.options.some(option => !option.trim())) {
      toast.error("All options must be filled");
      return;
    }

    // Add quiz to the list
    setQuizzes([...quizzes, newQuiz]);
    
    // Reset form
    setNewQuiz({
      question: "",
      options: ["", "", "", ""],
      correctOption: 0
    });
  };

  const removeQuiz = (index) => {
    const updatedQuizzes = [...quizzes];
    updatedQuizzes.splice(index, 1);
    setQuizzes(updatedQuizzes);
  };

  const handleSubmit = async () => {
    if (!lectureTitle.trim()) {
      toast.error("Lecture title is required");
      return;
    }

    try {
      setIsLoading(true);
      dispatch(setLoading());
      setIsUploading(videoFile ? true : false);
      
      let response;
      
      // If a new file is being uploaded, we need to use FormData
      if (videoFile) {
        const formData = new FormData();
        formData.append("file", videoFile);
        formData.append("lectureTitle", lectureTitle);
        formData.append("description", description);
        formData.append("isPreview", isPreview);
        formData.append("quiz", JSON.stringify(quizzes));
        
        response = await axios.post(
          `http://localhost:8000/api/v1/course/${courseId}/lecture/${lectureId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          }
        );
      } else {
        // Without a file, we can use JSON
        const requestBody = {
          lectureTitle,
          description,
          isPreview,
          quiz: quizzes
        };
        
        // Only add videoInfo if there's an existing video
        if (videoUrl) {
          requestBody.videoInfo = {
            videoUrl,
            publicId: videoUrl.split('/').pop().split('.')[0] // Simple extraction of publicId
          };
        }
        
        response = await axios.post(
          `http://localhost:8000/api/v1/course/${courseId}/lecture/${lectureId}`,
          requestBody,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
      }
      
      // Handle the response regardless of which method we used
      if (response && response.data.success) {
        // Update lecture in Redux store
        dispatch(updateLecture(response.data.lecture));
        toast.success(response.data.message);
        navigate(`/admin/course/${courseId}/lecture`);
      } else {
        // Handle unexpected response format
        toast.error("Unknown error occurred while updating the lecture");
      }
    } catch (error) {
      console.error("Error updating lecture:", error);
      toast.error(error.response?.data?.message || "Failed to update lecture");
    } finally {
      setIsLoading(false);
      setIsUploading(false);
      dispatch(clearLoading());
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <Button 
        variant="outline" 
        onClick={() => navigate(`/admin/course/${courseId}/lecture`)}
        className="mb-6"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Lectures
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>
            Update the details, content, and quiz for your lecture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="content" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-6">
              <div>
                <Label htmlFor="lectureTitle">Lecture Title</Label>
                <Input
                  id="lectureTitle"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  placeholder="Enter lecture title"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter lecture description"
                  className="mt-1 min-h-32"
                />
              </div>
              
              {videoUrl && (
                <div>
                  <Label>Current Video</Label>
                  <div className="mt-2 flex items-center">
                    <FileVideo size={20} className="mr-2 text-violet-500" />
                    <a 
                      href={videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View current video
                    </a>
                  </div>
                </div>
              )}
              
              <Tabs defaultValue="upload" className="w-full mt-6 border-t pt-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="upload">Replace with Upload</TabsTrigger>
                  <TabsTrigger value="url">Replace with URL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-4">
                  <div>
                    <Label htmlFor="videoFile">Replace Video (Optional)</Label>
                    <Input
                      id="videoFile"
                      type="file"
                      onChange={handleFileChange}
                      accept="video/*"
                      className="mt-1"
                    />
                    {fileError && <p className="text-sm text-red-500 mt-1">{fileError}</p>}
                    <p className="text-sm text-gray-500 mt-1">
                      Upload a new video file to replace the current one (MP4, WebM, etc.) - Max size 100MB
                    </p>
                    
                    {videoFile && !isUploading && (
                      <div className="mt-2 p-2 border rounded bg-gray-50 flex items-center">
                        <Upload size={18} className="text-violet-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium">{videoFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {isUploading && (
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Uploading video...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="url" className="space-y-4">
                  <div>
                    <Label htmlFor="newVideoUrl">Video URL</Label>
                    <div className="flex items-center mt-1">
                      <LinkIcon size={18} className="text-gray-500 absolute ml-3" />
                      <Input
                        id="newVideoUrl"
                        value={videoUrl}
                        onChange={(e) => {
                          setVideoUrl(e.target.value);
                          setVideoFile(null); // Clear video file when URL is entered
                        }}
                        placeholder="https://example.com/video.mp4"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Enter a direct link to a video file or streaming URL (e.g., YouTube embed URL)
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isPreview" 
                  checked={isPreview} 
                  onCheckedChange={setIsPreview}
                />
                <Label htmlFor="isPreview">
                  Make this lecture available as a free preview
                </Label>
              </div>
            </TabsContent>
            
            <TabsContent value="quiz" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Quiz Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="question">Question</Label>
                    <Input
                      id="question"
                      value={newQuiz.question}
                      onChange={(e) => handleQuizChange('question', e.target.value)}
                      placeholder="Enter your question"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Options</Label>
                    {newQuiz.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1"
                        />
                        <Checkbox 
                          checked={newQuiz.correctOption === index}
                          onCheckedChange={() => handleQuizChange('correctOption', index)}
                        />
                        <Label className="text-sm">Correct</Label>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={addQuiz} 
                    type="button" 
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>
              
              {quizzes.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Quiz Questions ({quizzes.length})</h3>
                  {quizzes.map((quiz, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="font-medium">Question {index + 1}</div>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => removeQuiz(index)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                        <p className="mb-4">{quiz.question}</p>
                        <div className="space-y-2">
                          {quiz.options.map((option, optIndex) => (
                            <div 
                              key={optIndex} 
                              className={`p-2 rounded-md ${quiz.correctOption === optIndex ? 'bg-green-100 border border-green-500' : 'bg-gray-100'}`}
                            >
                              {option} {quiz.correctOption === optIndex && 
                                <span className="text-green-600 font-medium">(Correct)</span>
                              }
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-md">
                  <p className="text-gray-500">No quiz questions added yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end space-x-2 mt-8">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/admin/course/${courseId}/lecture`)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-violet-500 hover:bg-violet-600"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? `Uploading (${uploadProgress}%)` : "Updating..."}
                </>
              ) : (
                "Update Lecture"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditLecture; 