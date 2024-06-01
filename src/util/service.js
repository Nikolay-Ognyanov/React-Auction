import * as request from "./request" // Importing request module

const url = "http://localhost:3030" // Base URL of the API

// Function to read data from the API
export function readData() {
    return request.get(url) // Make a GET request to the base URL
}

// Function to register a new user
export function register(data) {
    return request.post(`${url}/users/register`, data) // Make a POST request to the user registration endpoint
}

// Function to log in a user
export function login(data) {
    return request.post(`${url}/users/login`, data) // Make a POST request to the user login endpoint
}

// Function to log out a user
export function logout(data) {
    return request.post(`${url}/users/logout`, data) // Make a POST request to the user logout endpoint
}

// Function to read users from the API
export function readUsers() {
    return request.get(`${url}/users`) // Make a GET request to the users endpoint
}

// Function to update a user's information
export function updateUser(user) {
    return request.put(`${url}/users/${user._id}`, user) // Make a PUT request to update a specific user's information
}

// Function to create a new auction
export function createAuction(data) {
    return request.post(`${url}/auctions`, data) // Make a POST request to create a new auction
}

// Function to read auctions from the API
export function readAuctions() {
    return request.get(`${url}/auctions`) // Make a GET request to the auctions endpoint
}

// Function to update an auction's information
export function updateAuction(auctionId, data) {
    return request.put(`${url}/auctions/${auctionId}`, data) // Make a PUT request to update a specific auction's information
}

// Function to delete an auction
export function deleteAuction(auctionId) {
    return request.del(`${url}/auctions/${auctionId}`) // Make a DELETE request to delete a specific auction
}