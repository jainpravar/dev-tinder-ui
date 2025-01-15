import { createSlice } from "@reduxjs/toolkit";

const initialState = null;
const feedSlie = createSlice({
    name: "feed",
    initialState,
    reducers:{
        addFeed:(state, action)=>{
            return action.payload;
        },

    }
});

export const {addFeed} = feedSlie.actions;
export default feedSlie.reducer;