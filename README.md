# Online Auction App

The Online Auction App is a web application that allows users to participate in online auctions. Users can view available auctions, place bids, and manage their account. This project is implemented using React and Redux for the front-end.

## Features

- User Registration and Authentication: Users can create an account and log in to access the auction functionalities. User credentials are securely stored and authenticated.
- Auction Listing: Users can view a list of available auctions. Each auction displays relevant information such as the item name, duration, and current price.
- Sorting and Searching: Users can sort auctions based on criteria such as name, duration, and price. They can also search for specific auctions using a search input field.
- Bidding: Users can place bids on auctions they are interested in. The app calculates the next bid price based on predefined rules.
- Auction Expiration: Auctions have a defined duration, and when an auction expires, the highest bidder is determined, and the transaction is processed.
- User Wallet: Each user has a wallet that stores their available funds for bidding. The wallet balance is updated based on successful bids and auction outcomes.
- User Profile: Users can view various statistics related to their participation in auctions and manage their transactions.
- Responsive Design: The app is designed to be responsive and accessible across different devices and screen sizes.

## Installation

1. Clone the repository: `git clone https://github.com/Nikolay-Petrov-Ognyanov/React-Auction`
2. Navigate to the project directory: `cd react-auction`
3. Install dependencies: `npm install`
4. Start the development server: `npm start`
5. Open the app in your browser: `http://localhost:3000`

Note: The application requires a backend server for full functionality. Make sure to set up the server and configure the necessary environment variables.

## Dependencies

The project uses several third-party libraries and frameworks. The main dependencies include:

- React: JavaScript library for building user interfaces.
- Redux: State management library for managing application state.
- React Router: Library for handling routing in a React application.

For a complete list of dependencies, please refer to the `package.json` file.
