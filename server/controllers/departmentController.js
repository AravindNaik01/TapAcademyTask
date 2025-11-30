import Department from '../models/Department.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
const getDepartments = asyncHandler(async (req, res) => {
    const departments = await Department.find({ isActive: true }).select('name _id');
    res.json({
        success: true,
        data: departments
    });
});

// @desc    Create a department
// @route   POST /api/departments
// @access  Private/Manager
const createDepartment = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const departmentExists = await Department.findOne({ name });

    if (departmentExists) {
        res.status(400);
        throw new Error('Department already exists');
    }

    const department = await Department.create({
        name,
        description
    });

    if (department) {
        res.status(201).json({
            success: true,
            data: department
        });
    } else {
        res.status(400);
        throw new Error('Invalid department data');
    }
});

export { getDepartments, createDepartment };
