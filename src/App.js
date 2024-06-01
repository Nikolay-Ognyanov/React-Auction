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

export default function App() {
	const dispatch = useDispatch()

	const user = useSelector(state => state.user.value)

	useEffect(() => {
		if (!user && localUser.get()) dispatch(userActions.setUser(localUser.get()))
	}, [dispatch, user])

	return <div className="App">
		<Nav />

		<Routes>
			<Route path="/auth" element={<Auth />} />

			<Route element={<Guard />}>
				<Route path="/" element={<Auction />} />
				<Route path="/create" element={<Create />} />
				<Route path="/profile" element={<Profile />} />
				<Route path="*" element={<Auction />} />
			</Route>
		</Routes>
	</div >
}