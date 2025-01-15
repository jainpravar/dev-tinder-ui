import { createSlice } from "@reduxjs/toolkit";

const initialState = null;
const feedSlie = createSlice({
    name: "feed",
    initialState,
    reducers:{
        addFeed:(state, action)=>{
            return action.payload;
        },
        removeFeed:(state, action)=>{
            return state.filter(feed=>feed._id !== action.payload)
        }

    }
});

export const {addFeed, removeFeed} = feedSlie.actions;
export default feedSlie.reducer;