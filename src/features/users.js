import { createSlice } from "@reduxjs/toolkit"
// Creating a slice for managing users.
export const usersSlice = createSlice({
    name: "users", // The name of the slice.
    initialState: [], // The initial state of the slice (an empty array).
    reducers: {
        // Action for setting users.
        setUsers: (state, { payload }) => {
            // Set the state to the payload received.
            return state = payload
        },
        // Action for adding a user.
        addUser: (state, { payload }) => {
            // Push the new user payload into the state.
            state.push(payload)
        },
        // Action for updating a user.
        updateUser: (state, { payload }) => {
            // Map through the state and replace the user with the same _id as the payload with the updated payload.
            return state = state.map(u => u._id === payload._id ? payload : u)
        }
    }
})
// Exporting actions.
export const { setUsers, addUser, updateUser } = usersSlice.actions
// Exporting the reducer.
export const usersReducer = usersSlice.reducer