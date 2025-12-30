export interface User {
  id: number;
  username: string;
  role: string;
}

export interface Room {
  id: number;
  name: string;
  description: string;
  price: number;
  status: string;
}

export interface Booking {
  id: number;
  startDate: string;
  endDate: string;
  room: Room;
  user: User; 
}

export interface BookingRange {
  startDate: string;
  endDate: string;
}

export interface AuthResponse {
  access_token: string;
}