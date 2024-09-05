import React from 'react';
import { render, screen } from '@testing-library/react';
import CountDown from '../../components/CountDown'; // Adjust the path according to your folder structure
import axios from 'axios';
import { server } from '../../server';

jest.mock('axios');

describe('CountDown Component', () => {
  const mockData = {
    _id: 'test-event-id',
    Finish_Date: new Date(new Date().getTime() + 86400000).toISOString(), // 1 day in the future
  };

  const setup = () => render(<CountDown data={mockData} />);

  it('renders countdown timer correctly', () => {
    setup();
    const daysElement = screen.getByText(/days/i);
    const hoursElement = screen.getByText(/hours/i);
    const minutesElement = screen.getByText(/minutes/i);
    const secondsElement = screen.getByText(/seconds/i);

    expect(daysElement).toBeInTheDocument();
    expect(hoursElement).toBeInTheDocument();
    expect(minutesElement).toBeInTheDocument();
    expect(secondsElement).toBeInTheDocument();
  });

  it('displays "Time\'s Up" when countdown ends', () => {
    // Modify Finish_Date to be in the past
    mockData.Finish_Date = new Date(new Date().getTime() - 1000).toISOString(); // 1 second in the past
    setup();
    const timesUpElement = screen.getByText(/Time's Up/i);

    expect(timesUpElement).toBeInTheDocument();
  });

  it('deletes event when countdown ends', () => {
    // Modify Finish_Date to be in the past
    mockData.Finish_Date = new Date(new Date().getTime() - 1000).toISOString(); // 1 second in the past
    setup();

    // Verify that the axios.delete was called with the correct URL
    expect(axios.delete).toHaveBeenCalledWith(
      `${server}/event/delete-shop-event/${mockData._id}`
    );
  });
});
