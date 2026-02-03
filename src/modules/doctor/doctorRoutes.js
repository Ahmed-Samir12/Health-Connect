import express from 'express';
import * as doctorController from './doctorController.js';
import { protect } from '../auth/authMiddleware.js';
import {
  requireDoctorRole,
  filterDoctorVisability,
} from './doctorMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', filterDoctorVisability, doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctor);
router.post('/apply', requireDoctorRole, doctorController.createDoctor);
router.post('/updateMe', requireDoctorRole, doctorController.updateMyProfile);

export default router;
