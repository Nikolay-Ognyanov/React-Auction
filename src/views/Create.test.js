import { Create } from "./Create"
import { render, fireEvent, waitFor, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { MemoryRouter } from "react-router-dom"
import * as service from "../service"
const mockStore = configureStore([])
const store = mockStore({})
test("validates input fields", () => {
    const { getByPlaceholderText, getByText } = render(
        <MemoryRouter>
            <Provider store={store}>
                <Create />
            </Provider>
        </MemoryRouter>
    )
    const nameInput = getByPlaceholderText("Name")
    const priceInput = getByPlaceholderText("Price")
    fireEvent.change(nameInput, { target: { value: "nnnnnnnnnnn" } })
    fireEvent.change(priceInput, { target: { value: 111111111111 } })
    const nameMaxLengthError = getByText("Name can be at most 10 characters long.")
    const priceMaxLengthError = getByText("Price can be at most 10 characters long.")
    expect(nameMaxLengthError).toBeInTheDocument()
    expect(priceMaxLengthError).toBeInTheDocument()
    fireEvent.change(nameInput, { target: { value: "nnnnnnnnnn" } })
    fireEvent.change(priceInput, { target: { value: 1111111111 } })
    expect(nameMaxLengthError).not.toBeInTheDocument()
    expect(priceMaxLengthError).not.toBeInTheDocument()
    fireEvent.change(priceInput, { target: { value: 1.1 } })
    const priceWholeNumberError = getByText("Price must be a whole number.")
    expect(priceWholeNumberError).toBeInTheDocument()
    fireEvent.change(priceInput, { target: { value: 1 } })
    expect(priceWholeNumberError).not.toBeInTheDocument()
})