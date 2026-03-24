import { Router } from 'express'
import { getArtworks, getArtworkById, createArtwork } from '@/controllers/artworkController'
import { artworkListCache, artworkDetailCache } from '@/middleware/cacheMiddleware'

const router = Router()

router.get('/', artworkListCache, getArtworks)
router.get('/:id', artworkDetailCache, getArtworkById)
router.post('/', createArtwork)

export default router
