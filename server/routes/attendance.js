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

router.post('/checkin', protect, checkin);
router.post('/checkout', protect, checkout);
router.get('/my-history', protect, myHistory);
router.get('/my-summary', protect, mySummary);
router.get('/today', protect, today);

router.get('/all', protect, managerOnly, all);
router.get('/employee/:id', protect, managerOnly, getEmployeeAttendance);
router.get('/summary', protect, managerOnly, summary);
router.get('/export', protect, managerOnly, exportAttendance);
router.get('/today-status', protect, managerOnly, todayStatus);

export default router;
