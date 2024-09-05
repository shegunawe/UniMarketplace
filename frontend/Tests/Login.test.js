import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Login from '../../components/Login'; // Adjust the path according to your folder structure
import { toast } from 'react-toastify';
import axios from 'axios';

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('axios');

const mockStore = configureStore([]);
const store = mockStore({});

describe('Login Component', () => {
  const setup = () => {
    render(
      <Provider store={store}>
        <Router>
          <Login />
        </Router>
      </Provider>
    );
  };

  it('renders login form correctly', () => {
    setup();
    expect(screen.getByText(/Login to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Remember me/i)).toBeInTheDocument();
    expect(screen.getByText(/Submit/i)).toBeInTheDocument();
    expect(screen.getByText(/Forgot your password?/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    setup();

    const passwordInput = screen.getByLabelText(/Password/i);
    const toggleVisibilityButton = screen.getByRole('button', { name: /eye/i });

    // Initially, password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click to make password visible
    fireEvent.click(toggleVisibilityButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click again to hide password
    fireEvent.click(toggleVisibilityButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('displays error toast on login failure', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Invalid credentials',
        },
      },
    });

    setup();

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByText(/Submit/i));

    expect(axios.post).toHaveBeenCalledWith(
      `${process.env.REACT_APP_SERVER_URL}/user/login-user`,
      {
        email: 'test@example.com',
        password: 'wrongpassword',
      },
      { withCredentials: true }
    );

    await screen.findByText(/Login to your account/i); // Wait for re-render
    expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
  });

  it('displays success toast on login success', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    setup();

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'correctpassword' },
    });

    fireEvent.click(screen.getByText(/Submit/i));

    expect(axios.post).toHaveBeenCalledWith(
      `${process.env.REACT_APP_SERVER_URL}/user/login-user`,
      {
        email: 'test@example.com',
        password: 'correctpassword',
      },
      { withCredentials: true }
    );

    await screen.findByText(/Login to your account/i); // Wait for re-render
    expect(toast.success).toHaveBeenCalledWith('Login Success!');
  });

  it('redirects user after successful login', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    axios.post.mockResolvedValueOnce({ data: { success: true } });

    setup();

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'correctpassword' },
    });

    fireEvent.click(screen.getByText(/Submit/i));

    await screen.findByText(/Login to your account/i); // Wait for re-render
    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(window.location.reload).toHaveBeenCalledWith(true);
  });
});
