import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { toast } from 'react-toastify';
import EventCard from '../../components/EventCard'; // Adjust the path according to your folder structure
import CountDown from '../../components/CountDown';
import configureStore from 'redux-mock-store';

jest.mock('../../components/CountDown', () => () => <div>Countdown Component</div>);
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const mockStore = configureStore([]);
const store = mockStore({
  cart: {
    cart: [],
  },
});

describe('EventCard Component', () => {
  const mockData = {
    _id: 'test-product-id',
    images: [{ url: 'http://example.com/image.jpg' }],
    name: 'Test Product',
    description: 'Test Description',
    originalPrice: 100,
    discountPrice: 80,
    sold_out: 10,
    stock: 5,
  };

  const setup = (storeOverride = store) => {
    render(
      <Provider store={storeOverride}>
        <Router>
          <EventCard active={true} data={mockData} />
        </Router>
      </Provider>
    );
  };

  it('renders product information correctly', () => {
    setup();
    expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Description/i)).toBeInTheDocument();
    expect(screen.getByText(/\$100/i)).toBeInTheDocument();
    expect(screen.getByText(/\$80/i)).toBeInTheDocument();
    expect(screen.getByText(/10 sold/i)).toBeInTheDocument();
    expect(screen.getByText(/Countdown Component/i)).toBeInTheDocument();
  });

  it('displays error when adding an already existing item to cart', () => {
    const cartWithItem = mockStore({
      cart: {
        cart: [{ ...mockData }],
      },
    });
    setup(cartWithItem);

    fireEvent.click(screen.getByText(/Add to cart/i));
    expect(toast.error).toHaveBeenCalledWith('Item already in cart!');
  });

  it('displays error when product is out of stock', () => {
    const outOfStockData = { ...mockData, stock: 0 };
    render(
      <Provider store={store}>
        <Router>
          <EventCard active={true} data={outOfStockData} />
        </Router>
      </Provider>
    );

    fireEvent.click(screen.getByText(/Add to cart/i));
    expect(toast.error).toHaveBeenCalledWith('Product stock limited!');
  });

  it('adds item to cart successfully', () => {
    setup();

    fireEvent.click(screen.getByText(/Add to cart/i));
    expect(toast.success).toHaveBeenCalledWith('Item added to cart successfully!');
  });

  it('renders "See Details" link correctly', () => {
    setup();
    const seeDetailsLink = screen.getByText(/See Details/i).closest('a');
    expect(seeDetailsLink).toHaveAttribute('href', `/product/${mockData._id}?isEvent=true`);
  });
});
