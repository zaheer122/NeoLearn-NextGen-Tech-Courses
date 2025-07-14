import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  startScreenTimeTracking, 
  updateScreenTime, 
  endSession,
  setBreakAlertShown 
} from '@/redux/screenTimeSlice';

const ScreenTimeTracker = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { screenTimeStarted, sessionActive, totalScreenTime, breakAlertShown } = useSelector(state => state.screenTime);
  const intervalRef = useRef(null);
  const breakTimerRef = useRef(null);

  // Helper function to determine user age group and screen time limit
  const getUserAgeGroup = (dateOfBirth) => {
    if (!dateOfBirth) return { group: 'adult', timeLimit: 6 * 60 * 60 * 1000 }; // 6 hours in ms
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 13) {
      return { group: 'children', timeLimit: 1 * 60 * 60 * 1000 }; // 1 hour in ms
    } else if (age < 18) {
      return { group: 'teenage', timeLimit: 3 * 60 * 60 * 1000 }; // 3 hours in ms
    } else {
      return { group: 'adult', timeLimit: 6 * 60 * 60 * 1000 }; // 6 hours in ms
    }
  };

  // Start tracking when user logs in
  useEffect(() => {
    // If user is logged in but session not active, start tracking
    if (user && !sessionActive) {
      console.log('Starting screen time tracking - user detected');
      dispatch(startScreenTimeTracking());
    } 
    // If user is not logged in but session is active, end session
    else if (!user && sessionActive) {
      console.log('Ending screen time tracking - user logged out');
      dispatch(endSession());
      
      // Clear all timers
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (breakTimerRef.current) {
        clearTimeout(breakTimerRef.current);
        breakTimerRef.current = null;
      }
    }
  }, [user, sessionActive, dispatch]);

  // Set up the interval for counting screen time
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only start interval if session is active and we have a start time
    if (sessionActive && screenTimeStarted) {
      console.log('Setting up screen time counting interval');
      
      // Set up interval to update total screen time every second
      intervalRef.current = setInterval(() => {
        const elapsedTime = Date.now() - screenTimeStarted;
        dispatch(updateScreenTime(elapsedTime));
      }, 1000); // Update every second for smoother UI updates
    }
    
    // Clean up on component unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sessionActive, screenTimeStarted, dispatch]);

  // Set up break alert timer
  useEffect(() => {
    // Clear any existing break timer
    if (breakTimerRef.current) {
      clearTimeout(breakTimerRef.current);
      breakTimerRef.current = null;
    }
    
    // Only set up break timer if user is logged in and session is active
    if (user && sessionActive && screenTimeStarted && !breakAlertShown) {
      console.log('Setting up break alert timer');
      
      const { timeLimit } = getUserAgeGroup(user.dateOfBirth);
      console.log(`Break alert will show after ${timeLimit/1000/60/60} hours`);
      
      // Set timer to show break alert when time limit is reached
      breakTimerRef.current = setTimeout(() => {
        console.log('Time limit reached, showing break alert');
        dispatch(setBreakAlertShown(true));
      }, timeLimit);
    }
    
    // Clean up on unmount or when dependencies change
    return () => {
      if (breakTimerRef.current) {
        clearTimeout(breakTimerRef.current);
        breakTimerRef.current = null;
      }
    };
  }, [user, sessionActive, screenTimeStarted, breakAlertShown, dispatch]);

  // This component doesn't render anything visible
  return null;
};

export default ScreenTimeTracker; 