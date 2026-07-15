import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { BrowserRouter } from "react-router-dom"
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { userReducer } from './features/user'
import { usersReducer } from './features/users'
import { auctionsReducer } from './features/auctions'
const store = configureStore({
	reducer: {
		user: userReducer,
		users: usersReducer,
		auctions: auctionsReducer
	}
})
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<BrowserRouter>
		<Provider store={store}>
			<App />
		</Provider>
	</BrowserRouter>
)
// If you want to start measuring performance in your app, pass a function.
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()