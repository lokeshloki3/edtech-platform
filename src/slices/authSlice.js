import { createSlice } from "@reduxjs/toolkit";

// load only that values in initial state which are required as app will slow
// use localStorage for token as it will stay even after browser close
const initialState = {
    token: localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token")) : null,
    signupData: null,
    loading: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        setSignupData(state, value) {
            state.signupData = value.payload;
        },
        setLoading(state, value) {
            state.loading = value.payload;
        },
        setToken(state, value) {
            state.token = value.payload;
        },
    },
});

export const { setSignupData, setLoading, setToken } = authSlice.actions;
// one more method to export slice
export default authSlice.reducer;