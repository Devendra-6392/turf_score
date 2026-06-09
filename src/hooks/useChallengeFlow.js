// Enhanced Challenge Creation Flow - Hooks and Utilities

import { useState, useEffect } from 'react';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.API_URL || 'http://10.65.234.203:5000/api';

/**
 * Hook to fetch user's existing bookings
 * Useful for pre-filling challenge creation form
 */
export const useUserBookings = (token) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/bookings/my-bookings`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          // Filter for upcoming/current bookings only
          const now = new Date();
          const upcomingBookings = data.filter(b => {
            const bookingDate = new Date(b.bookingDate || b.scheduledDate);
            return bookingDate >= new Date(now.getTime() - 24 * 60 * 60 * 1000); // Include today
          });
          setBookings(upcomingBookings);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  return { bookings, loading, error };
};

/**
 * Hook to find a booking by turf and date
 * Returns the first matching booking for quick pre-fill
 */
export const useBookingForTurfDate = (turfId, selectedDate, bookings) => {
  const [matchingBooking, setMatchingBooking] = useState(null);

  useEffect(() => {
    if (!turfId || !selectedDate || bookings.length === 0) {
      setMatchingBooking(null);
      return;
    }

    const dateStr = selectedDate instanceof Date
      ? selectedDate.toISOString().split('T')[0]
      : selectedDate;

    const booking = bookings.find(b => {
      const bookingTurfId = b.turf?.id || b.turfId;
      const bookingDateStr = (b.bookingDate || b.scheduledDate || '').split('T')[0];

      return bookingTurfId === turfId && bookingDateStr === dateStr;
    });

    setMatchingBooking(booking || null);
  }, [turfId, selectedDate, bookings]);

  return matchingBooking;
};

/**
 * Hook to fetch other users who have booked slots in the same turf
 * Useful for showing challenge suggestions
 */
export const useOtherBookingsInTurf = (turfId, selectedDate, currentUserId, token) => {
  const [otherBookings, setOtherBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!turfId || !selectedDate || !token) return;

    const fetchOtherBookings = async () => {
      setLoading(true);
      try {
        const dateStr = selectedDate instanceof Date
          ? selectedDate.toISOString().split('T')[0]
          : selectedDate;

        const response = await fetch(
          `${BACKEND_URL}/bookings/turf/${turfId}/date/${dateStr}/users`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Filter out current user
          const others = data.filter(b => b.userId !== currentUserId);
          setOtherBookings(others);
        }
      } catch (err) {
        console.error('Error fetching other bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOtherBookings();
  }, [turfId, selectedDate, currentUserId, token]);

  return { otherBookings, loading };
};

/**
 * Hook to send quick challenge request to another user
 */
export const useSendChallengeRequest = (token) => {
  const [loading, setLoading] = useState(false);

  const sendChallenge = async (payload) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/challenges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create challenge');
      }

      const data = await response.json();
      return { success: true, challenge: data };
    } catch (err) {
      console.error('Error sending challenge:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { sendChallenge, loading };
};

/**
 * Format booking info for display
 */
export const formatBookingInfo = (booking) => {
  const date = new Date(booking.bookingDate || booking.scheduledDate);
  const formattedDate = date.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return {
    turf: booking.turf?.name || 'Turf',
    location: booking.turf?.location || '',
    date: formattedDate,
    time: booking.timeSlot || booking.scheduledTime || 'TBD',
    amount: booking.amount || 0,
  };
};
