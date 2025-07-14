import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-bold text-violet-400 mb-4">NeoLearn</h2>
            <p className="text-gray-400 mb-4">
              Transforming education through technology. Our platform provides access to quality courses
              for students worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-violet-400">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-violet-400">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-violet-400">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-violet-400">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-violet-400">Home</Link>
              </li>
              <li>
                <Link to="/courses" className="text-gray-400 hover:text-violet-400">Courses</Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-violet-400">My Profile</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-violet-400">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-violet-400">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/courses?category=Web Development" className="text-gray-400 hover:text-violet-400">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Data Science" className="text-gray-400 hover:text-violet-400">
                  Data Science
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Machine Learning" className="text-gray-400 hover:text-violet-400">
                  Machine Learning
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Programming Language" className="text-gray-400 hover:text-violet-400">
                  Programming 
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Cloud" className="text-gray-400 hover:text-violet-400">
                  Cloud Computing
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="text-violet-400 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  Lovely Professional University
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="text-violet-400 mr-2 flex-shrink-0" />
                <span className="text-gray-400">+91 7347680995</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="text-violet-400 mr-2 flex-shrink-0" />
                <span className="text-gray-400">jobandeepsingh2109@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center">
          <p className="text-gray-500">
            &copy; {currentYear} NeoLearn. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer