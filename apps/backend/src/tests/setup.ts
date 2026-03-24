import { config } from 'dotenv'

// Load test environment variables
config({ path: '.env.test' })

// Set test defaults
process.env.NODE_ENV = 'test'
process.env.PORT = '5001'
process.env.FRONTEND_URL = 'http://localhost:3000'

// Disable Redis in tests (use fallback cache)
process.env.REDIS_URL = ''
process.env.REDIS_HOST = ''
process.env.REDIS_PORT = ''
