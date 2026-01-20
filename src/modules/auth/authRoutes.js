import express from 'express';
import * as authcontroller from './authController.js';

const router = express.Router();

router.post('/signup', authcontroller.signup);
router.post('/login', authcontroller.login);
router.post('/refresh', authcontroller.refresh);
router.delete('/logout', authcontroller.logout);
router.delete('/logoutAll', authcontroller.logoutAll);
router.post('/forgetPassword', authcontroller.forgotPassword);
router.patch('/resetPassword/:resetToken', authcontroller.resetPassword);

export default router;
