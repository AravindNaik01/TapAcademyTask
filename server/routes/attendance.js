import express from 'express';
import {
  checkin,
  checkout,
  myHistory,
  mySummary,
  today,
  all,
  getEmployeeAttendance,
  summary,
  exportAttendance,
  todayStatus,
} from '../controllers/attendanceController.js';
import { protect, employeeOnly, managerOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/checkin', protect, employeeOnly, checkin);
router.post('/checkout', protect, employeeOnly, checkout);
router.get('/my-history', protect, employeeOnly, myHistory);
router.get('/my-summary', protect, employeeOnly, mySummary);
router.get('/today', protect, employeeOnly, today);

router.get('/all', protect, managerOnly, all);
router.get('/employee/:id', protect, managerOnly, getEmployeeAttendance);
router.get('/summary', protect, managerOnly, summary);
router.get('/export', protect, managerOnly, exportAttendance);
router.get('/today-status', protect, managerOnly, todayStatus);

export default router;
