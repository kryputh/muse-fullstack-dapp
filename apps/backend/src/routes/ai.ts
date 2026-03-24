import { Router } from 'express'
import { generateImage, getGenerationStatus } from '@/controllers/aiController'
import { aiStatusCache } from '@/middleware/cacheMiddleware'

const router = Router()

router.post('/generate', generateImage)
router.get('/status/:id', aiStatusCache, getGenerationStatus)

export default router
