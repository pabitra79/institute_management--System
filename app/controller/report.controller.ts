import { Request, Response } from "express";
import { ReportRepository } from "../repository/report.repo";
import { AuthRequest } from "../middleware/auth.middleware";

const reportRepo = new ReportRepository();

// Get Student Performance Report
export const getStudentPerformanceController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required" 
            });
        }

        const { studentId } = req.params;

        // Check permissions
        if (req.user.role === 'student' && req.user.userId !== studentId) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You can only view your own performance report." 
            });
        }

        const performance = await reportRepo.getStudentPerformance(studentId);

        return res.status(200).json({ 
            success: true,
            message: "Student performance report fetched successfully",
            report: performance
        });
        
    } catch (err: any) {
        console.error("Get student performance error:", err);
        if (err.message === 'Student not found') {
            return res.status(404).json({ 
                success: false,
                message: err.message 
            });
        }
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Get Batch Performance Report
export const getBatchPerformanceController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !['admin', 'teacher'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only admin and teachers can view batch performance reports." 
            });
        }

        const { batchId } = req.params;

        const performance = await reportRepo.getBatchPerformance(batchId);

        return res.status(200).json({ 
            success: true,
            message: "Batch performance report fetched successfully",
            report: performance
        });
        
    } catch (err: any) {
        console.error("Get batch performance error:", err);
        if (err.message === 'Batch not found') {
            return res.status(404).json({ 
                success: false,
                message: err.message 
            });
        }
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Get Course Enrollment Report
export const getCourseEnrollmentReportController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !['admin', 'teacher'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only admin and teachers can view course enrollment reports." 
            });
        }

        const { courseId } = req.params;

        const report = await reportRepo.getCourseEnrollmentReport(courseId);

        return res.status(200).json({ 
            success: true,
            message: "Course enrollment report fetched successfully",
            report: report
        });
        
    } catch (err: any) {
        console.error("Get course enrollment report error:", err);
        if (err.message === 'Course not found') {
            return res.status(404).json({ 
                success: false,
                message: err.message 
            });
        }
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Get All Courses Enrollment Report
export const getAllCoursesEnrollmentController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only admin can view all courses enrollment report." 
            });
        }

        const courses = await reportRepo.getAllCoursesEnrollment();

        return res.status(200).json({ 
            success: true,
            message: "All courses enrollment report fetched successfully",
            courses: courses
        });
        
    } catch (err: any) {
        console.error("Get all courses enrollment error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Get My Performance Report (for students)
export const getMyPerformanceController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required" 
            });
        }

        if (req.user.role !== 'student') {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. This endpoint is for students only." 
            });
        }

        const performance = await reportRepo.getStudentPerformance(req.user.userId);

        return res.status(200).json({ 
            success: true,
            message: "Your performance report fetched successfully",
            report: performance
        });
        
    } catch (err: any) {
        console.error("Get my performance error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};