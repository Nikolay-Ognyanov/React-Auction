import { createSlice } from "@reduxjs/toolkit"

// Creating a slice for managing auctions
export const auctionsSlice = createSlice({
    name: "auctions", // The name of the slice
    initialState: [], // The initial state of the slice (empty array)
    reducers: {
        // Action for setting auctions
        setAuctions: (state, { payload }) => {
            // Set the state to the payload received
            return state = payload
        },
        // Action for updating an auction
        updateAuction: (state, { payload }) => {
            // Map through the state and replace the auction with the same _id as the payload with the updated payload
            return state = state.map(a => a._id === payload._id ? payload : a)
        },
        // Action for deleting an auction
        deleteAuction: (state, { payload }) => {
            // Filter out the auction with the given _id from the state
            return state = state.filter(a => a._id !== payload)
        }
    }
})

// Exporting actions
export const { setAuctions, updateAuction, deleteAuction } = auctionsSlice.actions
// Exporting the reducer
export const auctionsReducer = auctionsSlice.reducer