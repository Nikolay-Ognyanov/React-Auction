// Function to set user data in local storage.
export function set(user) {
    localStorage.setItem("user", JSON.stringify(user)) // Store user data as a JSON string in local storage
}
// Function to get user data from local storage.
export function get(key) {
    const localUser = JSON.parse(localStorage.getItem("user")) // Retrieve user data from local storage and parse it as JSON
    // If localUser is truthy and key is provided, return the value corresponding to the key; otherwise, return the entire localUser object.
    return localUser && key ? localUser[key] : localUser
}