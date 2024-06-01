import { Navigate, useLocation, Outlet } from "react-router-dom"
import * as localUser from "./localUser"

// Component for guarding routes based on user authentication
export function Guard() {
    const location = useLocation() // Get the current location

    // If there's no local user data available, redirect to the authentication page
    if (!localUser.get()) {
        return <Navigate to={"/auth"} replace state={{ from: location }} />
    }

    // If user data is available, render the child routes
    return <Outlet />
}