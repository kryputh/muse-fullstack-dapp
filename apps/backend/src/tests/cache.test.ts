import request from 'supertest'
import app from '@/index'
import cacheService from '@/services/cacheService'

describe('Cache Integration Tests', () => {
  beforeEach(async () => {
    // Clear cache before each test
    await cacheService.flush()
  })

  afterAll(async () => {
    // Clean up after tests
    await cacheService.disconnect()
  })

  describe('Artwork Caching', () => {
    it('should cache artwork list response', async () => {
      // First request - should hit the database
      const response1 = await request(app)
        .get('/api/artworks')
        .expect(200)

      expect(response1.body.success).toBe(true)
      expect(response1.headers['etag']).toBeDefined()

      // Second request - should hit cache
      const response2 = await request(app)
        .get('/api/artworks')
        .expect(200)

      expect(response2.body.success).toBe(true)
      expect(response2.body.data).toEqual(response1.body.data)
      expect(response2.headers['etag']).toEqual(response1.headers['etag'])
    })

    it('should cache individual artwork response', async () => {
      const artworkId = '1'

      // First request - should hit the database
      const response1 = await request(app)
        .get(`/api/artworks/${artworkId}`)
        .expect(200)

      expect(response1.body.success).toBe(true)
      expect(response1.headers['etag']).toBeDefined()

      // Second request with matching ETag - should return 304
      await request(app)
        .get(`/api/artworks/${artworkId}`)
        .set('If-None-Match', response1.headers['etag'])
        .expect(304)
    })

    it('should invalidate cache when creating new artwork', async () => {
      // First request to populate cache
      await request(app)
        .get('/api/artworks')
        .expect(200)

      // Create new artwork (should invalidate cache)
      const newArtwork = {
        title: 'Test Artwork',
        description: 'Test Description',
        imageUrl: 'https://example.com/test.jpg',
        price: '0.1',
        prompt: 'Test prompt',
        aiModel: 'Test Model'
      }

      await request(app)
        .post('/api/artworks')
        .send(newArtwork)
        .expect(201)

      // Verify cache was invalidated by checking cache stats
      const stats = cacheService.getCacheStats()
      expect(stats.fallbackKeys).toBe(0)
    })
  })

  describe('User Profile Caching', () => {
    it('should cache user profile response', async () => {
      // First request
      const response1 = await request(app)
        .get('/api/users/profile')
        .expect(200)

      expect(response1.body.success).toBe(true)

      // Second request - should hit cache
      const response2 = await request(app)
        .get('/api/users/profile')
        .expect(200)

      expect(response2.body.data).toEqual(response1.body.data)
    })
  })

  describe('Metadata Caching', () => {
    it('should cache metadata response', async () => {
      const artworkId = '1'

      // First request
      const response1 = await request(app)
        .get(`/api/metadata/artwork/${artworkId}`)
        .expect(200)

      expect(response1.body.success).toBe(true)
      expect(response1.headers['etag']).toBeDefined()

      // Second request with matching ETag - should return 304
      await request(app)
        .get(`/api/metadata/artwork/${artworkId}`)
        .set('If-None-Match', response1.headers['etag'])
        .expect(304)
    })
  })

  describe('AI Status Caching', () => {
    it('should cache AI generation status', async () => {
      const generationId = '123'

      // First request
      const response1 = await request(app)
        .get(`/api/ai/status/${generationId}`)
        .expect(200)

      expect(response1.body.success).toBe(true)

      // Second request - should hit cache
      const response2 = await request(app)
        .get(`/api/ai/status/${generationId}`)
        .expect(200)

      expect(response2.body.data).toEqual(response1.body.data)
    })
  })

  describe('Cache Management API', () => {
    it('should return cache statistics', async () => {
      const response = await request(app)
        .get('/api/cache/stats')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('useRedis')
      expect(response.body.data).toHaveProperty('fallbackKeys')
    })

    it('should clear all caches', async () => {
      // Populate some cache
      await request(app)
        .get('/api/artworks')
        .expect(200)

      // Clear cache
      const response = await request(app)
        .delete('/api/cache/clear')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('cleared successfully')
    })

    it('should invalidate artwork caches', async () => {
      // Populate some cache
      await request(app)
        .get('/api/artworks')
        .expect(200)

      // Invalidate artwork caches
      const response = await request(app)
        .delete('/api/cache/invalidate/artworks')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('artwork caches invalidated')
    })

    it('should invalidate specific artwork cache', async () => {
      const artworkId = '1'

      // Invalidate specific artwork cache
      const response = await request(app)
        .delete(`/api/cache/invalidate/artworks?artworkId=${artworkId}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain(artworkId)
    })
  })

  describe('Cache Behavior with Different Parameters', () => {
    it('should cache different query parameters separately', async () => {
      // Request with page=1
      const response1 = await request(app)
        .get('/api/artworks?page=1&limit=10')
        .expect(200)

      // Request with page=2
      const response2 = await request(app)
        .get('/api/artworks?page=2&limit=10')
        .expect(200)

      // Should be cached separately
      const cacheKey1 = `cache:GET:/api/artworks:{"page":"1","limit":"10"}:/api/artworks?page=1&limit=10`
      const cacheKey2 = `cache:GET:/api/artworks:{"page":"2","limit":"10"}:/api/artworks?page=2&limit=10`

      const cached1 = await cacheService.get(cacheKey1)
      const cached2 = await cacheService.get(cacheKey2)

      expect(cached1).toBeTruthy()
      expect(cached2).toBeTruthy()
      expect(cached1.data).not.toEqual(cached2.data)
    })
  })
})
