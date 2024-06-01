import { useNavigate } from "react-router-dom" // Importing navigation hook
import { useState } from "react" // Importing state hook
import { useSelector, useDispatch } from "react-redux" // Importing Redux hooks
import * as service from "../util/service" // Importing service functions
import * as userActions from "../features/user" // Importing user-related actions
import * as usersActions from "../features/users" // Importing users-related actions
import * as auctionsActions from "../features/auctions" // Importing auctions-related actions
import * as localUser from "../util/localUser" // Importing local user utility

export function Create() {
    const user = useSelector(state => state.user?.value) // Fetching user data from Redux store

    const dispatch = useDispatch() // Redux dispatch function
    const navigate = useNavigate() // Navigation function

    const [inputs, setInputs] = useState({ name: "", price: "" }) // State for input values
    const [errors, setErrors] = useState({ name: "", price: "", server: "" }) // State for input validation errors

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

            if (name === "name") {
                if (value.length > 10) {
                    stateObject[name] = "Name can be at most 10 characters long."
                }
            } else if (name === "price") {
                if (!Number.isInteger(Number(value))) {
                    stateObject[name] = "Price must be a whole number."
                } else if (value.length > 10) {
                    stateObject[name] = "Price can be at most 10 characters long."
                }
            }

            return stateObject
        })
    }

    // Function to handle auction creation
    async function handleSave(event) {
        event.preventDefault()

        const { name, price } = Object.fromEntries(new FormData(event.target))

        const expirationTime = Date.now() + 5 * 60 * 1000 // Auction expiration time (5 minutes)
        const deposit = Math.ceil(price / 20) // Deposit amount based on price

        const auction = {
            name,
            price,
            deposit,
            expirationTime,
            ownerId: user._id // Owner ID from user data
        }

        const response = await service.createAuction(auction) // Creating auction via service function

        if (!response.message) {
            const walletToBeUpdated = user.wallet - deposit // Updating wallet balance

            const userToBeUpdated = {
                ...user,
                wallet: walletToBeUpdated,
                createdAuctions: [...user.createdAuctions, response._id] // Adding auction to user's created auctions
            }

            await service.updateUser(userToBeUpdated) // Updating user data via service function

            localUser.set({ ...user, wallet: walletToBeUpdated }) // Updating local user data

            // Dispatching actions to update Redux store
            dispatch(userActions.setUser(userToBeUpdated))
            dispatch(usersActions.updateUser(userToBeUpdated))
            dispatch(auctionsActions.updateAuction(auction))

            // Redirecting to home page
            navigate("/")
        } else {
            // If response contains an error message, display it
            setErrors({ ...errors, server: response.message })
        }
    }

    return (
        <section>
            {/* Auction creation form */}
            <form onSubmit={handleSave}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={inputs.name}
                    onChange={handleInputChange}
                    onBlur={validateInput}
                />

                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={inputs.price}
                    onChange={handleInputChange}
                    onBlur={validateInput}
                />

                {/* Render save and reset buttons if no errors and user has sufficient balance */}
                {
                    !Object.values(errors).some(entry => entry !== "") &&
                    !Object.values(inputs).some(entry => entry === "") &&
                    user?.wallet >= Math.ceil(Number(inputs.price) / 20) &&

                    <div className="buttonsWrapper">
                        <button type="submit">Save</button>

                        <button type="reset" onClick={() => {
                            setInputs({ name: "", price: 0 })
                        }}>Reset</button>
                    </div>
                }
            </form>

            {/* Display validation errors */}
            <div className="errorsWrapper">
                {errors.name && <p className="error">{errors.name}</p>}
                {errors.price && <p className="error">{errors.price}</p>}
                {errors.server && <p className="error">{errors.server}</p>}
            </div>
        </section>
    )
}