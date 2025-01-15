import { createSlice } from "@reduxjs/toolkit";

const connections = createSlice({
    name:"connections",
    initialState: null,
    reducers:{
        addConnections: (state, action) => action.payload,
        removeConnection:(state, action) =>{
            const filteredConnections = state.filter(conn=> conn._id !== action.payload);
            return filteredConnections;
        }
    }
})

export const {addConnections, removeConnection} = connections.actions;
export default connections.reducer;