import * as localUser from "./localUser"
// Function for making HTTP requests.
async function requester(url, method, data) {
    const accessToken = localUser.get("accessToken") // Get the access token from local storage.
    const headers = {} // Initialize an empty object for headers.
    // If an access token exists, add it to the headers with the key "X-Authorization".
    if (accessToken) { 
        headers["X-Authorization"] = accessToken 
    }
    // Function to make the actual HTTP request.
    function makeRequest(url, method, data) {
        if (method === "GET") {
            // For GET requests, simply fetch the data from the specified URL.
            return fetch(url)
        } else {
            // For other methods (POST, PUT, DELETE) include method, headers, and data in the fetch options.
            return fetch(url, {
                method,
                headers: {
                    ...headers, // Include the headers object.
                    "Content-Type": "application/json" // Set content type to JSON.
                },
                body: JSON.stringify(data) // Convert data to JSON string for the body.
            })
        }
    }
    try {
        // Make the request using the provided URL, method, and data.
        const response = await makeRequest(url, method, data)
        // If there's a message in the response object, log it.
        if (response.message) {
            console.log(response.message)
        } else if (response.status !== 204) { // If the status code is not 204 (no content).
            return await response.json() // Return the JSON response.
        }
    } catch (error) {
        console.log(error) // Log any errors that occur during the request.
    }
}
// Exporting functions for different HTTP methods.
export function get(url) { return requester(url, "GET") } // GET request.
export function post(url, data) { return requester(url, "POST", data) } // POST request.
export function put(url, data) { return requester(url, "PUT", data) } // PUT request.
export function del(url) { return requester(url, "DELETE") } // DELETE request.