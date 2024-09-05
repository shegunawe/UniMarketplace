// ProfileSidebar.test.js
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import axios from 'axios';
import { server } from '../../server';
import ProfileSidebar from './ProfileSidebar';
import userReducer from '../../store/userReducer'; // Adjust path as needed
import { toast } from 'react-toastify';

jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
  },
}));

const renderWithProviders = (component, initialState = {}) => {
  const store = createStore((state) => ({ ...state, user: initialState }));
  return render(
    <Provider store={store}>
      <Router>
        {component}
      </Router>
    </Provider>
  );
};

describe('ProfileSidebar', () => {
  test('renders without crashing', () => {
    renderWithProviders(<ProfileSidebar setActive={jest.fn()} active={1} />);
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
  });

  test('changes active state on item click', () => {
    const setActiveMock = jest.fn();
    renderWithProviders(<ProfileSidebar setActive={setActiveMock} active={1} />);
    fireEvent.click(screen.getByText(/Orders/i));
    expect(setActiveMock).toHaveBeenCalledWith(2);
  });

  test('navigates to inbox on click and changes active state', () => {
    const navigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      useNavigate: () => navigate,
    }));
    renderWithProviders(<ProfileSidebar setActive={jest.fn()} active={4} />);
    fireEvent.click(screen.getByText(/Inbox/i));
    expect(navigate).toHaveBeenCalledWith('/inbox');
  });

  test('renders admin link when user role is Admin', () => {
    const adminUser = { role: 'Admin' };
    renderWithProviders(<ProfileSidebar setActive={jest.fn()} active={1} />, adminUser);
    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
  });

  test('does not render admin link when user role is not Admin', () => {
    const regularUser = { role: 'User' };
    renderWithProviders(<ProfileSidebar setActive={jest.fn()} active={1} />, regularUser);
    expect(screen.queryByText(/Admin Dashboard/i)).not.toBeInTheDocument();
  });

  test('calls logoutHandler and redirects on logout', async () => {
    axios.get.mockResolvedValue({ data: { message: 'Logout successful' } });
    const navigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      useNavigate: () => navigate,
    }));
    renderWithProviders(<ProfileSidebar setActive={jest.fn()} active={8} />);
    fireEvent.click(screen.getByText(/Log out/i));
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith(`${server}/user/logout`, { withCredentials: true }));
    expect(toast.success).toHaveBeenCalledWith('Logout successful');
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  test('does not crash if logout fails', async () => {
    axios.get.mockRejectedValue({ response: { data: { message: 'Logout failed' } } });
    const navigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      useNavigate: () => navigate,
    }));
    renderWithProviders(<ProfileSidebar setActive={jest.fn()} active={8} />);
    fireEvent.click(screen.getByText(/Log out/i));
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith(`${server}/user/logout`, { withCredentials: true }));
  });
});
