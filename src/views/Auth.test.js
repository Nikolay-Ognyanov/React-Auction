import { Auth } from "./Auth"
import { render, fireEvent, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { MemoryRouter } from "react-router-dom"
import * as service from "../service"
const mockStore = configureStore([])
const store = mockStore({})
test("input validation", () => {
    const { getByPlaceholderText, getByText } = render(
        <Provider store={store}>
            <MemoryRouter>
                <Auth />
            </MemoryRouter>
        </Provider>
    )
    const usernameInput = getByPlaceholderText("Username")
    const passwordInput = getByPlaceholderText("Password")
    fireEvent.change(usernameInput, { target: { value: "a" } })
    fireEvent.change(passwordInput, { target: { value: "1234" } })
    const usernameError = getByText("Username must be between 2 and 20 characters long.")
    const passwordError = getByText("Password must be at least 5 characters long.")
    expect(usernameError).toBeInTheDocument()
    expect(passwordError).toBeInTheDocument()
    fireEvent.change(usernameInput, { target: { value: "validusername" } })
    fireEvent.change(passwordInput, { target: { value: "validpassword" } })
    expect(usernameError).not.toBeInTheDocument()
    expect(passwordError).not.toBeInTheDocument()
})
jest.mock("../service", () => ({
    register: jest.fn(formData => Promise.resolve({})),
    login: jest.fn(formData => Promise.resolve({})),
    updateUser: jest.fn(userData => Promise.resolve({})),
    readUsers: jest.fn(() => Promise.resolve({ users: [] }))
}))
test("authorization", async () => {
    const { getByPlaceholderText, getByText } = render(
        <MemoryRouter>
            <Provider store={store}>
                <Auth />
            </Provider>
        </MemoryRouter>
    )
    const usernameInput = getByPlaceholderText("Username")
    const passwordInput = getByPlaceholderText("Password")
    fireEvent.change(usernameInput, { target: { value: "validusername" } })
    fireEvent.change(passwordInput, { target: { value: "validpassword" } })
    const registerButton = getByText("Register")
    const loginButton = getByText("Login")
    fireEvent.click(registerButton)
    fireEvent.click(loginButton)
    await waitFor(() => {
        expect(service.register).toHaveBeenCalledWith({
            username: "validusername",
            password: "validpassword",
            wallet: 10000,
            wonAuctions: []
        })
    })
    await waitFor(() => {
        expect(service.register).toHaveBeenCalledWith({
            username: "validusername",
            password: "validpassword",
            wallet: 10000,
            wonAuctions: []
        })
    })
})