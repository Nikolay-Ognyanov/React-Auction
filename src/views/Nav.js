import { useNavigate, NavLink } from "react-router-dom" // Importing navigation hooks
import { useDispatch, useSelector } from "react-redux" // Importing Redux hooks
import { setUser } from "../features/user" // Importing setUser action
import * as service from "../util/service" // Importing service functions
import * as localUser from "../util/localUser" // Importing local user utility

export function Nav() {
    const dispatch = useDispatch() // Redux dispatch function
    const navigate = useNavigate() // Navigation function
    const user = useSelector(state => state.user.value) // Fetching user data from Redux store

    // Function to handle user logout
    async function handleLogout() {
        await service.logout({ accessToken: user.accessToken }) // Logging out via service function

        dispatch(setUser(null)) // Dispatching setUser action to clear user data in Redux store

        localStorage.clear() // Clearing local storage

        navigate("/auth") // Redirecting to authentication page
    }

    return <> {localUser.get() ? <nav>
        {/* Navigation links */}
        <NavLink to={"/"} className="button" activeClassName="active">Auction</NavLink>
        <NavLink to={"/create"} className="button" activeClassName="active">Create</NavLink>
        <NavLink to={"/profile"} className="button" activeClassName="active">Profile</NavLink>

        {/* Logout button */}
        <button onClick={handleLogout}>Logout</button>
    </nav> : <h1>Sign in</h1>} </>
}