import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    authenticated: false,
    accessToken: null,
    userData: null
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        createContext: (state, action) => {
            state.authenticated = true
            state.accessToken = action.payload.accessToken
            state.userData = action.payload.userData
        },
        destroyContext: (state) => {
            state.authenticated = false
            state.accessToken = null
            state.userData = null
        },
        updateAccessToken: (state, action) => {
            state.accessToken = action.payload
        }
    }
})

export const { createContext, destroyContext, updateAccessToken } = authSlice.actions;

export default authSlice.reducer;