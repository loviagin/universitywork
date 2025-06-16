import '@testing-library/jest-dom'
import '@types/jest'

// Add Jest types to global scope
declare global {
  namespace jest {
    interface Mock<T = any, Y extends any[] = any> {
      mockResolvedValue: (value: T) => Mock<T, Y>
      mockRejectedValue: (value: any) => Mock<T, Y>
      mockImplementation: (fn: (...args: Y) => T) => Mock<T, Y>
      mockClear: () => Mock<T, Y>
      mockReset: () => Mock<T, Y>
      mockRestore: () => Mock<T, Y>
      mockReturnValue: (value: T) => Mock<T, Y>
      mockReturnValueOnce: (value: T) => Mock<T, Y>
      mockResolvedValueOnce: (value: T) => Mock<T, Y>
      mockRejectedValueOnce: (value: any) => Mock<T, Y>
      mockImplementationOnce: (fn: (...args: Y) => T) => Mock<T, Y>
      mockReturnThis: () => Mock<T, Y>
      mockName: (name: string) => Mock<T, Y>
      getMockName: () => string
    }
  }
}

// Mock fetch globally
global.fetch = jest.fn()

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
}) 