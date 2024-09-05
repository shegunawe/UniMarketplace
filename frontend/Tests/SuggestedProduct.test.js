import React from "react";
import { render, screen } from "@testing-library/react";
import { useSelector } from "react-redux";
import SuggestedProduct from "./SuggestedProduct";
import ProductCard from "../Route/ProductCard/ProductCard";

// Mocking the child component
jest.mock("../Route/ProductCard/ProductCard", () => ({ data }) => (
  <div data-testid="product-card">{data.name}</div>
));

// Mocking the useSelector hook
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

const mockProductData = [
  { id: 1, name: "Product 1", category: "Electronics" },
  { id: 2, name: "Product 2", category: "Electronics" },
  { id: 3, name: "Product 3", category: "Books" },
];

describe("SuggestedProduct Component", () => {
  beforeEach(() => {
    useSelector.mockReturnValue({ allProducts: mockProductData });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders related products based on category", () => {
    const data = { category: "Electronics" };

    render(<SuggestedProduct data={data} />);

    const relatedProducts = screen.getAllByTestId("product-card");
    expect(relatedProducts).toHaveLength(2); // Only two products in "Electronics" category
    expect(relatedProducts[0]).toHaveTextContent("Product 1");
    expect(relatedProducts[1]).toHaveTextContent("Product 2");
  });

  test("renders no products if none match the category", () => {
    const data = { category: "Clothing" };

    render(<SuggestedProduct data={data} />);

    const relatedProducts = screen.queryAllByTestId("product-card");
    expect(relatedProducts).toHaveLength(0); // No products should match
  });

  test("renders correct heading and section styles", () => {
    const data = { category: "Electronics" };

    render(<SuggestedProduct data={data} />);

    const heading = screen.getByText("Related Product");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass("text-[25px] font-[500] border-b mb-5");

    const section = screen.getByTestId("suggested-product-section");
    expect(section).toHaveClass("p-4");
  });

  test("does not render component when data is not passed", () => {
    render(<SuggestedProduct data={null} />);

    const heading = screen.queryByText("Related Product");
    expect(heading).not.toBeInTheDocument();
  });
});
