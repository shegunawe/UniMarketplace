import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { toast } from "react-toastify";
import Cart from "./Cart";
import * as actions from "../../redux/actions/cart";

const mockStore = configureStore([]);

describe("Cart Component", () => {
  let store;
  let setOpenCart;

  beforeEach(() => {
    store = mockStore({
      cart: {
        cart: [
          {
            id: 1,
            name: "Product 1",
            qty: 2,
            discountPrice: 50,
            stock: 5,
            images: [{ url: "image1.jpg" }],
          },
        ],
      },
    });
    setOpenCart = jest.fn();
  });

  it("should render cart with items", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart setOpenCart={setOpenCart} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText("1 items")).toBeInTheDocument();
    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("US$100")).toBeInTheDocument();
  });

  it("should render 'Cart Items is empty!' when cart is empty", () => {
    store = mockStore({
      cart: {
        cart: [],
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart setOpenCart={setOpenCart} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText("Cart Items is empty!")).toBeInTheDocument();
  });

  it("should close cart when the close button is clicked", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart setOpenCart={setOpenCart} />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(setOpenCart).toHaveBeenCalledWith(false);
  });

  it("should increase item quantity when increment button is clicked", () => {
    const dispatchSpy = jest.spyOn(store, "dispatch");
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart setOpenCart={setOpenCart} />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.click(screen.getByTestId("increment-button"));
    expect(dispatchSpy).toHaveBeenCalledWith(
      actions.addTocart({ id: 1, qty: 3, discountPrice: 50, stock: 5 })
    );
  });

  it("should decrease item quantity when decrement button is clicked", () => {
    const dispatchSpy = jest.spyOn(store, "dispatch");
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart setOpenCart={setOpenCart} />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.click(screen.getByTestId("decrement-button"));
    expect(dispatchSpy).toHaveBeenCalledWith(
      actions.addTocart({ id: 1, qty: 1, discountPrice: 50, stock: 5 })
    );
  });

  it("should not increase item quantity beyond stock", () => {
    store = mockStore({
      cart: {
        cart: [
          {
            id: 1,
            name: "Product 1",
            qty: 5,
            discountPrice: 50,
            stock: 5,
            images: [{ url: "image1.jpg" }],
          },
        ],
      },
    });

    jest.spyOn(toast, "error");

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart setOpenCart={setOpenCart} />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.click(screen.getByTestId("increment-button"));
    expect(toast.error).toHaveBeenCalledWith("Product stock limited!");
  });

  it("should remove item from cart when remove button is clicked", () => {
    const dispatchSpy = jest.spyOn(store, "dispatch");
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart setOpenCart={setOpenCart} />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.click(screen.getByTestId("remove-button"));
    expect(dispatchSpy).toHaveBeenCalledWith(
      actions.removeFromCart({ id: 1, qty: 2, discountPrice: 50 })
    );
  });
});
