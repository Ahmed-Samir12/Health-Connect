import express from 'express';
import * as adminController from './adminController.js';
import * as doctorController from '../doctor/doctorController.js';
import { protect, restrictTo } from '../auth/authMiddleware.js';

const router = express.Router();

router.use(protect, restrictTo('admin'));

// get all doctors
router.get('/doctors', doctorController.getAllDoctors);

router
  .route('/doctors/:id')
  .get(doctorController.getDoctor)
  .patch(doctorController.updateDoctor)
  .delete(doctorController.deleteDoctor);

router.get('/doctors/pending', adminController.getPendingDoctors);
router.post('/doctors/:doctorId/approve', adminController.verifiyDoctor);
router.post('/doctors/:doctorId/reject', adminController.rejectDoctor);

export default router;
