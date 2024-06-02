// Import necessary styles and modules
import "./App.css"
import { Routes, Route } from "react-router-dom"
import { Auth } from "./views/Auth"
import { Auction } from "./views/Auction"
import { Nav } from "./views/Nav"
import { Guard } from "./util/Guard"
import { Create } from "./views/Create"
import { Profile } from "./views/Profile"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import * as userActions from "./features/user"
import * as localUser from "./util/localUser"

// Define the main App component
export default function App() {
    // Initialize useDispatch to dispatch actions
    const dispatch = useDispatch()

    // Retrieve the user state from Redux store
    const user = useSelector(state => state.user.value)

    // Effect hook to check if user is authenticated on component mount
    useEffect(() => {
        // Check if user is not authenticated but exists in local storage
        if (!user && localUser.get()) {
            // Dispatch setUser action to set user state from local storage
            dispatch(userActions.setUser(localUser.get()))
        }
    }, [dispatch, user]) // Dependency array with dispatch and user

    // Render the main application
    return (
        <div className="App">
            {/* Render the navigation component */}
            <Nav />

            {/* Define routes for different views */}
            <Routes>
                {/* Route for authentication view */}
                <Route path="/auth" element={<Auth />} />

                {/* Guarded routes */}
                <Route element={<Guard />}>
                    {/* Route for the auction view */}
                    <Route path="/" element={<Auction />} />
                    {/* Route for creating auctions */}
                    <Route path="/create" element={<Create />} />
                    {/* Route for the user profile */}
                    <Route path="/profile" element={<Profile />} />
                    {/* Fallback route for undefined routes */}
                    <Route path="*" element={<Auction />} />
                </Route>
            </Routes>
        </div>
    )
}