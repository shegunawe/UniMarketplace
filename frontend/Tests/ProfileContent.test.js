// ProfileContent.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { rootReducer } from '../../redux/reducers'; // Update with your actual root reducer
import ProfileContent from './ProfileContent';
import { updateUserInformation, loadUser, updatUserAddress, deleteUserAddress } from '../../redux/actions/user';
import { getAllOrdersOfUser } from '../../redux/actions/order';
import axios from 'axios';
import { toast } from 'react-toastify';

// Mock necessary modules
jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockStore = createStore(rootReducer);

describe('ProfileContent Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders profile section correctly when active is 1', () => {
    render(
      <Provider store={mockStore}>
        <ProfileContent active={1} />
      </Provider>
    );
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enter your password/)).toBeInTheDocument();
  });

  test('updates user information on form submit', async () => {
    axios.put.mockResolvedValue({ data: { success: true } });
    render(
      <Provider store={mockStore}>
        <ProfileContent active={1} />
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/Enter your password/), { target: { value: 'password123' } });

    fireEvent.click(screen.getByText(/Update/));

    await waitFor(() => expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/user/update'),
      {
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        password: 'password123',
      },
      expect.anything()
    ));
  });

  test('handles avatar image upload', async () => {
    const mockAvatarUrl = 'data:image/jpeg;base64,...';
    axios.put.mockResolvedValue({ data: { success: true } });

    render(
      <Provider store={mockStore}>
        <ProfileContent active={1} />
      </Provider>
    );

    const file = new File(['dummy content'], 'avatar.jpg', { type: 'image/jpeg' });
    Object.defineProperty(screen.getByLabelText(/camera/i), 'files', [file]);
    fireEvent.change(screen.getByLabelText(/camera/i), { target: { files: [file] } });

    await waitFor(() => expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/user/update-avatar'),
      { avatar: mockAvatarUrl },
      expect.anything()
    ));
  });

  test('displays orders when active is 2', () => {
    render(
      <Provider store={mockStore}>
        <ProfileContent active={2} />
      </Provider>
    );

    expect(screen.getByText(/Order ID/)).toBeInTheDocument();
  });

  test('displays refund orders when active is 3', () => {
    render(
      <Provider store={mockStore}>
        <ProfileContent active={3} />
      </Provider>
    );

    expect(screen.getByText(/Order ID/)).toBeInTheDocument();
  });

  test('displays track orders when active is 5', () => {
    render(
      <Provider store={mockStore}>
        <ProfileContent active={5} />
      </Provider>
    );

    expect(screen.getByText(/Order ID/)).toBeInTheDocument();
  });

  test('displays change password form when active is 6', () => {
    render(
      <Provider store={mockStore}>
        <ProfileContent active={6} />
      </Provider>
    );

    expect(screen.getByLabelText(/Enter your old password/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enter your new password/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enter your confirm password/)).toBeInTheDocument();
  });

  test('handles change password form submission', async () => {
    axios.put.mockResolvedValue({ data: { success: 'Password updated successfully' } });

    render(
      <Provider store={mockStore}>
        <ProfileContent active={6} />
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/Enter your old password/), { target: { value: 'oldpass' } });
    fireEvent.change(screen.getByLabelText(/Enter your new password/), { target: { value: 'newpass' } });
    fireEvent.change(screen.getByLabelText(/Enter your confirm password/), { target: { value: 'newpass' } });

    fireEvent.click(screen.getByText(/Update/));

    await waitFor(() => expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/user/update-user-password'),
      { oldPassword: 'oldpass', newPassword: 'newpass', confirmPassword: 'newpass' },
      expect.anything()
    ));
  });

  test('displays address form when active is 7', () => {
    render(
      <Provider store={mockStore}>
        <ProfileContent active={7} />
      </Provider>
    );

    expect(screen.getByLabelText(/Country/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Choose your City/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Address 1/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Address 2/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Zip Code/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Address Type/)).toBeInTheDocument();
  });

  test('handles address submission and deletion', async () => {
    axios.put.mockResolvedValue({ data: { success: true } });
    axios.delete.mockResolvedValue({ data: { success: true } });

    render(
      <Provider store={mockStore}>
        <ProfileContent active={7} />
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/Country/), { target: { value: 'US' } });
    fireEvent.change(screen.getByLabelText(/Choose your City/), { target: { value: 'NY' } });
    fireEvent.change(screen.getByLabelText(/Address 1/), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText(/Address 2/), { target: { value: 'Apt 4B' } });
    fireEvent.change(screen.getByLabelText(/Zip Code/), { target: { value: '10001' } });
    fireEvent.change(screen.getByLabelText(/Address Type/), { target: { value: 'Home' } });

    fireEvent.click(screen.getByText(/Add New/));

    await waitFor(() => expect(axios.put).toHaveBeenCalledWith(
      expect.stringContaining('/user/update-address'),
      {
        country: 'US',
        city: 'NY',
        address1: '123 Main St',
        address2: 'Apt 4B',
        zipCode: '10001',
        addressType: 'Home'
      },
      expect.anything()
    ));

    // Assuming there's a delete button or similar functionality
    fireEvent.click(screen.getByText(/Delete/));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledWith(
      expect.stringContaining('/user/delete-address'),
      expect.anything()
    ));
  });
});
