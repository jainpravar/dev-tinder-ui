import { createSlice } from "@reduxjs/toolkit";

const requests = createSlice({
    name:"requests",
    initialState: null,
    reducers:{
        addRequests: (state, action) => action.payload,
        removeRequest:(state, action) =>{
            return state.filter((req)=> req._id !== action.payload)
        }
    }
})

export const {addRequests, removeRequest} = requests.actions;
export default requests.reducer;