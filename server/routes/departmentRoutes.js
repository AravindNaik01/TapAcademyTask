import express from 'express';
import { getDepartments, createDepartment } from '../controllers/departmentController.js';
import { protect, managerOnly } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(getDepartments)
    .post(protect, managerOnly, createDepartment);

export default router;
