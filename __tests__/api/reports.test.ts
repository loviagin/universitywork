import { openDb } from '@/lib/db'
import { GET } from '@/app/api/reports/route'
import { NextRequest } from 'next/server'
import { MockDatabase, Report } from '../types'

// Mock the database module
jest.mock('@/lib/db', () => ({
  openDb: jest.fn(),
}))

describe('Reports API', () => {
  let mockDb: MockDatabase

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Setup mock database
    mockDb = {
      get: jest.fn(),
      all: jest.fn(),
      run: jest.fn(),
    }
    ;(openDb as jest.Mock).mockResolvedValue(mockDb)
  })

  it('should return report data for the current month by default', async () => {
    // Mock database responses
    mockDb.get.mockImplementation((query: string) => {
      if (query.includes('COUNT(*) as totalSales')) {
        return Promise.resolve({ totalSales: 10, totalRevenue: 1000, averagePrice: 100 })
      }
      if (query.includes('SUM(CASE WHEN status')) {
        return Promise.resolve({ completed: 7, pending: 2, cancelled: 1 })
      }
      return Promise.resolve({})
    })

    mockDb.all.mockImplementation((query: string) => {
      if (query.includes('payment_method')) {
        return Promise.resolve([
          { payment_method: 'card', count: 5, total: 500 },
          { payment_method: 'cash', count: 3, total: 300 },
          { payment_method: 'transfer', count: 2, total: 200 },
        ])
      }
      if (query.includes('tours t')) {
        return Promise.resolve([
          { id: 1, name: 'Tour 1', sales: 5, revenue: 500 },
          { id: 2, name: 'Tour 2', sales: 3, revenue: 300 },
        ])
      }
      if (query.includes('clients c')) {
        return Promise.resolve([
          { id: 1, name: 'Client 1', purchases: 4, totalSpent: 400 },
          { id: 2, name: 'Client 2', purchases: 3, totalSpent: 300 },
        ])
      }
      if (query.includes('strftime')) {
        return Promise.resolve([
          { month: '2024-03', sales: 5, revenue: 500 },
          { month: '2024-04', sales: 5, revenue: 500 },
        ])
      }
      return Promise.resolve([])
    })

    // Create a mock request
    const request = new NextRequest('http://localhost:3000/api/reports')

    // Call the API
    const response = await GET(request)
    const data = await response.json() as Report

    // Assertions
    expect(response.status).toBe(200)
    expect(data).toEqual({
      totalSales: 10,
      totalRevenue: 1000,
      averagePrice: 100,
      salesByStatus: {
        completed: 7,
        pending: 2,
        cancelled: 1,
      },
      salesByPaymentMethod: [
        { method: 'Карта', count: 5, total: 500 },
        { method: 'Наличные', count: 3, total: 300 },
        { method: 'Перевод', count: 2, total: 200 },
      ],
      topTours: [
        { id: 1, name: 'Tour 1', sales: 5, revenue: 500 },
        { id: 2, name: 'Tour 2', sales: 3, revenue: 300 },
      ],
      topClients: [
        { id: 1, name: 'Client 1', purchases: 4, totalSpent: 400 },
        { id: 2, name: 'Client 2', purchases: 3, totalSpent: 300 },
      ],
      salesByMonth: [
        { month: '2024-03', sales: 5, revenue: 500 },
        { month: '2024-04', sales: 5, revenue: 500 },
      ],
    })
  })

  it('should handle custom date range', async () => {
    // Mock database responses
    mockDb.get.mockResolvedValue({ totalSales: 5, totalRevenue: 500, averagePrice: 100 })
    mockDb.all.mockResolvedValue([])

    // Create a mock request with custom date range
    const request = new NextRequest(
      'http://localhost:3000/api/reports?start=2024-01-01&end=2024-01-31'
    )

    // Call the API
    const response = await GET(request)

    // Verify that the date range was used in the queries
    expect(mockDb.get).toHaveBeenCalledWith(
      expect.stringContaining('BETWEEN ? AND ?'),
      ['2024-01-01', '2024-01-31']
    )
  })

  it('should handle database errors', async () => {
    // Mock database error
    mockDb.get.mockRejectedValue(new Error('Database error'))

    // Create a mock request
    const request = new NextRequest('http://localhost:3000/api/reports')

    // Call the API
    const response = await GET(request)

    // Assertions
    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Error generating report')
  })

  it('should handle empty results', async () => {
    // Mock empty database responses
    mockDb.get.mockResolvedValue({})
    mockDb.all.mockResolvedValue([])

    // Create a mock request
    const request = new NextRequest('http://localhost:3000/api/reports')

    // Call the API
    const response = await GET(request)
    const data = await response.json() as Report

    // Assertions
    expect(response.status).toBe(200)
    expect(data).toEqual({
      totalSales: 0,
      totalRevenue: 0,
      averagePrice: 0,
      salesByStatus: {
        completed: 0,
        pending: 0,
        cancelled: 0,
      },
      salesByPaymentMethod: [],
      topTours: [],
      topClients: [],
      salesByMonth: [],
    })
  })
}) 