# NeoLearn - E-Learning Platform

NeoLearn is a full-stack e-learning platform with a modern UI, built using React for the frontend and Node.js/Express for the backend.

## Features

- User authentication and authorization (login, signup, profile management)
- Course browsing and enrollment
- Video content delivery 
- Real-time chat functionality
- Google Meet integration for virtual sessions
- Responsive design with modern UI
- Screen time monitoring and analytics
- Customizable user profiles with animal avatar selection

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (v9 or higher recommended)
- MongoDB (local or Atlas cloud instance)
- Google OAuth credentials (for Meet integration)

## Installation

### Clone the repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### Install Client Dependencies

```bash
cd client
npm install
```

### Install Server Dependencies

```bash
cd server
npm install
```

## Environment Variables

### Client Environment (.env in client directory)

Create a `.env` file in the client directory with:

```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Server Environment (.env in server directory)

Create a `.env` file in the server directory with:

```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
COOKIE_EXPIRE=7
NODE_ENV=development
```

## Running the Application

### Start the Client

```bash
cd client
npm run dev
```

The client will be available at http://localhost:5173

### Start the Server

```bash
cd server
npm run dev
```

The server will run on port 8000 (or as defined in your .env file)

## Key Dependencies

### Frontend
```json
"dependencies": {
  "@radix-ui/react-avatar": "^1.1.4",
  "@radix-ui/react-checkbox": "^1.2.3",
  "@radix-ui/react-dialog": "^1.1.7",
  "@radix-ui/react-label": "^2.1.3",
  "@radix-ui/react-progress": "^1.1.4",
  "@radix-ui/react-radio-group": "^1.2.4",
  "@radix-ui/react-select": "^2.2.2",
  "@radix-ui/react-slot": "^1.2.0",
  "@radix-ui/react-tabs": "^1.1.9",
  "@react-oauth/google": "^0.12.1",
  "@react-three/drei": "^9.56.7",
  "@react-three/fiber": "^8.13.7",
  "@reduxjs/toolkit": "^2.6.1",
  "@tiptap/extension-underline": "^2.11.7",
  "@tiptap/react": "^2.11.7",
  "@tiptap/starter-kit": "^2.11.7",
  "axios": "^1.8.4",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "date-fns": "^4.1.0",
  "framer-motion": "^12.9.2",
  "googleapis": "^148.0.0",
  "lucide-react": "^0.487.0",
  "next-themes": "^0.4.6",
  "pusher-js": "^8.4.0",
  "react": "^18.2.0",
  "react-countup": "^6.5.3",
  "react-dom": "^18.2.0",
  "react-error-boundary": "^5.0.0",
  "react-player": "^2.16.0",
  "react-redux": "^9.2.0",
  "react-router-dom": "^6.30.0",
  "redux-persist": "^6.0.0",
  "sonner": "^2.0.3",
  "tailwind-merge": "^3.2.0",
  "tailwindcss-animate": "^1.0.7",
  "three": "^0.153.0"
}
```

### Backend
```json
"dependencies": {
  "bcryptjs": "^3.0.2",
  "cloudinary": "^2.6.0",
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.5",
  "datauri": "^4.1.0",
  "dotenv": "^16.5.0",
  "express": "^5.1.0",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.13.2",
  "multer": "^1.4.5-lts.2",
  "nodemon": "^3.1.9",
  "pusher": "^5.2.0"
}
```

## Google OAuth Configuration

To use the Google Meet scheduling functionality:

1. Create a Google Cloud Platform project
2. Set up OAuth 2.0 credentials
3. Enable the Google Calendar API
4. Add the client ID to your client environment variables
5. Add the authorized redirect URIs in the Google Cloud Console (e.g., http://localhost:5173/oauth-callback)

## Technologies Used

### Frontend
- React
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS and Radix UI for styling
- Three.js for 3D graphics
- Framer Motion for animations
- Vite for build tooling

### Backend
- Express.js
- MongoDB with Mongoose for data storage
- JWT for authentication
- Cloudinary for image/file uploads
- Pusher for real-time functionality

## Project Structure

```
├── client                  # Frontend React application
│   ├── public              # Static assets
│   │   ├── assets          # Images, fonts, etc.
│   │   ├── src             # Source code
│   │   │   ├── components  # Reusable components
│   │   │   ├── lib         # Utilities and configurations
│   │   │   ├── pages       # Page components
│   │   │   └── ...
├── server                  # Backend Express application
│   ├── controllers         # Route controllers
│   ├── middlewares         # Express middlewares
│   ├── models              # Mongoose models
│   ├── routes              # API routes
│   └── ...
```

## Troubleshooting

- **Authentication Issues**: Ensure your Google OAuth credentials are correctly configured
- **Database Connection**: Verify your MongoDB connection string is correct
- **API Errors**: Check server logs for detailed error messages
- **Styling Issues**: Make sure Tailwind CSS is properly configured and building

## License

[MIT](LICENSE)

## Key Features Implementation

### Animal Avatar Selection

The platform includes a customizable profile feature allowing users to select from 12 different animal avatars:

- Implementation uses SVG-based avatars stored as Base64 data URLs for better performance
- Added to user profiles and displayed in the navigation bar
- No external dependencies required (SVGs created and embedded in the codebase)

#### Implementation Details:

1. **Database Changes**:
   - Added `avatarId` field to the User model

2. **Server-side Changes**:
   - Updated the profile controller to handle avatar selection
   - Modified the API to clear photo URL when avatar is selected and vice versa

3. **Frontend Updates**:
   - Created SVG avatars for 12 animals (dog, cat, fox, lion, panda, rabbit, koala, bear, tiger, owl, penguin, monkey)
   - Enhanced profile page with tabbed interface for photo upload or avatar selection
   - Updated navbar component to display the selected avatar

4. **Files Modified**:
   - `/server/models/user.model.js` - Added avatarId field
   - `/server/controllers/user.controller.js` - Updated to handle avatar selection
   - `/client/src/assets/avatars/animal-avatars.js` - Created SVG avatar collection
   - `/client/src/pages/Profile.jsx` - Updated UI for avatar selection
   - `/client/src/components/Navbar.jsx` - Updated to display avatars 