import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import Payment from "./Payment";

// Mock the required modules and hooks
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("axios", () => ({
  post: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("Payment Component", () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = useNavigate.mockReturnValue(jest.fn());
    useSelector.mockReturnValue({ user: { name: "John Doe" } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders the Payment component", () => {
    render(
      <PayPalScriptProvider>
        <Payment />
      </PayPalScriptProvider>
    );

    expect(screen.getByText(/Pay with PayStack/i)).toBeInTheDocument();
    expect(screen.getByText(/Cash on Delivery/i)).toBeInTheDocument();
  });

  test("selects Paystack payment method", () => {
    render(
      <PayPalScriptProvider>
        <Payment />
      </PayPalScriptProvider>
    );

    const paystackRadio = screen.getByText(/Pay with PayStack/i);
    fireEvent.click(paystackRadio);

    expect(screen.getByText(/Pay Now/i)).toBeInTheDocument();
  });

  test("selects Cash on Delivery payment method", () => {
    render(
      <PayPalScriptProvider>
        <Payment />
      </PayPalScriptProvider>
    );

    const codRadio = screen.getByText(/Cash on Delivery/i);
    fireEvent.click(codRadio);

    expect(screen.getByText(/Confirm/i)).toBeInTheDocument();
  });

  test("calls navigate function on successful order creation", async () => {
    const { axios } = require("axios");
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    render(
      <PayPalScriptProvider>
        <Payment />
      </PayPalScriptProvider>
    );

    const codRadio = screen.getByText(/Cash on Delivery/i);
    fireEvent.click(codRadio);

    const confirmButton = screen.getByText(/Confirm/i);
    fireEvent.click(confirmButton);

    expect(mockNavigate).toHaveBeenCalledWith("/order/success");
  });

  test("shows error message on failed order creation", async () => {
    const { axios } = require("axios");
    const { toast } = require("react-toastify");

    axios.post.mockRejectedValueOnce(new Error("Payment failed"));

    render(
      <PayPalScriptProvider>
        <Payment />
      </PayPalScriptProvider>
    );

    const paystackRadio = screen.getByText(/Pay with PayStack/i);
    fireEvent.click(paystackRadio);

    const payButton = screen.getByText(/Pay Now/i);
    fireEvent.click(payButton);

    expect(toast.error).toHaveBeenCalledWith("Payment failed");
  });
});
