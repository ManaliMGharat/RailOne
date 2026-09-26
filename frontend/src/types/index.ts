export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  dob?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  is_active: boolean;
  biometric_enabled: boolean;
  has_mpin: boolean;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Station {
  id: number;
  station_code: string;
  station_name: string;
  city: string;
  state: string;
  railway_zone: string;
  latitude?: number;
  longitude?: number;
  station_type?: string;
  suburban_line?: string;
  suburban_sequence?: number;
  active: boolean;
}

export interface TrainRoute {
  sequence: number;
  station_code: string;
  station_name: string;
  arrival: string;
  departure: string;
  halt_minutes: number;
  distance: number;
}

export interface TrainClass {
  class_code: string;
  base_fare: number;
  total_seats: number;
  available_seats: number;
}

export interface Train {
  id: number;
  train_number: string;
  train_name: string;
  source: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  running_days: string;
  classes: string;
  train_type: string;
  active: boolean;
  routes: TrainRoute[];
  classes_detail: TrainClass[];
}

export interface FareOption {
  class_code: string;
  class_name: string;
  fare_per_passenger: number;
  total_fare: number;
  distance_km: number;
}

export interface FareCalculationResponse {
  source_code: string;
  source_name: string;
  dest_code: string;
  dest_name: string;
  distance_km: number;
  passenger_count: number;
  journey_type: string;
  fare_options: FareOption[];
}

export interface Ticket {
  id: number;
  ticket_number: string;
  passenger_name: string;
  passenger_age: number;
  passenger_gender: string;
  coach: string;
  berth: string;
  berth_type: string;
  status: string;
}

export interface Booking {
  id: number;
  booking_id: string;
  pnr_number: string;
  train_number: string;
  train_name: string;
  source_code: string;
  source_name: string;
  dest_code: string;
  dest_name: string;
  journey_date: string;
  class_type: string;
  passenger_count: number;
  fare_amount: number;
  status: string;
  qr_data: string;
  created_at: string;
  tickets: Ticket[];
}

export interface PlatformTicket {
  id: number;
  ticket_number: string;
  station_code: string;
  station_name: string;
  passenger_count: number;
  fare: number;
  valid_date: string;
  valid_hours: number;
  qr_data: string;
  created_at: string;
}

export interface SeasonTicket {
  id: number;
  pass_number: string;
  source_code: string;
  source_name: string;
  dest_code: string;
  dest_name: string;
  duration_type: string;
  class_type: string;
  passenger_name: string;
  passenger_age: number;
  fare: number;
  valid_from: string;
  valid_until: string;
  qr_data: string;
  created_at: string;
}

export interface PNRPassengerStatus {
  serial_no: number;
  name: string;
  booking_status: string;
  current_status: string;
  coach: string;
  berth: string;
  berth_type: string;
}

export interface PNRResponse {
  pnr_number: string;
  train_number: string;
  train_name: string;
  source: string;
  destination: string;
  journey_date: string;
  class_type: string;
  chart_status: string;
  is_demo: boolean;
  passengers: PNRPassengerStatus[];
}

export interface CoachItem {
  position: number;
  code: string;
  label: string;
  category: string;
}

export interface CoachPositionResponse {
  train_number: string;
  train_name: string;
  platform_number: number;
  coaches: CoachItem[];
}

export interface TrainTrackingStation {
  station_code: string;
  station_name: string;
  scheduled_arrival: string;
  actual_arrival: string;
  scheduled_departure: string;
  actual_departure: string;
  delay_minutes: number;
  status: string;
}

export interface TrainTrackingResponse {
  train_number: string;
  train_name: string;
  current_station: string;
  current_status: string;
  delay_minutes: number;
  last_updated: string;
  stations: TrainTrackingStation[];
}

export interface WalletTransaction {
  id: number;
  amount: number;
  tx_type: string;
  description: string;
  reference_id?: string;
  created_at: string;
}

export interface Wallet {
  balance: number;
  transactions: WalletTransaction[];
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  is_veg: boolean;
  category: string;
  image_url?: string;
  available: boolean;
}

export interface Restaurant {
  id: number;
  name: string;
  station_code: string;
  station_name: string;
  rating: number;
  delivery_time_mins: number;
  image_url?: string;
  cuisines: string;
  is_pure_veg: boolean;
  active: boolean;
  menu_items: MenuItem[];
}

export interface FoodOrderItem {
  item_name: string;
  quantity: number;
  price: number;
}

export interface FoodOrder {
  id: number;
  order_id: string;
  train_number: string;
  pnr_number?: string;
  delivery_station: string;
  coach_berth: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: FoodOrderItem[];
}

export interface Refund {
  id: number;
  refund_id: string;
  booking_id: number;
  amount: number;
  reason: string;
  status: string;
  admin_remarks?: string;
  created_at: string;
  processed_at?: string;
}

export interface SupportTicket {
  id: number;
  ticket_id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  admin_response?: string;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
}

export interface AdminStats {
  total_users: number;
  total_stations: number;
  total_trains: number;
  total_bookings: number;
  total_revenue: number;
  pending_refunds: number;
  open_support_tickets: number;
  total_food_orders: number;
}

export type Language = 'en' | 'hi' | 'mr';
