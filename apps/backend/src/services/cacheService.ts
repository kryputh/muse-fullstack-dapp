import Redis from 'redis'
import NodeCache from 'node-cache'
import { createLogger } from '@/utils/logger'

const logger = createLogger('CacheService')

interface CacheConfig {
  redis?: {
    host: string
    port: number
    password?: string
    db?: number
  }
  fallback: {
    stdTTL: number
    checkperiod: number
  }
}

class CacheService {
  private redisClient: Redis.RedisClientType | null = null
  private fallbackCache: NodeCache
  private useRedis: boolean = false

  constructor(config: CacheConfig) {
    // Initialize fallback cache (in-memory)
    this.fallbackCache = new NodeCache({
      stdTTL: config.fallback.stdTTL,
      checkperiod: config.fallback.checkperiod,
      useClones: false
    })

    // Initialize Redis if configured
    if (config.redis) {
      this.initializeRedis(config.redis)
    }
  }

  private async initializeRedis(config: NonNullable<CacheConfig['redis']>) {
    try {
      this.redisClient = Redis.createClient({
        socket: {
          host: config.host,
          port: config.port
        },
        password: config.password,
        database: config.db || 0
      })

      this.redisClient.on('error', (err) => {
        logger.error('Redis connection error:', err)
        this.useRedis = false
      })

      this.redisClient.on('connect', () => {
        logger.info('Redis connected successfully')
        this.useRedis = true
      })

      await this.redisClient.connect()
    } catch (error) {
      logger.error('Failed to initialize Redis:', error)
      this.useRedis = false
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.useRedis && this.redisClient) {
        const value = await this.redisClient.get(key)
        if (value) {
          return JSON.parse(value) as T
        }
      }

      // Fallback to in-memory cache
      const value = this.fallbackCache.get<T>(key)
      if (value !== undefined) {
        return value
      }

      return null
    } catch (error) {
      logger.error(`Error getting cache key ${key}:`, error)
      return null
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serializedValue = JSON.stringify(value)

      if (this.useRedis && this.redisClient) {
        if (ttl) {
          await this.redisClient.setEx(key, ttl, serializedValue)
        } else {
          await this.redisClient.set(key, serializedValue)
        }
      }

      // Always set in fallback cache
      this.fallbackCache.set(key, value, ttl)

      return true
    } catch (error) {
      logger.error(`Error setting cache key ${key}:`, error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.del(key)
      }

      this.fallbackCache.del(key)
      return true
    } catch (error) {
      logger.error(`Error deleting cache key ${key}:`, error)
      return false
    }
  }

  async delPattern(pattern: string): Promise<boolean> {
    try {
      if (this.useRedis && this.redisClient) {
        const keys = await this.redisClient.keys(pattern)
        if (keys.length > 0) {
          await this.redisClient.del(keys)
        }
      }

      // For fallback cache, we need to manually find and delete matching keys
      const keys = this.fallbackCache.keys()
      const matchingKeys = keys.filter(key => key.includes(pattern.replace('*', '')))
      this.fallbackCache.del(matchingKeys)

      return true
    } catch (error) {
      logger.error(`Error deleting cache pattern ${pattern}:`, error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (this.useRedis && this.redisClient) {
        const result = await this.redisClient.exists(key)
        return result === 1
      }

      return this.fallbackCache.has(key)
    } catch (error) {
      logger.error(`Error checking cache key ${key}:`, error)
      return false
    }
  }

  async flush(): Promise<boolean> {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.flushDb()
      }

      this.fallbackCache.flushAll()
      return true
    } catch (error) {
      logger.error('Error flushing cache:', error)
      return false
    }
  }

  getCacheStats() {
    return {
      useRedis: this.useRedis,
      fallbackKeys: this.fallbackCache.keys().length,
      fallbackStats: this.fallbackCache.getStats()
    }
  }

  async disconnect() {
    if (this.redisClient) {
      await this.redisClient.disconnect()
    }
    this.fallbackCache.close()
  }
}

// Cache configuration
const cacheConfig: CacheConfig = {
  redis: process.env.REDIS_URL ? {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0')
  } : undefined,
  fallback: {
    stdTTL: 300, // 5 minutes default TTL
    checkperiod: 60 // Check for expired keys every minute
  }
}

// Create singleton instance
const cacheService = new CacheService(cacheConfig)

export default cacheService
export { CacheService, CacheConfig }
