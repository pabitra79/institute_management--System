import { Request, Response } from "express";
import Joi from 'joi';
import { ExamRepository } from "../repository/exam.repo";
import { ExamResultRepository } from "../repository/examResult.repo";
import { BatchRepository } from "../repository/batch.repo";
import { AuthRequest } from "../middleware/auth.middleware";

const examRepo = new ExamRepository();
const examResultRepo = new ExamResultRepository();
const batchRepo = new BatchRepository();

// Create Exam (Admin/Teacher)
export const createExamController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !['admin', 'teacher'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only admin and teachers can create exams." 
            });
        }

        const schema = Joi.object({
            name: Joi.string().min(2).max(100).required(),
            batchId: Joi.string().required(),
            date: Joi.date().iso().greater('now').required(),
            duration: Joi.number().min(1).required(),
            totalMarks: Joi.number().min(1).required(),
            subject: Joi.string().optional(),
            description: Joi.string().optional()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const { name, batchId, date, duration, totalMarks, subject, description } = value;

        // Check if batch exists
        const batch = await batchRepo.findById(batchId);
        if (!batch) {
            return res.status(404).json({ 
                success: false,
                message: "Batch not found" 
            });
        }

        const exam = await examRepo.createExam({
            name,
            batchId,
            date: new Date(date),
            duration,
            totalMarks,
            subject,
            description,
            createdBy: req.user.userId
        });

        return res.status(201).json({ 
            success: true,
            message: "Exam created successfully", 
            exam: {
                id: exam._id,
                name: exam.name,
                batchId: exam.batchId,
                date: exam.date,
                duration: exam.duration,
                totalMarks: exam.totalMarks,
                subject: exam.subject,
                description: exam.description,
                createdBy: exam.createdBy
            }
        });
        
    } catch (err: any) {
        console.error("Create exam error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Assign Marks to Students (Teacher)
export const assignMarksController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'teacher') {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only teachers can assign marks." 
            });
        }

        const schema = Joi.object({
            examId: Joi.string().required(),
            studentId: Joi.string().required(),
            marksObtained: Joi.number().min(0).required(),
            remarks: Joi.string().optional()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const { examId, studentId, marksObtained, remarks } = value;

        // Check if exam exists
        const exam = await examRepo.findById(examId);
        if (!exam) {
            return res.status(404).json({ 
                success: false,
                message: "Exam not found" 
            });
        }

        // Check if marks don't exceed total marks
        if (marksObtained > exam.totalMarks) {
            return res.status(400).json({ 
                success: false,
                message: `Marks obtained cannot exceed total marks (${exam.totalMarks})` 
            });
        }

        const result = await examResultRepo.createOrUpdateResult({
            examId,
            studentId,
            marksObtained,
            remarks,
            submittedBy: req.user.userId
        });

        return res.status(200).json({ 
            success: true,
            message: "Marks assigned successfully", 
            result: {
                id: result._id,
                examId: result.examId,
                studentId: result.studentId,
                marksObtained: result.marksObtained,
                grade: result.grade,
                remarks: result.remarks,
                submittedBy: result.submittedBy
            }
        });
        
    } catch (err: any) {
        console.error("Assign marks error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Get Exam Results by Student
export const getStudentResultsController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required" 
            });
        }

        const { studentId } = req.params;

        // Students can only view their own results
        if (req.user.role === 'student' && req.user.userId !== studentId) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You can only view your own results." 
            });
        }

        const results = await examResultRepo.findByStudentId(studentId);

        const resultsResponse = results.map(result => ({
            id: result._id,
            exam: result.examId,
            marksObtained: result.marksObtained,
            grade: result.grade,
            remarks: result.remarks,
            submittedBy: result.submittedBy,
            createdAt: result.createdAt
        }));

        return res.status(200).json({ 
            success: true,
            message: "Student results fetched successfully",
            results: resultsResponse
        });
        
    } catch (err: any) {
        console.error("Get student results error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Get Exam Results by Batch
export const getBatchResultsController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !['admin', 'teacher'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only admin and teachers can view batch results." 
            });
        }

        const { examId } = req.params;

        const results = await examResultRepo.findByExamId(examId);
        const statistics = await examResultRepo.getExamStatistics(examId);

        const resultsResponse = results.map(result => ({
            id: result._id,
            student: result.studentId,
            marksObtained: result.marksObtained,
            grade: result.grade,
            remarks: result.remarks,
            percentage: Math.round((result.marksObtained / statistics.totalMarks) * 100 * 100) / 100
        }));

        return res.status(200).json({ 
            success: true,
            message: "Batch results fetched successfully",
            results: resultsResponse,
            statistics
        });
        
    } catch (err: any) {
        console.error("Get batch results error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Update Exam Details (Teacher)
export const updateExamController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'teacher') {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only teachers can update exams." 
            });
        }

        const schema = Joi.object({
            name: Joi.string().min(2).max(100),
            date: Joi.date().iso().greater('now'),
            duration: Joi.number().min(1),
            totalMarks: Joi.number().min(1),
            subject: Joi.string().optional(),
            description: Joi.string().optional()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const { examId } = req.params;

        const exam = await examRepo.updateExam(examId, value);
        if (!exam) {
            return res.status(404).json({ 
                success: false,
                message: "Exam not found" 
            });
        }

        return res.status(200).json({ 
            success: true,
            message: "Exam updated successfully", 
            exam: {
                id: exam._id,
                name: exam.name,
                date: exam.date,
                duration: exam.duration,
                totalMarks: exam.totalMarks,
                subject: exam.subject,
                description: exam.description
            }
        });
        
    } catch (err: any) {
        console.error("Update exam error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};