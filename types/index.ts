export interface Client {
  id: number;
  name: string;
  phone: string;
  passport: string;
  city: string;
  discount: number;
}

export interface Tour {
  id: number;
  title: string;
  city: string;
  start_date: string;
  end_date: string;
  services: string;
  price: number;
  total_seats: number;
  available_seats: number;
}

export interface Employee {
  id: number;
  name: string;
  position: string;
}

export interface Sale {
  id: number;
  date: string;
  quantity: number;
  client_id: number;
  tour_id: number;
  employee_id: number;
}
