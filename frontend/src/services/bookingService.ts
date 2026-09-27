import { apiClient } from '../api/client';
import { Booking } from '../types';

export const bookingService = {
  async createBooking(payload: any): Promise<Booking> {
    return apiClient<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getUserBookings(): Promise<Booking[]> {
    return apiClient<Booking[]>('/bookings');
  },

  async getBookingDetails(idOrBookingCode: string): Promise<Booking> {
    return apiClient<Booking>(`/bookings/${encodeURIComponent(idOrBookingCode)}`);
  },

  async cancelBooking(bookingId: number): Promise<{ status: string; message: string; refund_amount: number }> {
    return apiClient<{ status: string; message: string; refund_amount: number }>(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
    });
  }
};
