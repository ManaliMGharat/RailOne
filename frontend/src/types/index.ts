export interface User {
  id: number;
  full_name: string;
  email: string;
  mobile: string;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
}

export interface Station {
  id: number;
  code: string;
  name: string;
  city: string;
  state: string;
  zone?: string;
  latitude?: number;
  longitude?: number;
}

export interface TrainClass {
  class_code: string;
  class_name: string;
  total_seats: number;
  available_seats: number;
  booked_seats: number;
  rac_seats: number;
  waiting_list: number;
  status_label: string;
  base_fare: number;
  total_fare: number;
}

export interface TrainSearchResult {
  id: number;
  number: string;
  name: string;
  train_type: string;
  from_station_code: string;
  from_station_name: string;
  to_station_code: string;
  to_station_name: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  running_days: string[];
  runs_on_requested_date: boolean;
  classes: TrainClass[];
  min_fare: number;
}

export interface TrainStop {
  stop_number: number;
  station_code: string;
  station_name: string;
  city: string;
  arrival_time: string;
  departure_time: string;
  halt_minutes: number;
  distance_from_origin_km: number;
  day_count: number;
}

export interface PassengerInput {
  full_name: string;
  age: number;
  gender: string;
  berth_preference: string;
  id_type: string;
  id_number?: string;
}

export interface BookingPassenger {
  id: number;
  passenger_name: string;
  age: number;
  gender: string;
  coach_number?: string;
  seat_number?: number;
  berth_type?: string;
  booking_status: string;
  current_status: string;
}

export interface PaymentInfo {
  transaction_id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at?: string;
}

export interface TicketInfo {
  ticket_number: string;
  pnr_number: string;
  qr_code_data: string;
  issue_date?: string;
}

export interface Booking {
  id: number;
  booking_reference: string;
  pnr_number: string;
  train_id: number;
  train_number: string;
  train_name: string;
  from_station_code: string;
  from_station_name: string;
  to_station_code: string;
  to_station_name: string;
  departure_time: string;
  arrival_time: string;
  journey_date: string;
  class_code: string;
  class_name: string;
  total_fare: number;
  status: string;
  created_at: string;
  passengers: BookingPassenger[];
  payment?: PaymentInfo;
  ticket?: TicketInfo;
}

export interface PnrStatus {
  pnr_number: string;
  booking_reference: string;
  train_number: string;
  train_name: string;
  journey_date: string;
  from_station_code: string;
  from_station_name: string;
  to_station_code: string;
  to_station_name: string;
  departure_time: string;
  arrival_time: string;
  class_code: string;
  class_name: string;
  chart_status: string;
  booking_status: string;
  passengers: BookingPassenger[];
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  total_trains: number;
  total_stations: number;
  today_bookings: number;
  today_revenue: number;
  cancelled_tickets: number;
  bookings_by_date: { date: string; count: number }[];
  revenue_by_date: { date: string; revenue: number }[];
  popular_routes: { route: string; bookings: number }[];
  class_utilization: { class_name: string; count: number }[];
}

export interface AuditLogItem {
  id: number;
  admin_id?: number;
  admin_name?: string;
  action: string;
  entity: string;
  entity_id?: string;
  description: string;
  ip_address?: string;
  created_at: string;
}
