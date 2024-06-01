import { useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import * as service from "../util/service" // Importing service functions
import * as userActions from "../features/user" // Importing user-related actions
import * as usersActions from "../features/users" // Importing users-related actions
import * as localUser from "../util/localUser" // Importing local user utility

export function Auth() {
    const dispatch = useDispatch() // Redux dispatch function
    const navigate = useNavigate() // Navigation function
    
    const initialState = { username: "", password: "" } // Initial form state
    
    // State variables
    const [inputs, setInputs] = useState(initialState) // Form input values
    const [errors, setErrors] = useState({ ...initialState, server: "" }) // Form validation errors
    const [isRegistering, setIsRegistering] = useState(true) // Flag for registration/login mode

    // Function to handle input changes
    function handleInputChange(event) {
        const { name, value } = event.target

        // Update input values and clear server error
        setInputs({ ...inputs, [name]: value })
        setErrors({ ...errors, server: "" })

        // Validate input
        validateInput(event)
    }

    // Function to validate input fields
    function validateInput(event) {
        const { name, value } = event.target

        // Update validation errors
        setErrors(state => {
            const stateObject = { ...state, [name]: "" }

            if (name === "username") {
                if (value.length < 2 || value.length > 20) {
                    stateObject[name] = "Username must be between 2 and 20 characters long."
                }
            } else if (name === "password") {
                if (value.length < 5) {
                    stateObject[name] = "Password must be at least 5 characters long."
                }
            }

            return stateObject
        })
    }

    // Function to handle form submission
    async function handleSubmit(event) {
        event.preventDefault()

        const formData = Object.fromEntries(new FormData(event.target))

        // Check for empty input fields
        if (!Object.values(formData).some(v => !v.trim())) {
            let response = null

            // Perform registration or login based on mode
            if (isRegistering) {
                response = await service.register({
                    ...formData,
                    wallet: 10000,
                    wonAuctions: []
                })

                // If username is taken, try to login
                if (response?.message === "Username is taken.") {
                    response = await service.login(formData)
                }
            } else {
                response = await service.login(formData)
            }

            // If successful response, update user data
            if (response && !response.message) {
                // Ensure user has minimum wallet balance
                if (response.wallet <= 0) {
                    response = { ...response, wallet: 10000 }
                    await service.updateUser(response)
                }

                // Save user data locally
                localUser.set(response)

                // Update user data in Redux store
                dispatch(userActions.setUser(response))

                // Fetch all users and update Redux store
                const { users } = await service.readUsers()
                dispatch(usersActions.setUsers(users))

                // If current user not in the list, add to Redux store
                if (users.length > 0 && !users.find(u => u._id === response._id)) {
                    dispatch(usersActions.addUser(response))
                }

                // Redirect to home page
                navigate("/")
            } else if (response && response.message) {
                // If response contains an error message, display it
                setErrors(state => ({ ...state, server: response.message }))
            }
        }
    }

    return (
        <div className="auth">
            {/* Authentication form */}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={inputs.username}
                    onChange={handleInputChange}
                    onBlur={validateInput}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={inputs.password}
                    onChange={handleInputChange}
                    onBlur={validateInput}
                />

                {/* Render registration/login buttons if no errors */}
                {
                    !Object.values(errors).some(entry => entry !== "") &&
                    !Object.values(inputs).some(entry => entry === "") &&

                    <div className="buttonsWrapper">
                        <button onClick={() => setIsRegistering(true)}>Register</button>
                        <button onClick={() => setIsRegistering(false)}>Login</button>
                    </div>
                }
            </form>

            {/* Display validation errors */}
            <div className="errorsWrapper">
                {errors.username && <p className="error">{errors.username}</p>}
                {errors.password && <p className="error">{errors.password}</p>}
                {errors.server && <p className="error">{errors.server}</p>}
            </div>
        </div>
    )
}