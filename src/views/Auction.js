import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import * as service from "../util/service"
import * as userActions from "../features/user"
import * as usersActions from "../features/users"
import * as auctionsActions from "../features/auctions"
import * as localUser from "../util/localUser"

export function Auction() {
    const dispatch = useDispatch()

    // Selecting data from the Redux store
    const user = useSelector(state => state.user.value)
    const users = useSelector(state => state.users)
    const auctions = useSelector(state => state.auctions)

    // State variables
    const [searchInput, setSearchInput] = useState("") // Input for search
    const [activeButton, setActiveButton] = useState("") // Active sorting button
    const [order, setOrder] = useState(localUser.get()?.storedCriteria || "A-Z") // Sorting order

    // Fetch users data on component mount
    useEffect(() => {
        async function fetchUsers() {
            dispatch(usersActions.setUsers(await service.readUsers().users))
        }
        fetchUsers()
    }, [dispatch])

    // Function to handle sorting
    function handleSorting(criteria) {
        if (activeButton !== criteria) {
            setActiveButton(criteria)
        } else {
            order === "A-Z" ? setOrder("Z-A") : setOrder("A-Z")
        }

        // Save sorting criteria to local storage
        localUser.set({ ...user, sortingCriteria: [criteria, order] })

        // Sort auctions based on criteria and order
        dispatch(auctionsActions.setAuctions(sortAuctions(auctions, criteria, order)))
    }

    // Function to sort auctions
    const sortAuctions = useCallback((auctions, name, order) => {
        if (name !== "action") {
            let sortedAuctions = [...auctions]

            // Sort auctions based on selected criteria
            if (name === "name") {
                sortedAuctions.sort((a, z) => a.name.localeCompare(z.name))
            } else if (name === "duration") {
                sortedAuctions.sort((a, z) => a.duration - z.duration)
            } else if (name === "price") {
                sortedAuctions.sort((a, z) => a.price - z.price)
            }

            return order === "A-Z" ? sortedAuctions : sortedAuctions.reverse()
        } else {
            // Separate auctions based on user's involvement
            const ownAuctions = [...auctions].filter(a => a.ownerId === user._id)
            const availableAuctions = [...auctions].filter(
                a => a.highestBidderId !== user._id && a.ownerId !== user._id
            )
            const bidAuctions = [...auctions].filter(a => a.highestBidderId === user._id)

            if (order === "A-Z") {
                return [...availableAuctions, ...ownAuctions, ...bidAuctions]
            } else {
                return [...ownAuctions, ...availableAuctions, ...bidAuctions]
            }
        }
    }, [user])

    // Fetch and update auctions data, handle auction events
    useEffect(() => {
        async function fetchAuctions() {
            const result = await service.readAuctions()
            const auctions = result && searchFilter(result.auctions)

            // Process auctions data
            result && auctions.forEach(async auction => {
                // Check if auction is expired
                if (auction.expirationTime > Date.now()) { return }

                // Fetch buyer details
                const buyer = users.find(u => u._id === auction.highestBidderId)

                // Process auction settlement
                if (buyer && !buyer.wonAuctions.includes(auction)) {
                    // Fetch seller details
                    const seller = users.find(u => u._id === auction.ownerId)
                    // Calculate tax and amount to be paid to seller
                    const tax = Math.ceil(auction.lastBid / 20) - auction.deposit
                    const amountToBePaidToSeller = auction.lastBid - tax

                    // Update seller's data
                    const sellerToBePaid = {
                        ...seller,
                        wallet: seller.wallet + amountToBePaidToSeller,
                        soldAuctions: seller.soldAuctions.includes(auction._id) ? seller.soldAuctions : [...seller.soldAuctions, auction._id]
                    }

                    // Update buyer's data
                    const buyerToBeAwarded = {
                        ...buyer,
                        wonAuctions: buyer.wonAuctions.includes(auction._id) ? buyer.wonAuctions : [...buyer.wonAuctions, auction._id]
                    }

                    // Update seller and buyer data in the database
                    await service.updateUser(sellerToBePaid)
                    await service.updateUser(buyerToBeAwarded)

                    // Update local user data if applicable
                    if (user._id === seller._id) {
                        dispatch(userActions.setUser(sellerToBePaid))
                    } else if (user._id === buyer._id) {
                        dispatch(userActions.setUser(buyerToBeAwarded))
                        localUser.set(buyerToBeAwarded)
                    }

                    // Dispatch updated user data
                    dispatch(usersActions.updateUser(sellerToBePaid))
                    dispatch(usersActions.updateUser(buyerToBeAwarded))
                }

                // Delete expired auctions
                await service.deleteAuction(auction._id)
                dispatch(auctionsActions.deleteAuction(auction._id))
            })

            // Apply sorting criteria if such exists
            if (localUser.get("sortingCriteria")) {
                const [name, order] = localUser.get("sortingCriteria")

                setActiveButton(name)

                dispatch(auctionsActions.setAuctions(sortAuctions(auctions, name, order)))
            } else {
                dispatch(auctionsActions.setAuctions(auctions))
            }
        }

        fetchAuctions()

        // Filter auctions based on search input
        function searchFilter(auctions) {
            if (auctions) {
                if (searchInput) {
                    const searchResult = auctions.filter(auction => {
                        return auction.name.includes(searchInput)   
                    })

                    return searchResult.flat()
                }

                return auctions
            }
        }

        // Fetch auctions data at an interval
        const interval = setInterval(fetchAuctions, 1000)

        return () => clearInterval(interval)
    }, [
        dispatch,
        user,
        users,
        searchInput,
        activeButton,
        order,
        sortAuctions
    ])

    // Handler for search input change
    function handeSearchInputChange(event) { setSearchInput(event.target.value) }

    // Function to format time
    function formatTime(time) {
        const minutes = Math.floor(time / 60000)
        const seconds = Math.floor((time % 60000) / 1000)
        const clock = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

        return { minutes, seconds, clock }
    }

    // Function to update expiration time
    function updateExpirationTime(time) {
        return formatTime(time - Date.now()).minutes < 4 ? time + 60 * 1000 : time
    }

    // Function to calculate next bid price
    function calculateNextPrice(price) {
        let nextPrice = Math.round(price / 5) * 5 + 5

        if (price >= 100 && price < 200) nextPrice = Math.round(price / 10) * 10 + 10
        if (price >= 200 && price < 500) nextPrice = Math.round(price / 10) * 10 + 20
        if (price >= 500 && price < 1000) nextPrice = Math.round(price / 10) * 10 + 50
        if (price >= 1000) nextPrice = price + 100

        return nextPrice
    }

    // Function to render bid button
    function renderBidButton(auction) {
        if (
            user._id !== auction.highestBidderId &&
            user._id !== auction.ownerId &&
            user.wallet >= auction.price
        ) {
            return <button className="cardButton"
                onClick={() => handleBid(auction._id, auction.price)}
            >Bid</button>
        }
    }

    // Function to handle bidding
    async function handleBid(auctionId, price) {
        const nextPrice = calculateNextPrice(price)
        const auctionFromServer = auctions.find(a => a._id === auctionId)
        const previousBidder = users.find(u => u._id === auctionFromServer.highestBidderId)

        if (previousBidder) {
            const previousBidderToBeRepaid = {
                ...previousBidder,
                wallet: previousBidder.wallet + auctionFromServer.lastBid
            }

            await service.updateUser(previousBidderToBeRepaid)
            dispatch(usersActions.updateUser(previousBidderToBeRepaid))
        }

        const auctionToBeUpdated = {
            ...auctionFromServer,
            price: nextPrice,
            expirationTime: updateExpirationTime(auctionFromServer.expirationTime),
            highestBidderId: user._id,
            previousBidderId: auctionFromServer.highestBidderId || "",
            lastBid: auctionFromServer.price,
        }

        function updateBidAuctions() {
            if (user.bidAuctions.includes(auctionId)) {
                return user.bidAuctions
            } else {
                return [...user.bidAuctions, auctionId]
            }
        }

        const highestBidderToBeUpdated = {
            ...user,
            wallet: user.wallet - Math.ceil(price),
            bidAuctions: updateBidAuctions()
        }

        await service.updateAuction(auctionId, auctionToBeUpdated)
        await service.updateUser(highestBidderToBeUpdated)

        dispatch(userActions.setUser(highestBidderToBeUpdated))
        dispatch(usersActions.updateUser(highestBidderToBeUpdated))
        dispatch(auctionsActions.updateAuction(auctionToBeUpdated))
    }

    // Function to handle auction cancellation
    async function handleCancel(auctionId) {
        const auction = auctions.find(a => a._id === auctionId)

        if (auction) {
            const highestBidder = users.find(u => u._id === auction.highestBidderId)

            if (highestBidder) {
                const highestBidderToBeRepaid = {
                    ...highestBidder,
                    wallet: highestBidder.wallet + auction.price
                }

                await service.updateUser(highestBidderToBeRepaid)

                if (user._id === highestBidderToBeRepaid._id) {
                    dispatch(userActions.setUser(highestBidderToBeRepaid))
                }

                dispatch(usersActions.updateUser(highestBidderToBeRepaid))
            }

            await service.deleteAuction(auctionId)

            dispatch(auctionsActions.deleteAuction(auctionId))
        }
    }

    return (
        <section>
            {/* Search input field */}
            <input
                type="text" className="search" name="search" placeholder="Search"
                value={searchInput} onChange={handeSearchInputChange}
            />

            {/* Header with sorting buttons */}
            <header>
                <button onClick={() => handleSorting("name")}
                    className={activeButton === "name" ? "active" : ""}
                >Name</button>

                <button onClick={() => handleSorting("duration")}
                    className={activeButton === "duration" ? "active" : ""}
                >Duration</button>

                <button onClick={() => handleSorting("price")}
                    className={activeButton === "price" ? "active" : ""}
                >Price</button>

                <button onClick={() => handleSorting("action")}
                    className={activeButton === "action" ? "active" : ""}
                >Action</button>
            </header>

            {/* Auction cards */}
            {auctions.map(a => (
                <div className="auctionCard" key={a._id}>
                    <div className="cardInfo">
                        <p className="auctionName">{a.name}</p>

                        <p className="auctionDuration">
                            {/* Display remaining time */}
                            {formatTime(a.expirationTime - Date.now()).clock}
                        </p>

                        <p className="auctionPrice">
                            {/* Display current bid price */}
                            {a.ownerId === user._id ? a.lastBid || a.price : a.price}
                        </p>
                    </div>

                    {/* Render bid button */}
                    {renderBidButton(a)}

                    {/* Render cancel button for owner */}
                    {user._id === a.ownerId && <button className="cardButton"
                        onClick={() => handleCancel(a._id)}
                    >Cancel</button>}
                </div>
            ))}
        </section>
    )
}