// Import necessary hooks from React and Redux.
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
// Import service functions and Redux actions.
import * as service from "../utility/service"
import * as userActions from "../features/user"
import * as usersActions from "../features/users"
import * as localUser from "../utility/localUser"
// Define the Profile component.
export function Profile() {
    // Initialize dispatch to dispatch actions.
    const dispatch = useDispatch()
    // Select the current user from the Redux store.
    const user = useSelector((state) => state.user.value)
    // State to track whether the user is depositing or withdrawing.
    const [isDepositing, setIsDepositing] = useState(true)
    // State to track the input value from the user.
    const [input, setInput] = useState("")
    // Handle input change event to update the input state.
    function handleInputChange(event) {
        setInput(event.target.value)
    }
    // Handle form submission for deposit or withdrawal.
    async function handleSubmit(event) {
        event.preventDefault() // Prevent the default form submission behavior
        // Extract the amount from the form data.
        const { amount } = Object.fromEntries(new FormData(event.target))
        const userWallet = Number(user.wallet) || 0 // Get current user wallet balance
        let walletToBeUpdated = 0 // Initialize the updated wallet balance
        // Calculate the new wallet balance based on deposit or withdrawal.
        if (isDepositing) {
            walletToBeUpdated = userWallet + Number(amount)
            // Cap the wallet balance at 9999999999.
            if (walletToBeUpdated >= 9999999999) {
                walletToBeUpdated = 9999999999
            }
        } else if (!isDepositing) {
            walletToBeUpdated = userWallet - Number(amount)
            // Ensure the wallet balance does not go below 0.
            if (walletToBeUpdated <= 0 || typeof Number(walletToBeUpdated) !== "number") {
                walletToBeUpdated = 0
            }
        }
        // Update the user data with the new wallet balance.
        await service.updateUser({ ...user, wallet: walletToBeUpdated })
        // Save the updated user data locally.
        localUser.set({ ...user, wallet: walletToBeUpdated })
        // Dispatch actions to update the Redux store with the new user data.
        dispatch(userActions.setUser({ ...user, wallet: walletToBeUpdated }))
        dispatch(usersActions.updateUser({ ...user, wallet: walletToBeUpdated }))
        // Reset the input state to an empty string.
        setInput("")
    }
    // Render user statistics based on auction data.
    function renderUserStats() {
        // Get statistics about user's created, sold, bid, and won auctions.
        const created = user.createdAuctions.length && `created ${user.createdAuctions.length}`
        const sold = user.soldAuctions.length && `sold ${user.soldAuctions.length}`
        const bid = user.bidAuctions.length && `bid in ${user.bidAuctions.length}`
        const won = user.wonAuctions.length && `won ${user.wonAuctions.length}`
        // Filter out any falsey values from the stats array.
        let stats_array = [created, sold, bid, won].filter((entry) => entry !== 0)
        // Format the statistics for display.
        if (stats_array[0]) {
            const word = stats_array[0][0].toUpperCase() + stats_array[0].slice(1)
            const auction = stats_array[0].slice(-1) === "1" ? " auction" : " auctions"
            const string = word + auction
            stats_array.splice(0, 1, string)
        }
        if (stats_array.length > 1) {
            const string = ` and ${stats_array[stats_array.length - 1]}`
            stats_array.splice(stats_array.length - 1, 1, string)
        }
        if (stats_array.length > 2) {
            for (let i = 0; i < stats_array.length - 2; i++) {
                stats_array[i] = stats_array[i] && stats_array[i] + ", "
            }
        }
        stats_array[stats_array.length - 1] = stats_array[stats_array.length - 1] + "."
        // Render the statistics in a formatted way.
        if (stats_array.length === 4) {
            return (
                <>
                    <p>{stats_array[0]} {stats_array[1]}</p>
                    <p>{stats_array[2]} {stats_array[3]}</p>
                </>
            )
        }
        return <p>{stats_array}</p>
    }
    // Render the profile section with user data and form for transactions.
    return user && (
        <section className="profile">
            <h1>{user.username}</h1>
            <div className="renderUserStats">{renderUserStats()}</div>
            <form onSubmit={handleSubmit} className="amount">
                <div className="transactionWrapper">
                    <button
                        type="submit"
                        className="deposit"
                        onClick={() => setIsDepositing(true)}
                    >
                        Deposit
                    </button>
                    <input
                        type="number"
                        name="amount"
                        placeholder={"Balance: " + user.wallet}
                        value={input}
                        onChange={handleInputChange}
                    />
                    <button
                        type="submit"
                        className="withdraw"
                        onClick={() => setIsDepositing(false)}
                    >
                        Withdraw
                    </button>
                </div>
            </form>
        </section>
    )
}