import { Request, Response } from "express";
import Joi from 'joi';
import { ExamResultRepository } from "../repository/examResult.repo";
import { ExamRepository } from "../repository/exam.repo";
import { UserRepository } from "../repository/user.repo";
import { AuthRequest } from "../middleware/auth.middleware";

const examResultRepo = new ExamResultRepository();
const examRepo = new ExamRepository();
const userRepo = new UserRepository();

// Assign Marks to Multiple Students
export const assignMarksToMultipleController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'teacher') {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only teachers can assign marks." 
            });
        }

        const schema = Joi.object({
            examId: Joi.string().required(),
            results: Joi.array().items(
                Joi.object({
                    studentId: Joi.string().required(),
                    marksObtained: Joi.number().min(0).required(),
                    remarks: Joi.string().optional()
                })
            ).min(1).required()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const { examId, results } = value;

        // Check if exam exists
        const exam = await examRepo.findById(examId);
        if (!exam) {
            return res.status(404).json({ 
                success: false,
                message: "Exam not found" 
            });
        }

        const createdResults = [];
        const errors = [];

        for (const resultData of results) {
            try {
                if (resultData.marksObtained > exam.totalMarks) {
                    errors.push({
                        studentId: resultData.studentId,
                        error: `Marks obtained (${resultData.marksObtained}) cannot exceed total marks (${exam.totalMarks})`
                    });
                    continue;
                }

                const student = await userRepo.findById(resultData.studentId);
                if (!student || student.role !== 'student') {
                    errors.push({
                        studentId: resultData.studentId,
                        error: "Student not found or invalid student ID"
                    });
                    continue;
                }

                const result = await examResultRepo.createOrUpdateResult({
                    examId,
                    studentId: resultData.studentId,
                    marksObtained: resultData.marksObtained,
                    remarks: resultData.remarks,
                    submittedBy: req.user.userId
                });

                createdResults.push({
                    id: result._id,
                    studentId: result.studentId,
                    marksObtained: result.marksObtained,
                    grade: result.grade
                });
            } catch (err: any) {
                errors.push({
                    studentId: resultData.studentId,
                    error: err.message
                });
            }
        }

        return res.status(200).json({ 
            success: true,
            message: "Marks assigned successfully", 
            results: createdResults,
            errors: errors.length > 0 ? errors : undefined,
            summary: {
                totalProcessed: results.length,
                successful: createdResults.length,
                failed: errors.length
            }
        });
        
    } catch (err: any) {
        console.error("Assign marks to multiple error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Get Student Performance Summary
export const getStudentPerformanceController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required" 
            });
        }

        const { studentId } = req.params;

        if (req.user.role === 'student' && req.user.userId !== studentId) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You can only view your own performance." 
            });
        }

        // Use aggregation to get results with exam details
        const results = await examResultRepo.getStudentResultsWithDetails(studentId);

        if (results.length === 0) {
            return res.status(200).json({ 
                success: true,
                message: "No exam results found for this student",
                performance: {
                    totalExams: 0,
                    averageMarks: 0,
                    averagePercentage: 0,
                    totalMarksObtained: 0,
                    grades: {}
                }
            });
        }

        let totalMarksObtained = 0;
        let totalPossibleMarks = 0;
        const grades: { [key: string]: number } = {};

        results.forEach(result => {
            totalMarksObtained += result.marksObtained;
            totalPossibleMarks += result.exam.totalMarks;
            
            if (result.grade) {
                grades[result.grade] = (grades[result.grade] || 0) + 1;
            }
        });

        const averageMarks = totalMarksObtained / results.length;
        const averagePercentage = totalPossibleMarks > 0 ? (totalMarksObtained / totalPossibleMarks) * 100 : 0;

        const performance = {
            totalExams: results.length,
            averageMarks: Math.round(averageMarks * 100) / 100,
            averagePercentage: Math.round(averagePercentage * 100) / 100,
            totalMarksObtained,
            grades,
            recentResults: results.slice(0, 5).map(result => ({
                examName: result.exam.name,
                marksObtained: result.marksObtained,
                totalMarks: result.exam.totalMarks,
                grade: result.grade,
                date: result.exam.date
            }))
        };

        return res.status(200).json({ 
            success: true,
            message: "Student performance fetched successfully",
            performance
        });
        
    } catch (err: any) {
        console.error("Get student performance error:", err);
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

        // Use aggregation to get results with student details
        const results = await examResultRepo.getResultsWithExamDetails(examId);
        const statistics = await examResultRepo.getExamStatistics(examId);

        const resultsResponse = results.map(result => ({
            id: result._id,
            student: result.student,
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

// Get Exam Result by ID
export const getExamResultByIdController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required" 
            });
        }

        const { resultId } = req.params;

        // Use aggregation to get result with all details
        const result = await examResultRepo.getResultWithDetails(resultId);
        if (!result) {
            return res.status(404).json({ 
                success: false,
                message: "Exam result not found" 
            });
        }

        // Check permissions
        if (req.user.role === 'student' && result.student._id.toString() !== req.user.userId) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You can only view your own results." 
            });
        }

        const resultResponse = {
            id: result._id,
            exam: result.exam,
            student: result.student,
            marksObtained: result.marksObtained,
            totalMarks: result.exam.totalMarks,
            percentage: Math.round((result.marksObtained / result.exam.totalMarks) * 100 * 100) / 100,
            grade: result.grade,
            remarks: result.remarks,
            submittedAt: result.createdAt
        };

        return res.status(200).json({ 
            success: true,
            message: "Exam result fetched successfully",
            result: resultResponse
        });
        
    } catch (err: any) {
        console.error("Get exam result by ID error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Delete Exam Result
export const deleteExamResultController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !['admin', 'teacher'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only admin and teachers can delete exam results." 
            });
        }

        const { resultId } = req.params;

        const result = await examResultRepo.deleteResult(resultId);
        if (!result) {
            return res.status(404).json({ 
                success: false,
                message: "Exam result not found" 
            });
        }

        return res.status(200).json({ 
            success: true,
            message: "Exam result deleted successfully"
        });
        
    } catch (err: any) {
        console.error("Delete exam result error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};