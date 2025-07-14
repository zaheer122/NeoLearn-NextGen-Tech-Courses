import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  screenTimeStarted: null,
  totalScreenTime: 0,
  lastBreakTime: null,
  breakAlertShown: false,
  sessionActive: false
};

const screenTimeSlice = createSlice({
  name: 'screenTime',
  initialState,
  reducers: {
    startScreenTimeTracking: (state) => {
      if (typeof state === 'string') {
        return {
          ...initialState,
          screenTimeStarted: Date.now(),
          sessionActive: true
        };
      }
      
      if (!state.sessionActive) {
        state.screenTimeStarted = Date.now();
        state.sessionActive = true;
        state.totalScreenTime = 0;
        state.breakAlertShown = false;
      }
    },
    updateScreenTime: (state, action) => {
      if (typeof state === 'string') {
        return {
          ...initialState,
          totalScreenTime: action.payload,
          sessionActive: true,
          screenTimeStarted: Date.now()
        };
      }
      
      if (state.sessionActive && state.screenTimeStarted) {
        state.totalScreenTime = action.payload;
      }
    },
    resetScreenTime: (state) => {
      if (typeof state === 'string') {
        return {
          ...initialState,
          screenTimeStarted: Date.now(),
          lastBreakTime: Date.now()
        };
      }
      
      state.screenTimeStarted = Date.now();
      state.totalScreenTime = 0;
      state.lastBreakTime = Date.now();
      state.breakAlertShown = false;
    },
    setBreakAlertShown: (state, action) => {
      if (typeof state === 'string') {
        return {
          ...initialState,
          breakAlertShown: action.payload
        };
      }
      
      state.breakAlertShown = action.payload;
    },
    takeBreak: (state) => {
      if (typeof state === 'string') {
        return {
          ...initialState,
          lastBreakTime: Date.now(),
          screenTimeStarted: Date.now()
        };
      }
      
      state.lastBreakTime = Date.now();
      state.screenTimeStarted = Date.now();
      state.breakAlertShown = false;
    },
    endSession: (state) => {
      if (typeof state === 'string') {
        return initialState;
      }
      
      state.sessionActive = false;
      state.screenTimeStarted = null;
      state.totalScreenTime = 0;
      state.breakAlertShown = false;
      state.lastBreakTime = null;
    }
  }
});

export const { 
  startScreenTimeTracking, 
  updateScreenTime, 
  resetScreenTime, 
  setBreakAlertShown,
  takeBreak,
  endSession
} = screenTimeSlice.actions;

export default screenTimeSlice.reducer; 