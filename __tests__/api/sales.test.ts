import { openDb } from '@/lib/db'
import { GET, POST } from '@/app/api/sales/route'
import { NextRequest } from 'next/server'
import { Database } from 'sqlite3'

// Mock the database module
jest.mock('@/lib/db', () => ({
  openDb: jest.fn(),
}))

interface MockDatabase {
  get: jest.Mock
  all: jest.Mock
  run: jest.Mock
}

interface Sale {
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

describe('Sales API', () => {
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

  describe('GET /api/sales', () => {
    it('should return list of sales with client and tour details', async () => {
      // Mock database response
      const mockSales: Sale[] = [
        {
          id: 1,
          client_id: 1,
          client_name: 'John Doe',
          client_phone: '+1234567890',
          tour_id: 1,
          tour_name: 'Tour 1',
          tour_start_date: '2024-04-01',
          tour_end_date: '2024-04-08',
          price: 100,
          status: 'completed',
          payment_method: 'card',
          notes: 'Test sale 1',
          created_at: '2024-03-01T00:00:00Z',
        },
        {
          id: 2,
          client_id: 2,
          client_name: 'Jane Smith',
          client_phone: '+0987654321',
          tour_id: 2,
          tour_name: 'Tour 2',
          tour_start_date: '2024-05-01',
          tour_end_date: '2024-05-15',
          price: 200,
          status: 'pending',
          payment_method: 'cash',
          notes: 'Test sale 2',
          created_at: '2024-03-02T00:00:00Z',
        },
      ]
      mockDb.all.mockResolvedValue(mockSales)

      // Create a mock request
      const request = new NextRequest('http://localhost:3000/api/sales')

      // Call the API
      const response = await GET(request)
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data).toEqual(mockSales)
      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT s.*, c.name as client_name, c.phone as client_phone, t.name as tour_name, t.start_date as tour_start_date, t.end_date as tour_end_date')
      )
    })

    it('should handle database errors', async () => {
      // Mock database error
      mockDb.all.mockRejectedValue(new Error('Database error'))

      // Create a mock request
      const request = new NextRequest('http://localhost:3000/api/sales')

      // Call the API
      const response = await GET(request)

      // Assertions
      expect(response.status).toBe(500)
      expect(await response.text()).toBe('Error fetching sales')
    })
  })

  describe('POST /api/sales', () => {
    it('should create a new sale', async () => {
      // Mock database response
      mockDb.run.mockResolvedValue({ lastID: 1 })

      // Create mock sale data
      const saleData = {
        client_id: 1,
        tour_id: 1,
        price: 150,
        status: 'pending',
        payment_method: 'card',
        notes: 'New sale',
      }

      // Create a mock request
      const request = new NextRequest('http://localhost:3000/api/sales', {
        method: 'POST',
        body: JSON.stringify(saleData),
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data).toEqual({ id: 1, ...saleData })
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sales'),
        expect.arrayContaining([
          saleData.client_id,
          saleData.tour_id,
          saleData.price,
          saleData.status,
          saleData.payment_method,
          saleData.notes,
        ])
      )
    })

    it('should handle invalid sale data', async () => {
      // Create mock request with invalid data
      const request = new NextRequest('http://localhost:3000/api/sales', {
        method: 'POST',
        body: JSON.stringify({ client_id: 1 }), // Missing required fields
      })

      // Call the API
      const response = await POST(request)

      // Assertions
      expect(response.status).toBe(400)
      expect(await response.text()).toBe('Missing required fields')
    })

    it('should handle database errors during creation', async () => {
      // Mock database error
      mockDb.run.mockRejectedValue(new Error('Database error'))

      // Create mock sale data
      const saleData = {
        client_id: 1,
        tour_id: 1,
        price: 150,
        status: 'pending',
        payment_method: 'card',
        notes: 'New sale',
      }

      // Create a mock request
      const request = new NextRequest('http://localhost:3000/api/sales', {
        method: 'POST',
        body: JSON.stringify(saleData),
      })

      // Call the API
      const response = await POST(request)

      // Assertions
      expect(response.status).toBe(500)
      expect(await response.text()).toBe('Error creating sale')
    })
  })
}) 