import { Router } from 'express'
import { getUserProfile, updateUserProfile } from '@/controllers/userController'
import { userProfileCache } from '@/middleware/cacheMiddleware'

const router = Router()

router.get('/profile', userProfileCache, getUserProfile)
router.put('/profile', updateUserProfile)

export default router
