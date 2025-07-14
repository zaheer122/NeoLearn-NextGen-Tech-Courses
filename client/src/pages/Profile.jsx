import React, { useState } from "react";
import UserLogo from "../assets/s.webp";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Loader2, Edit, Mail, UserCheck, FileText, Image } from "lucide-react";
import { toast } from "sonner";
import { setUser } from "@/redux/authSlice";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import animalAvatars from "../assets/avatars/animal-avatars";

// Avatar options from our SVG collection
const avatarOptions = [
  { id: 'dog', name: 'Dog', src: animalAvatars.dog },
  { id: 'cat', name: 'Cat', src: animalAvatars.cat },
  { id: 'fox', name: 'Fox', src: animalAvatars.fox },
  { id: 'lion', name: 'Lion', src: animalAvatars.lion },
  { id: 'panda', name: 'Panda', src: animalAvatars.panda },
  { id: 'rabbit', name: 'Rabbit', src: animalAvatars.rabbit },
  { id: 'koala', name: 'Koala', src: animalAvatars.koala },
  { id: 'bear', name: 'Bear', src: animalAvatars.bear },
  { id: 'tiger', name: 'Tiger', src: animalAvatars.tiger },
  { id: 'owl', name: 'Owl', src: animalAvatars.owl },
  { id: 'penguin', name: 'Penguin', src: animalAvatars.penguin },
  { id: 'monkey', name: 'Monkey', src: animalAvatars.monkey },
];

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(store => store.auth);
  const [input, setInput] = useState({
    name: user?.name || "",
    description: user?.description || "",
    file: null,
    selectedAvatar: user?.avatarId || null
  });

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(user?.avatarId ? "preset" : "upload");

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const changeFileHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0], selectedAvatar: null });
    setTabValue("upload");
  };

  const selectAvatarHandler = (avatarId) => {
    setInput({ ...input, selectedAvatar: avatarId, file: null });
    setTabValue("preset");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", input.name);
    formData.append("description", input.description);
    
    if (tabValue === "upload" && input?.file) {
      formData.append("file", input.file);
      formData.append("avatarId", "");
    } else if (tabValue === "preset" && input.selectedAvatar) {
      formData.append("avatarId", input.selectedAvatar);
    }
    
    try {
      setLoading(true);
      const res = await axios.put('http://localhost:8000/api/v1/user/profile/update', formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        withCredentials: true,
      });
      
      if (res.data.success) {
        setOpen(false);
        toast.success(res.data.message);
        dispatch(setUser(res.data.user));
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const getProfileImage = () => {
    if (user?.photoUrl) return user.photoUrl;
    if (user?.avatarId) {
      const avatar = avatarOptions.find(av => av.id === user.avatarId);
      return avatar?.src || UserLogo;
    }
    return UserLogo;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white py-12 px-4 lg:px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden mt-14"
      >
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 h-48 w-full"></div>
        
        <div className="relative px-6 sm:px-12 pb-12">
          {/* Profile picture */}
          <div className="relative -mt-24 flex justify-center">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
              <img 
                src={getProfileImage()} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <Button 
                onClick={() => setOpen(true)} 
                variant="outline"
                size="icon"
                className="absolute bottom-0 right-0 md:right-1/3 rounded-full h-10 w-10 bg-violet-600 hover:bg-violet-700 text-white shadow-md"
              >
                <Edit size={18} />
              </Button>
              <DialogContent className="sm:max-w-[425px] rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-center text-xl font-bold text-violet-700">Edit Profile</DialogTitle>
                  <DialogDescription className="text-center">
                    Update your profile information
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right font-medium">
                            Name
                        </Label>
                        <Input 
                          id="name" 
                          placeholder="Edit your name" 
                          name="name" 
                          onChange={changeEventHandler} 
                          value={input.name} 
                          className="col-span-3 text-gray-700 border-gray-300 focus:border-violet-500"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right font-medium">
                            Bio
                        </Label>
                        <Input 
                          id="description" 
                          name="description" 
                          placeholder="Write about yourself" 
                          onChange={changeEventHandler} 
                          value={input.description} 
                          className="col-span-3 text-gray-700 border-gray-300 focus:border-violet-500"
                        />
                    </div>
                    
                    <div className="mt-2 col-span-4">
                      <Label className="font-medium mb-2 block">Profile Picture</Label>
                      <Tabs defaultValue={tabValue} value={tabValue} onValueChange={setTabValue} className="w-full">
                        <TabsList className="w-full grid grid-cols-2">
                          <TabsTrigger value="upload" className="flex items-center">
                            <Image className="mr-2 h-4 w-4" />
                            Upload Photo
                          </TabsTrigger>
                          <TabsTrigger value="preset" className="flex items-center">
                            <UserCheck className="mr-2 h-4 w-4" />
                            Choose Avatar
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="upload" className="mt-4">
                          <Input 
                            id="file" 
                            type="file" 
                            accept="image/*" 
                            onChange={changeFileHandler} 
                            className="text-sm"
                          />
                          {input.file && (
                            <div className="mt-3 flex justify-center">
                              <img 
                                src={URL.createObjectURL(input.file)} 
                                alt="Preview" 
                                className="h-24 w-24 rounded-full object-cover border-2 border-violet-200"
                              />
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="preset" className="mt-4">
                          <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto p-2">
                            {avatarOptions.map((avatar) => (
                              <div 
                                key={avatar.id}
                                onClick={() => selectAvatarHandler(avatar.id)}
                                className={`cursor-pointer rounded-lg p-1 transition-all ${
                                  input.selectedAvatar === avatar.id 
                                    ? 'bg-violet-100 ring-2 ring-violet-500' 
                                    : 'hover:bg-violet-50'
                                }`}
                              >
                                <div className="flex flex-col items-center">
                                  <img 
                                    src={avatar.src} 
                                    alt={avatar.name} 
                                    className="h-12 w-12 object-contain"
                                  />
                                  <span className="text-xs mt-1 text-center">{avatar.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                </div>
                <DialogFooter>
                  {loading ? (
                    <Button disabled className="bg-violet-500">
                      <Loader2 className="mr-2 w-4 h-4 animate-spin"/> 
                      Updating...
                    </Button>
                  ) : (
                    <Button 
                      onClick={submitHandler} 
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      Save Changes
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* User info */}
          <div className="mt-8 text-center">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text"
            >
              {user?.name || "User"}
            </motion.h1>
            
            <div className="mt-6 space-y-4 max-w-2xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center md:justify-start space-x-3 px-4 py-3 bg-violet-50 rounded-lg"
              >
                <Mail className="h-5 w-5 text-violet-600" />
                <p className="text-gray-700">{user?.email || "Email not available"}</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center md:justify-start space-x-3 px-4 py-3 bg-violet-50 rounded-lg"
              >
                <UserCheck className="h-5 w-5 text-violet-600" />
                <p className="text-gray-700">Role: <span className="font-semibold">{user?.role}</span></p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-start justify-center md:justify-start space-x-3 px-4 py-3 bg-violet-50 rounded-lg"
              >
                <FileText className="h-5 w-5 text-violet-600 mt-0.5" />
                <p className="text-gray-700 text-left">
                  <span className="font-semibold">Bio:</span><br />
                  {user?.description || "No bio available. Click Edit Profile to add one!"}
                </p>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <Dialog open={open} onOpenChange={setOpen}>
                <Button 
                  onClick={() => setOpen(true)} 
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 py-2 rounded-full shadow-md"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </Dialog>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
