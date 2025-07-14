import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lectures: [],
  loading: false,
  error: null
};

const lectureSlice = createSlice({
  name: 'lecture',
  initialState,
  reducers: {
    // Set all lectures for a course
    setLectures: (state, action) => {
      state.lectures = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    // Add a new lecture to the state
    addLecture: (state, action) => {
      state.lectures.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    
    // Update an existing lecture
    updateLecture: (state, action) => {
      const index = state.lectures.findIndex(
        lecture => lecture._id === action.payload._id
      );
      if (index !== -1) {
        state.lectures[index] = action.payload;
      }
      state.loading = false;
      state.error = null;
    },
    
    // Delete a lecture
    deleteLecture: (state, action) => {
      state.lectures = state.lectures.filter(
        lecture => lecture._id !== action.payload
      );
      state.loading = false;
      state.error = null;
    },
    
    // Set loading state
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    // Clear loading state
    clearLoading: (state) => {
      state.loading = false;
    },
    
    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { 
  setLectures, 
  addLecture, 
  updateLecture, 
  deleteLecture, 
  setLoading, 
  clearLoading,
  setError 
} = lectureSlice.actions;

export default lectureSlice.reducer; 