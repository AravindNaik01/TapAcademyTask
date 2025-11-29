import express from 'express';
import { employeeDashboard, managerDashboard } from '../controllers/dashboardController.js';
import { protect, employeeOnly, managerOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/employee', protect, employeeOnly, employeeDashboard);
router.get('/manager', protect, managerOnly, managerDashboard);

export default router;

