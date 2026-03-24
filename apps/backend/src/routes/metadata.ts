import { Router } from 'express'
import { getArtworkMetadata } from '@/controllers/metadataController'
import { metadataCache } from '@/middleware/cacheMiddleware'

const router = Router()

router.get('/artwork/:id', metadataCache, getArtworkMetadata)

export default router
