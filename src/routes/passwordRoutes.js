import { Router } from 'express'
import passwordController from '../controllers/PasswordContoller'

const router = new Router()

router.post('/forgot', passwordController.forgotPassword)
router.post('/reset', passwordController.resetPassword)
router.get('/resetPassword', passwordController.showResetPage)

export default router
