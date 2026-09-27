import { apiClient } from '../api/client';
import { Train, FareCalculationResponse } from '../types';

export interface TrainSearchParams {
  from: string;
  to: string;
  date?: string;
  class_type?: string;
}

export const trainService = {
  async searchTrains(params: TrainSearchParams): Promise<Train[]> {
    const searchParams = new URLSearchParams({
      from: params.from.trim().toUpperCase(),
      to: params.to.trim().toUpperCase(),
      date: params.date || '',
      class_type: params.class_type || 'ALL',
    });
    return apiClient<Train[]>(`/trains/search?${searchParams.toString()}`);
  },

  async getTrainDetails(idOrNumber: string): Promise<Train> {
    return apiClient<Train>(`/trains/${encodeURIComponent(idOrNumber.trim())}`);
  },

  async calculateFare(payload: {
    source_code: string;
    dest_code: string;
    class_type?: string;
    journey_type?: string;
    passenger_count?: number;
    duration_type?: string;
  }): Promise<FareCalculationResponse> {
    return apiClient<FareCalculationResponse>('/trains/fare', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getAllTrains(limit: number = 100): Promise<Train[]> {
    return apiClient<Train[]>(`/trains/all?limit=${limit}`);
  }
};
