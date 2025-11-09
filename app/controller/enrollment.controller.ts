import { Request, Response } from "express";
import Joi from 'joi';
import { EnrollmentRepository } from "../repository/enrollment.repo";
import { CourseRepository } from "../repository/course.repo";
import { UserRepository } from "../repository/user.repo";
import { AuthRequest } from "../middleware/auth.middleware";

const enrollmentRepo = new EnrollmentRepository();
const courseRepo = new CourseRepository();
const userRepo = new UserRepository();

// Enroll Student into Course
export const enrollStudentController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required" 
            });
        }

        const schema = Joi.object({
            courseId: Joi.string().required(),
            studentId: Joi.string().optional(),
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const { courseId } = value;

        // Auto-determine student ID
        let studentId: string;

        if (req.user.role === 'student') {
            studentId = req.user.userId;
        } else if (req.user.role === 'admin' || req.user.role === 'teacher') {
            if (!value.studentId) {
                return res.status(400).json({ 
                    success: false,
                    message: "studentId is required when enrolling as admin/teacher" 
                });
            }
            studentId = value.studentId;
        } else {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Invalid user role." 
            });
        }

        // Check if student exists and is actually a student
        const student = await userRepo.findById(studentId);
        if (!student || student.role !== 'student') {
            return res.status(400).json({ 
                success: false,
                message: "Student not found or invalid student" 
            });
        }

        // Check if course exists
        const course = await courseRepo.findById(courseId);
        if (!course) {
            return res.status(404).json({ 
                success: false,
                message: "Course not found" 
            });
        }

        // Check if already enrolled
        const existingEnrollment = await enrollmentRepo.findByStudentAndCourse(studentId, courseId);
        if (existingEnrollment) {
            return res.status(400).json({ 
                success: false,
                message: "You are already enrolled in this course" 
            });
        }

        const enrollment = await enrollmentRepo.createEnrollment({
            courseId,
            studentId
        });

        return res.status(201).json({ 
            success: true,
            message: "Enrolled in course successfully", 
            enrollment: {
                id: enrollment._id,
                studentId: enrollment.studentId,
                courseId: enrollment.courseId,
                batchId: enrollment.batchId,
                enrollmentDate: enrollment.enrollmentDate,
                status: enrollment.status
            }
        });
        
    } catch (err: any) {
        console.error("Enroll student error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Get Student Enrollments
export const getStudentEnrollmentsController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required" 
            });
        }

        const { studentId } = req.params;

        // Auto-determine which student ID to use
        let targetStudentId: string;

        if (req.user.role === 'student') {
            targetStudentId = req.user.userId;
            
            if (studentId && studentId !== req.user.userId) {
                return res.status(403).json({ 
                    success: false,
                    message: "Access denied. You can only view your own enrollments." 
                });
            }
        } else if (req.user.role === 'admin' || req.user.role === 'teacher') {
            targetStudentId = studentId || req.user.userId;
        } else {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Invalid user role." 
            });
        }

        const enrollments = await enrollmentRepo.findByStudentId(targetStudentId);

        return res.status(200).json({ 
            success: true,
            message: "Enrollments fetched successfully",
            enrollments: enrollments
        });
        
    } catch (err: any) {
        console.error("Get enrollments error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Get Course Enrollments
export const getCourseEnrollmentsController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !['admin', 'teacher'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only admin and teachers can view course enrollments." 
            });
        }

        const { courseId } = req.params;

        const enrollments = await enrollmentRepo.findByCourseId(courseId);

        return res.status(200).json({ 
            success: true,
            message: "Course enrollments fetched successfully",
            enrollments: enrollments
        });
        
    } catch (err: any) {
        console.error("Get course enrollments error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Assign Student to Batch
export const assignStudentToBatchController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !['admin', 'teacher'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only admin and teachers can assign students to batches." 
            });
        }

        const schema = Joi.object({
            enrollmentId: Joi.string().required(),
            batchId: Joi.string().required()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const { enrollmentId, batchId } = value;

        const enrollment = await enrollmentRepo.assignToBatch(enrollmentId, batchId);
        if (!enrollment) {
            return res.status(404).json({ 
                success: false,
                message: "Enrollment not found" 
            });
        }

        return res.status(200).json({ 
            success: true,
            message: "Student assigned to batch successfully",
            enrollment: {
                id: enrollment._id,
                studentId: enrollment.studentId,
                courseId: enrollment.courseId,
                batchId: enrollment.batchId,
                status: enrollment.status
            }
        });
        
    } catch (err: any) {
        console.error("Assign to batch error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Get My Enrollments
export const getMyEnrollmentsController = async (req: AuthRequest, res: Response) => {
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

        const enrollments = await enrollmentRepo.findByStudentId(req.user.userId);

        return res.status(200).json({ 
            success: true,
            message: "Your enrollments fetched successfully",
            enrollments: enrollments
        });
        
    } catch (err: any) {
        console.error("Get my enrollments error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};