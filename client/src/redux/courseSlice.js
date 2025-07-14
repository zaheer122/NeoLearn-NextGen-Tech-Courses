import { createSlice } from "@reduxjs/toolkit"


const courseSlice = createSlice({
    name:"course",
    initialState:{
        course:null
    },
    reducers:{
        // actions
        setCourse:(state, action) => {
            state.course = action.payload;
        }
    }
});

export const {setCourse} = courseSlice.actions;
export default courseSlice.reducer;
