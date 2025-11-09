import { Request, Response } from "express";
import Joi from 'joi';
import { BatchRepository } from "../repository/batch.repo";
import { CourseRepository } from "../repository/course.repo";
import { UserRepository } from "../repository/user.repo";
import { AuthRequest } from "../middleware/auth.middleware";

const batchRepo = new BatchRepository();
const courseRepo = new CourseRepository();
const userRepo = new UserRepository();

// Add Batch (Admin/Teacher)
export const createBatchController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required" 
            });
        }

        if (!['admin', 'teacher'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only admin or teacher can create batches." 
            });
        }

        const schema = Joi.object({
            name: Joi.string().min(2).max(100).required(),
            courseId: Joi.string().required(),
            startDate: Joi.date().iso().greater('now').required(),
            endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
            teacherId: Joi.string().required(),
            maxStudents: Joi.number().min(1).max(100).default(30)
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const { name, courseId, startDate, endDate, teacherId, maxStudents } = value;

        // Check if course exists
        const course = await courseRepo.findById(courseId);
        if (!course) {
            return res.status(404).json({ 
                success: false,
                message: "Course not found" 
            });
        }

        // Check if teacher exists and is actually a teacher
        const teacher = await userRepo.findById(teacherId);
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(400).json({ 
                success: false,
                message: "Teacher not found or invalid teacher ID" 
            });
        }

        const batch = await batchRepo.createBatch({
            name,
            courseId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            teacherId,
            maxStudents,
            createdBy: req.user.userId
        });

        return res.status(201).json({ 
            success: true,
            message: "Batch created successfully", 
            batch: {
                id: batch._id,
                name: batch.name,
                courseId: batch.courseId,
                startDate: batch.startDate,
                endDate: batch.endDate,
                teacherId: batch.teacherId,
                maxStudents: batch.maxStudents,
                isActive: batch.isActive,
                createdBy: req.user.userId
            }
        });
        
    } catch (err: any) {
        console.error("Create batch error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Get All Batches for a Course
export const getBatchesByCourseController = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;

        const batches = await batchRepo.findByCourseId(courseId);

        const batchesResponse = batches.map(batch => ({
            id: batch._id,
            name: batch.name,
            courseId: batch.courseId,
            startDate: batch.startDate,
            endDate: batch.endDate,
            teacher: batch.teacherId,
            totalStudents: batch.students.length,
            maxStudents: batch.maxStudents,
            isActive: batch.isActive,
            createdAt: batch.createdAt
        }));

        return res.status(200).json({ 
            success: true,
            message: "Batches fetched successfully",
            batches: batchesResponse
        });
        
    } catch (err: any) {
        console.error("Get batches error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Assign Student to Batch (Admin Only)
export const assignStudentToBatchController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only admin can assign students to batches." 
            });
        }

        const schema = Joi.object({
            studentId: Joi.string().required()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const { batchId } = req.params;
        const { studentId } = value;

        // Check if student exists
        const student = await userRepo.findById(studentId);
        if (!student || student.role !== 'student') {
            return res.status(400).json({ 
                success: false,
                message: "Student not found or invalid student ID" 
            });
        }

        const batch = await batchRepo.assignStudentToBatch(batchId, studentId);
        if (!batch) {
            return res.status(404).json({ 
                success: false,
                message: "Batch not found" 
            });
        }

        return res.status(200).json({ 
            success: true,
            message: "Student assigned to batch successfully", 
            batch: {
                id: batch._id,
                name: batch.name,
                totalStudents: batch.students.length
            }
        });
        
    } catch (err: any) {
        console.error("Assign student error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Update Batch (Admin/Teacher)
export const updateBatchController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required" 
            });
        }

        const schema = Joi.object({
            name: Joi.string().min(2).max(100),
            startDate: Joi.date().iso().greater('now'),
            endDate: Joi.date().iso().greater(Joi.ref('startDate')),
            teacherId: Joi.string(),
            maxStudents: Joi.number().min(1).max(100)
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const { batchId } = req.params;

        // If teacherId is being updated, verify the teacher exists
        if (value.teacherId) {
            const teacher = await userRepo.findById(value.teacherId);
            if (!teacher || teacher.role !== 'teacher') {
                return res.status(400).json({ 
                    success: false,
                    message: "Teacher not found or invalid teacher ID" 
                });
            }
        }

        const batch = await batchRepo.updateBatch(batchId, value);
        if (!batch) {
            return res.status(404).json({ 
                success: false,
                message: "Batch not found" 
            });
        }

        return res.status(200).json({ 
            success: true,
            message: "Batch updated successfully", 
            batch: {
                id: batch._id,
                name: batch.name,
                startDate: batch.startDate,
                endDate: batch.endDate,
                teacherId: batch.teacherId,
                maxStudents: batch.maxStudents
            }
        });
        
    } catch (err: any) {
        console.error("Update batch error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Delete Batch (Admin Only - Soft Delete)
export const deleteBatchController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only admin can delete batches." 
            });
        }

        const { batchId } = req.params;

        const batch = await batchRepo.deleteBatch(batchId);
        if (!batch) {
            return res.status(404).json({ 
                success: false,
                message: "Batch not found" 
            });
        }

        return res.status(200).json({ 
            success: true,
            message: "Batch deleted successfully"
        });
        
    } catch (err: any) {
        console.error("Delete batch error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};