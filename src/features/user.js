import { createSlice } from "@reduxjs/toolkit"

// Creating a slice for managing user data
export const userSlice = createSlice({
    name: "user", // The name of the slice
    initialState: {}, // The initial state of the slice (an empty object)
    reducers: {
        // Action for setting user data
        setUser: (state, { payload }) => {
            // Set the user data in the state
            state.value = payload
        }
    }
})

// Exporting the setUser action
export const { setUser } = userSlice.actions
// Exporting the userReducer
export const userReducer = userSlice.reducer