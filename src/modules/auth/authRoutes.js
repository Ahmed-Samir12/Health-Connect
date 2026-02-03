import express from 'express';
import * as authcontroller from './authController.js';
import { protect } from './authMiddleware.js';

const router = express.Router();

router.post('/signup/patient', authcontroller.signupPatient);
router.post('/signup/doctor', authcontroller.signupDoctor);
router.post('/login', authcontroller.login);
router.post('/refresh', authcontroller.refresh);
router.delete('/logout', authcontroller.logout);
router.delete('/logoutAll', protect, authcontroller.logoutAll);
router.post('/forgetPassword', authcontroller.forgotPassword);
router.patch('/resetPassword/:resetToken', authcontroller.resetPassword);

export default router;
