import { apiClient } from '../api/client';
import { Station } from '../types';

export const stationService = {
  async searchStations(query: string, limit: number = 25): Promise<Station[]> {
    if (!query.trim()) return [];
    return apiClient<Station[]>(`/stations/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`);
  },

  async getPopularStations(): Promise<Station[]> {
    return apiClient<Station[]>('/stations/popular');
  },

  async getRecentStations(): Promise<Station[]> {
    return apiClient<Station[]>('/stations/recent');
  },

  async getStationByCode(code: string): Promise<Station> {
    return apiClient<Station>(`/stations/${encodeURIComponent(code.trim().toUpperCase())}`);
  },

  async getSuburbanStations(line: string): Promise<Station[]> {
    return apiClient<Station[]>(`/stations/suburban/${encodeURIComponent(line)}`);
  },

  async getAllStations(limit: number = 300): Promise<Station[]> {
    return apiClient<Station[]>(`/stations/all?limit=${limit}`);
  }
};
