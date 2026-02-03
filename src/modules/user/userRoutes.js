import express from 'express';
import * as userController from './userController.js';

const router = express.Router();

router.get('/', userController.getAll);

export default router;
