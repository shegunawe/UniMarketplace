import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { BrowserRouter as Router } from 'react-router-dom';
import ProductDetails from './ProductDetails';
import * as actions from '../redux/actions/wishlist';
import * as cartActions from '../../redux/actions/cart';
import { toast } from 'react-toastify';

// Mock toast notifications
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockStore = configureStore([thunk]);

describe('ProductDetails component', () => {
  let store;

  const mockProduct = {
    _id: 'product1',
    name: 'Test Product',
    description: 'Test Product Description',
    discountPrice: 20,
    originalPrice: 30,
    stock: 5,
    images: [
      { url: 'image1.jpg' },
      { url: 'image2.jpg' }
    ],
    reviews: [],
    ratings: 4.5,
    shop: {
      _id: 'shop1',
      name: 'Test Shop',
      avatar: { url: 'avatar.jpg' },
      description: 'Test Shop Description',
      createdAt: '2023-01-01',
    }
  };

  beforeEach(() => {
    store = mockStore({
      wishlist: { wishlist: [] },
      cart: { cart: [] },
      user: { user: { _id: 'user1' }, isAuthenticated: true },
      products: { products: [mockProduct] },
    });
  });

  test('renders product details', () => {
    render(
      <Provider store={store}>
        <Router>
          <ProductDetails data={mockProduct} />
        </Router>
      </Provider>
    );

    // Check product name and description
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Product Description')).toBeInTheDocument();

    // Check prices
    expect(screen.getByText('20$')).toBeInTheDocument();
    expect(screen.getByText('30$')).toBeInTheDocument();
  });

  test('handles add to wishlist', () => {
    const addToWishlistSpy = jest.spyOn(actions, 'addToWishlist');

    render(
      <Provider store={store}>
        <Router>
          <ProductDetails data={mockProduct} />
        </Router>
      </Provider>
    );

    const wishlistButton = screen.getByTitle('Add to wishlist');
    fireEvent.click(wishlistButton);

    expect(addToWishlistSpy).toHaveBeenCalledWith(mockProduct);
  });

  test('handles remove from wishlist', () => {
    store = mockStore({
      wishlist: { wishlist: [mockProduct] },
      cart: { cart: [] },
      user: { user: { _id: 'user1' }, isAuthenticated: true },
      products: { products: [mockProduct] },
    });

    const removeFromWishlistSpy = jest.spyOn(actions, 'removeFromWishlist');

    render(
      <Provider store={store}>
        <Router>
          <ProductDetails data={mockProduct} />
        </Router>
      </Provider>
    );

    const wishlistButton = screen.getByTitle('Remove from wishlist');
    fireEvent.click(wishlistButton);

    expect(removeFromWishlistSpy).toHaveBeenCalledWith(mockProduct);
  });

  test('handles add to cart', () => {
    const addToCartSpy = jest.spyOn(cartActions, 'addTocart');

    render(
      <Provider store={store}>
        <Router>
          <ProductDetails data={mockProduct} />
        </Router>
      </Provider>
    );

    const addToCartButton = screen.getByText('Add to cart');
    fireEvent.click(addToCartButton);

    expect(addToCartSpy).toHaveBeenCalledWith({ ...mockProduct, qty: 1 });
    expect(toast.success).toHaveBeenCalledWith('Item added to cart successfully!');
  });

  test('displays error when item is already in cart', () => {
    store = mockStore({
      wishlist: { wishlist: [] },
      cart: { cart: [{ _id: 'product1' }] },
      user: { user: { _id: 'user1' }, isAuthenticated: true },
      products: { products: [mockProduct] },
    });

    render(
      <Provider store={store}>
        <Router>
          <ProductDetails data={mockProduct} />
        </Router>
      </Provider>
    );

    const addToCartButton = screen.getByText('Add to cart');
    fireEvent.click(addToCartButton);

    expect(toast.error).toHaveBeenCalledWith('Item already in cart!');
  });
});
