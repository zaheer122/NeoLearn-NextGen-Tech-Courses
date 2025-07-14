import React, { useState, useEffect } from "react";
import { BookOpen, View, QrCode, Scan } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import logo from  '../assets/logo.jpg';
import animalAvatars from "../assets/avatars/animal-avatars";
import { setUser } from "@/redux/authSlice";
import { endSession } from "@/redux/screenTimeSlice";
import { motion, AnimatePresence } from "framer-motion";

// Get avatar options from our SVG data
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

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((store) => store.auth);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [arMenuOpen, setArMenuOpen] = useState(false);

  // Add scroll event listener with throttling for performance
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logoutHandler = async (e) => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/user/logout", {
        withCredentials: true,
      });
      if (res.data.success) {
        navigate('/')
        dispatch(setUser(null));
        dispatch(endSession());
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  // Animation variants
  const navbarVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const logoVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { delay: 0.2, duration: 0.5 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  };

  const linkVariants = {
    hover: { scale: 1.1, color: "#a78bfa", transition: { duration: 0.2 } }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05, 
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 } 
    },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
  };

  const staggerMenuItems = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const menuItemVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  // Determine if a link is active
  const isLinkActive = (path) => {
    return location.pathname === path;
  };

  // Function to get the profile image src based on user data
  const getProfileImage = () => {
    if (user?.photoUrl) return user.photoUrl;
    if (user?.avatarId) {
      const avatar = avatarOptions.find(av => av.id === user.avatarId);
      return avatar?.src || "";
    }
    return "";
  };

  return (
    <motion.div 
      className={`${isScrolled 
        ? 'bg-gray-900/90 backdrop-blur-lg shadow-lg' 
        : 'bg-gray-900'} 
        z-50 w-full py-3 fixed top-0 transition-all duration-300`}
      variants={navbarVariants}
      initial="initial"
      animate="animate"
      style={{
        boxShadow: isScrolled 
          ? '0 10px 30px -10px rgba(0, 0, 0, 0.3)' 
          : 'none'
      }}
    >
      <div className="max-w-7xl mx-auto flex justify-between px-4 md:px-6">
        {/* logo section */}
        <Link to="/">
          <motion.div 
            className="flex gap-1 items-center"
            variants={logoVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
          >
            <motion.img 
              src={logo} 
              className="text-gray-300 w-10 h-10 rounded-full" 
              animate={{ 
                rotate: [0, 5, 0, -5, 0],
                boxShadow: [
                  '0 0 0 rgba(167, 139, 250, 0)',
                  '0 0 20px rgba(167, 139, 250, 0.5)',
                  '0 0 0 rgba(167, 139, 250, 0)'
                ]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                repeatType: "loop",
                ease: "easeInOut",
                times: [0, 0.25, 0.5, 0.75, 1]
              }}
            />
            <motion.h1 
              className="text-gray-300 text-3xl font-bold"
              animate={{ 
                color: ["#d1d5db", "#8b5cf6", "#d1d5db"],
                textShadow: [
                  '0 0 0px rgba(139, 92, 246, 0)', 
                  '0 0 10px rgba(139, 92, 246, 0.5)', 
                  '0 0 0px rgba(139, 92, 246, 0)'
                ]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              NeoLearn
            </motion.h1>
          </motion.div>
        </Link>

        {/* Mobile menu button - visible on small screens */}
        <motion.div 
          className="md:hidden flex items-center"
          whileTap={{ scale: 0.9 }}
        >
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white focus:outline-none"
          >
            <motion.div
              className="w-6 h-0.5 bg-white mb-1.5"
              animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 8 : 0 }}
            />
            <motion.div
              className="w-6 h-0.5 bg-white mb-1.5"
              animate={{ opacity: menuOpen ? 0 : 1 }}
            />
            <motion.div
              className="w-6 h-0.5 bg-white"
              animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -8 : 0 }}
            />
          </button>
        </motion.div>

        {/* Desktop menu */}
        <motion.nav 
          className="hidden md:block"
          variants={staggerMenuItems} 
          initial="initial" 
          animate="animate"
        >
          <motion.ul className="flex gap-7 text-xl items-center font-semibold text-white">
            <Link to="/">
              <motion.li 
                className={`cursor-pointer ${isLinkActive('/') ? 'text-violet-400' : 'text-white'}`}
                variants={menuItemVariants}
                whileHover={linkVariants.hover}
              > 
                <div className="relative">
                  Home
                  {isLinkActive('/') && (
                    <motion.div 
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-violet-400 rounded-full"
                      layoutId="underline"
                    />
                  )}
                </div>
              </motion.li>
            </Link>
            <Link to="/courses">
              <motion.li 
                className={`cursor-pointer ${isLinkActive('/courses') ? 'text-violet-400' : 'text-white'}`}
                variants={menuItemVariants}
                whileHover={linkVariants.hover}
              > 
                <div className="relative">
                  Courses
                  {isLinkActive('/courses') && (
                    <motion.div 
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-violet-400 rounded-full"
                      layoutId="underline"
                    />
                  )}
                </div>
              </motion.li>
            </Link>
            <Link to="/about">
              <motion.li 
                className={`cursor-pointer ${isLinkActive('/about') ? 'text-violet-400' : 'text-white'}`}
                variants={menuItemVariants}
                whileHover={linkVariants.hover}
              > 
                <div className="relative">
                  About
                  {isLinkActive('/about') && (
                    <motion.div 
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-violet-400 rounded-full"
                      layoutId="underline"
                    />
                  )}
                </div>
              </motion.li>
            </Link>
            <Link to="/contact">
              <motion.li 
                className={`cursor-pointer ${isLinkActive('/contact') ? 'text-violet-400' : 'text-white'}`}
                variants={menuItemVariants}
                whileHover={linkVariants.hover}
              > 
                <div className="relative">
                  Contact
                  {isLinkActive('/contact') && (
                    <motion.div 
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-violet-400 rounded-full"
                      layoutId="underline"
                    />
                  )}
                </div>
              </motion.li>
            </Link>

            {user && (
              <Link to="/chat">
                <motion.li 
                  className={`cursor-pointer ${isLinkActive('/chat') ? 'text-violet-400' : 'text-white'}`}
                  variants={menuItemVariants}
                  whileHover={linkVariants.hover}
                > 
                  <div className="relative">
                    Chat
                    {isLinkActive('/chat') && (
                      <motion.div 
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-violet-400 rounded-full"
                        layoutId="underline"
                      />
                    )}
                  </div>
                </motion.li>
              </Link>
            )}

            {/* AR/VR Dropdown */}
            <motion.li 
              className="relative"
              variants={menuItemVariants}
              onMouseEnter={() => setArMenuOpen(true)}
              onMouseLeave={() => setArMenuOpen(false)}
            >
              <motion.div 
                className={`cursor-pointer flex items-center gap-2 ${isLinkActive('/ar') ? 'text-violet-400' : 'text-white'}`}
                whileHover={linkVariants.hover}
              >
                <View className="w-5 h-5" />
                <span>AR/VR</span>
              </motion.div>

              {/* AR/VR Dropdown Menu */}
              <AnimatePresence>
                {arMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2"
                  >
                    <Link to="/ar/viewer">
                      <motion.div 
                        className="px-4 py-2 text-white hover:bg-gray-700 flex items-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        <View className="w-4 h-4" />
                        <span>AR Viewer</span>
                      </motion.div>
                    </Link>
                    <Link to="/ar/scanner">
                      <motion.div 
                        className="px-4 py-2 text-white hover:bg-gray-700 flex items-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        <Scan className="w-4 h-4" />
                        <span>AR Scanner</span>
                      </motion.div>
                    </Link>
                    <Link to="/ar/generator">
                      <motion.div 
                        className="px-4 py-2 text-white hover:bg-gray-700 flex items-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        <QrCode className="w-4 h-4" />
                        <span>QR Generator</span>
                      </motion.div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>

            {!user ? (
              <motion.div 
                className="flex gap-3"
                variants={menuItemVariants}
              >
                <Link to="/login">
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button className="bg-violet-500 hover:bg-violet-600 transition-all">
                      Login
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/signup">
                  <motion.div
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button className="bg-gray-700 hover:bg-blue-800 transition-all">
                      Signup
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center gap-7"
                variants={menuItemVariants}
              >
                {
                  user.role ==="instructor" && 
                  <Link to="/admin/dashboard">
                    <motion.li 
                      className={`cursor-pointer ${isLinkActive('/admin/dashboard') ? 'text-violet-400' : 'text-white'}`}
                      whileHover={linkVariants.hover}
                    > 
                      <div className="relative">
                        Admin
                        {isLinkActive('/admin/dashboard') && (
                          <motion.div 
                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-violet-400 rounded-full"
                            layoutId="underline"
                          />
                        )}
                      </div>
                    </motion.li>
                  </Link>
                }
                {
                  user.role ==="student" && 
                  <Link to="/dashboard">
                    <motion.li 
                      className={`cursor-pointer ${isLinkActive('/dashboard') ? 'text-violet-400' : 'text-white'}`}
                      whileHover={linkVariants.hover}
                    > 
                      <div className="relative">
                        dashboard
                        {isLinkActive('/dashboard') && (
                          <motion.div 
                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-violet-400 rounded-full"
                            layoutId="underline"
                          />
                        )}
                      </div>
                    </motion.li>
                  </Link>
                }
                <Link to="/profile">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <Avatar>
                      <AvatarImage
                        src={getProfileImage()}
                        alt={user.name || "User"}
                      />
                      <AvatarFallback>
                        {user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    {isLinkActive('/profile') && (
                      <motion.div 
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-violet-400 rounded-full"
                        layoutId="underline"
                      />
                    )}
                  </motion.div>
                </Link>

                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    onClick={logoutHandler}
                    className="bg-blue-500 hover:bg-blue-600 transition-all"
                  >
                    Logout
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </motion.ul>
        </motion.nav>
      </div>

      {/* Mobile menu - slides in from the top */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed top-0 right-0 h-full w-64 bg-gray-900 shadow-lg md:hidden"
          >
            <div className="p-4">
              <button
                onClick={() => setMenuOpen(false)}
                className="text-white mb-4"
              >
                <motion.div
                  className="w-6 h-0.5 bg-white mb-1.5"
                  animate={{ rotate: 45, y: 8 }}
                />
                <motion.div
                  className="w-6 h-0.5 bg-white"
                  animate={{ rotate: -45, y: -8 }}
                />
              </button>

              <motion.ul className="space-y-4">
                <Link to="/">
                  <motion.li 
                    className={`text-lg font-semibold ${isLinkActive('/') ? 'text-violet-400' : 'text-white'}`}
                    variants={menuItemVariants}
                    whileHover={linkVariants.hover}
                    onClick={() => setMenuOpen(false)}
                  >
                    Home
                  </motion.li>
                </Link>
                <Link to="/courses">
                  <motion.li 
                    className={`text-lg font-semibold ${isLinkActive('/courses') ? 'text-violet-400' : 'text-white'}`}
                    variants={menuItemVariants}
                    whileHover={linkVariants.hover}
                    onClick={() => setMenuOpen(false)}
                  >
                    Courses
                  </motion.li>
                </Link>
                <Link to="/about">
                  <motion.li 
                    className={`text-lg font-semibold ${isLinkActive('/about') ? 'text-violet-400' : 'text-white'}`}
                    variants={menuItemVariants}
                    whileHover={linkVariants.hover}
                    onClick={() => setMenuOpen(false)}
                  >
                    About
                  </motion.li>
                </Link>
                <Link to="/contact">
                  <motion.li 
                    className={`text-lg font-semibold ${isLinkActive('/contact') ? 'text-violet-400' : 'text-white'}`}
                    variants={menuItemVariants}
                    whileHover={linkVariants.hover}
                    onClick={() => setMenuOpen(false)}
                  >
                    Contact
                  </motion.li>
                </Link>
                {user && user.role === "instructor" && (
                  <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)}>
                    <motion.li 
                      className={`text-lg font-semibold ${isLinkActive('/admin/dashboard') ? 'text-violet-400' : 'text-white'}`}
                      variants={menuItemVariants}
                      whileHover={linkVariants.hover}
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin
                    </motion.li>
                  </Link>
                )}
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setMenuOpen(false)}>
                      <motion.li 
                        className={`text-lg font-semibold ${isLinkActive('/profile') ? 'text-violet-400' : 'text-white'}`}
                        variants={menuItemVariants}
                        whileHover={linkVariants.hover}
                        onClick={() => setMenuOpen(false)}
                      >
                        Profile
                      </motion.li>
                    </Link>
                    <motion.li 
                      className={`text-lg font-semibold ${isLinkActive('/profile') ? 'text-violet-400' : 'text-white'}`}
                      variants={menuItemVariants}
                      whileHover={linkVariants.hover}
                      onClick={() => {
                        logoutHandler();
                        setMenuOpen(false);
                      }}
                    >
                      Logout
                    </motion.li>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" onClick={() => setMenuOpen(false)}>
                      <motion.button
                        className="w-full bg-violet-500 hover:bg-violet-600 text-white py-2 rounded-md font-semibold"
                        whileTap={{ scale: 0.95 }}
                      >
                        Login
                      </motion.button>
                    </Link>
                    <Link to="/signup" onClick={() => setMenuOpen(false)}>
                      <motion.button
                        className="w-full bg-gray-700 hover:bg-blue-800 text-white py-2 rounded-md font-semibold"
                        whileTap={{ scale: 0.95 }}
                      >
                        Signup
                      </motion.button>
                    </Link>
                  </div>
                )}

                {/* AR/VR Mobile Menu Items */}
                <motion.li variants={menuItemVariants}>
                  <Link to="/ar/viewer" onClick={() => setMenuOpen(false)}>
                    <motion.div 
                      className="text-white hover:text-violet-400 flex items-center gap-2"
                      whileHover={{ x: 5 }}
                    >
                      <View className="w-5 h-5" />
                      <span>AR Viewer</span>
                    </motion.div>
                  </Link>
                </motion.li>
                <motion.li variants={menuItemVariants}>
                  <Link to="/ar/scanner" onClick={() => setMenuOpen(false)}>
                    <motion.div 
                      className="text-white hover:text-violet-400 flex items-center gap-2"
                      whileHover={{ x: 5 }}
                    >
                      <Scan className="w-5 h-5" />
                      <span>AR Scanner</span>
                    </motion.div>
                  </Link>
                </motion.li>
                <motion.li variants={menuItemVariants}>
                  <Link to="/ar/generator" onClick={() => setMenuOpen(false)}>
                    <motion.div 
                      className="text-white hover:text-violet-400 flex items-center gap-2"
                      whileHover={{ x: 5 }}
                    >
                      <QrCode className="w-5 h-5" />
                      <span>QR Generator</span>
                    </motion.div>
                  </Link>
                </motion.li>
              </motion.ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Navbar;
