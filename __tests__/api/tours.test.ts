import { openDb } from '@/lib/db'
import { GET, POST } from '@/app/api/tours/route'
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

interface Tour {
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

describe('Tours API', () => {
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

  describe('GET /api/tours', () => {
    it('should return list of tours', async () => {
      // Mock database response
      const mockTours: Tour[] = [
        {
          id: 1,
          name: 'Tour 1',
          description: 'Description 1',
          price: 100,
          duration: 7,
          max_clients: 10,
          start_date: '2024-04-01',
          end_date: '2024-04-08',
          status: 'active',
          created_at: '2024-03-01T00:00:00Z',
        },
        {
          id: 2,
          name: 'Tour 2',
          description: 'Description 2',
          price: 200,
          duration: 14,
          max_clients: 15,
          start_date: '2024-05-01',
          end_date: '2024-05-15',
          status: 'active',
          created_at: '2024-03-02T00:00:00Z',
        },
      ]
      mockDb.all.mockResolvedValue(mockTours)

      // Create a mock request
      const request = new NextRequest('http://localhost:3000/api/tours')

      // Call the API
      const response = await GET(request)
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data).toEqual(mockTours)
      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM tours ORDER BY created_at DESC')
      )
    })

    it('should handle database errors', async () => {
      // Mock database error
      mockDb.all.mockRejectedValue(new Error('Database error'))

      // Create a mock request
      const request = new NextRequest('http://localhost:3000/api/tours')

      // Call the API
      const response = await GET(request)

      // Assertions
      expect(response.status).toBe(500)
      expect(await response.text()).toBe('Error fetching tours')
    })
  })

  describe('POST /api/tours', () => {
    it('should create a new tour', async () => {
      // Mock database response
      mockDb.run.mockResolvedValue({ lastID: 1 })

      // Create mock tour data
      const tourData = {
        name: 'New Tour',
        description: 'New Description',
        price: 150,
        duration: 10,
        max_clients: 12,
        start_date: '2024-06-01',
        end_date: '2024-06-11',
        status: 'active',
      }

      // Create a mock request
      const request = new NextRequest('http://localhost:3000/api/tours', {
        method: 'POST',
        body: JSON.stringify(tourData),
      })

      // Call the API
      const response = await POST(request)
      const data = await response.json()

      // Assertions
      expect(response.status).toBe(200)
      expect(data).toEqual({ id: 1, ...tourData })
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tours'),
        expect.arrayContaining([
          tourData.name,
          tourData.description,
          tourData.price,
          tourData.duration,
          tourData.max_clients,
          tourData.start_date,
          tourData.end_date,
          tourData.status,
        ])
      )
    })

    it('should handle invalid tour data', async () => {
      // Create mock request with invalid data
      const request = new NextRequest('http://localhost:3000/api/tours', {
        method: 'POST',
        body: JSON.stringify({ name: 'Invalid Tour' }), // Missing required fields
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

      // Create mock tour data
      const tourData = {
        name: 'New Tour',
        description: 'New Description',
        price: 150,
        duration: 10,
        max_clients: 12,
        start_date: '2024-06-01',
        end_date: '2024-06-11',
        status: 'active',
      }

      // Create a mock request
      const request = new NextRequest('http://localhost:3000/api/tours', {
        method: 'POST',
        body: JSON.stringify(tourData),
      })

      // Call the API
      const response = await POST(request)

      // Assertions
      expect(response.status).toBe(500)
      expect(await response.text()).toBe('Error creating tour')
    })
  })
}) 