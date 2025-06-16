import { Mock } from 'jest-mock'

export interface MockDatabase {
  get: Mock<Promise<any>, [query: string, ...params: any[]]>
  all: Mock<Promise<any[]>, [query: string, ...params: any[]]>
  run: Mock<Promise<any>, [query: string, ...params: any[]]>
}

export interface Tour {
  id: number
  name: string
  description: string
  price: number
  duration: number
  max_clients: number
  start_date: string
  end_date: string
  status: string
  created_at: string
}

export interface Sale {
  id: number
  client_id: number
  client_name: string
  client_phone: string
  tour_id: number
  tour_name: string
  tour_start_date: string
  tour_end_date: string
  price: number
  status: string
  payment_method: string
  notes: string
  created_at: string
}

export interface Report {
  totalSales: number
  totalRevenue: number
  averagePrice: number
  salesByStatus: {
    completed: number
    pending: number
    cancelled: number
  }
  salesByPaymentMethod: Array<{
    method: string
    count: number
    total: number
  }>
  topTours: Array<{
    id: number
    name: string
    sales: number
    revenue: number
  }>
  topClients: Array<{
    id: number
    name: string
    purchases: number
    totalSpent: number
  }>
  salesByMonth: Array<{
    month: string
    sales: number
    revenue: number
  }>
} 