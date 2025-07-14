import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Upload, Link as LinkIcon } from "lucide-react";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { addLecture, setLoading } from "@/redux/lectureSlice";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CreateLecture = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { courseId } = useParams();
  const [loading, setIsLoading] = useState(false);
  const [lectureTitle, setLectureTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [fileError, setFileError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");

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
      setVideoUrl(""); // Clear video URL when a file is selected
    }
  };

  const handleSubmit = async () => {
    if (!lectureTitle.trim()) {
      toast.error("Lecture title is required");
      return;
    }

    // Check if either a file or URL is provided
    if (!videoFile && !videoUrl && activeTab === "url") {
      toast.error("Please provide either a video file or a video URL");
      return;
    }

    try {
      setIsLoading(true);
      setIsUploading(videoFile ? true : false);
      dispatch(setLoading());
      
      const formData = new FormData();
      formData.append("lectureTitle", lectureTitle);
      formData.append("description", description);
      formData.append("isPreview", isPreview);
      
      if (videoFile) {
        formData.append("file", videoFile);
      }
      
      if (videoUrl && activeTab === "url") {
        formData.append("videoUrl", videoUrl);
      }

      const response = await axios.post(
        `http://localhost:8000/api/v1/course/${courseId}/lecture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            if (videoFile) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          }
        }
      );

      if (response.data.success) {
        // Update Redux store with the new lecture
        dispatch(addLecture(response.data.lecture));
        toast.success(response.data.message);
        navigate(`/admin/course/${courseId}/lecture`);
      }
    } catch (error) {
      console.error("Error creating lecture:", error);
      toast.error(error.response?.data?.message || "Failed to create lecture");
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

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
          <CardTitle><h1 className='text-2xl'>Add New <span className='text-violet-600'>Lecture</span></h1></CardTitle>
          <CardDescription>
            Create a new lecture for your course with video content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
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
            
            <Tabs defaultValue="upload" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-2">
                <TabsTrigger value="upload">Upload Video</TabsTrigger>
                <TabsTrigger value="url">Video URL</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4">
                <Label htmlFor="videoFile">Upload Video</Label>
                <Input
                  id="videoFile"
                  type="file"
                  onChange={handleFileChange}
                  accept="video/*"
                  className="mt-1"
                />
                {fileError && <p className="text-sm text-red-500 mt-1">{fileError}</p>}
                <p className="text-sm text-gray-500 mt-1">
                  Upload a video file (MP4, WebM, etc.) - Max size 100MB
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
              </TabsContent>
              
              <TabsContent value="url" className="space-y-4">
                <div>
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <div className="flex items-center mt-1">
                    <LinkIcon size={18} className="text-gray-500 absolute ml-3" />
                    <Input
                      id="videoUrl"
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
            
            <div className="flex justify-end space-x-2 mt-6">
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
                    {isUploading ? `Uploading (${uploadProgress}%)` : "Creating..."}
                  </>
                ) : (
                  "Create Lecture"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateLecture