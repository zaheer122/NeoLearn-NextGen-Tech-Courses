import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, Award, Target, GraduationCap, Clock, Globe } from "lucide-react";
import joban from '../assets/joban.webp'

const AboutUs = () => {
  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Quality Education",
      description: "We provide high-quality courses designed by industry experts to ensure the best learning experience."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Expert Instructors",
      description: "Our instructors are experienced professionals who are passionate about teaching and sharing knowledge."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Certified Learning",
      description: "Earn recognized certificates upon completion of courses to boost your professional credentials."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Career Focused",
      description: "Our courses are designed to help you achieve your career goals and advance in your professional journey."
    }
  ];

  const stats = [
    {
      icon: <GraduationCap className="w-6 h-6" />,
      value: "10,000+",
      label: "Students Enrolled"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      value: "500+",
      label: "Courses Available"
    },
    {
      icon: <Users className="w-6 h-6" />,
      value: "200+",
      label: "Expert Instructors"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      value: "50+",
      label: "Countries Reached"
    }
  ];

  const teamMembers = [
    
    {
      name: "Jobandeep Singh",
      role: "Head of Education",
      image: joban,
      description: "Student at Lovely Professional University"
    },
    
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center mb-6 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium" role="status">
            <BookOpen className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>Our Story</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
            About Us
          </h1>
          <p className="text-lg text-slate-600">
            Empowering learners worldwide with quality education and practical skills
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          role="region"
          aria-label="Key Statistics"
        >
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
              <div className="text-violet-600 mb-3 flex justify-center" aria-hidden="true">{stat.icon}</div>
              <div className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Mission Section */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          role="region"
          aria-label="Our Mission"
        >
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Our Mission</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            We are dedicated to making quality education accessible to everyone. Our platform brings together expert instructors
            and passionate learners, creating an environment where knowledge is shared and skills are developed. We believe in
            the power of education to transform lives and create opportunities for growth and success.
          </p>
          <div className="flex items-center text-slate-600">
            <Clock className="w-5 h-5 mr-2" aria-hidden="true" />
            <span>Founded in 2020</span>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          role="region"
          aria-label="Our Features"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <div className="text-violet-600 mb-4" aria-hidden="true">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Team Section */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          role="region"
          aria-label="Our Team"
        >
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">Our Team</h2>
          <p className="text-slate-600 leading-relaxed mb-8">
            Our team consists of passionate educators, industry experts, and technology professionals who work together
            to create an exceptional learning experience. We are committed to continuous improvement and innovation
            in education.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              >
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <img
                    src={member.image}
                    alt={`${member.name}, ${member.role}`}
                    className="rounded-full w-full h-full object-cover border-4 border-white shadow-lg"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-1">{member.name}</h3>
                <p className="text-violet-600 font-medium mb-2">{member.role}</p>
                <p className="text-slate-600 text-sm">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs; 