import { Request, Response } from "express";
import Joi from 'joi';
import { CourseRepository } from "../repository/course.repo";
import { AuthRequest } from "../middleware/auth.middleware";

const courseRepo = new CourseRepository();

// Add Course (Admin Only)
export const createCourseController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only admin can create courses." 
            });
        }

        const schema = Joi.object({
            name: Joi.string().min(2).max(100).required(),
            description: Joi.string().min(10).required(),
            duration: Joi.number().min(1).max(36).required(), // 1-36 months
            fees: Joi.number().min(0).required()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const { name, description, duration, fees } = value;

        const course = await courseRepo.createCourse({
            name,
            description,
            duration,
            fees,
            createdBy: req.user.userId
        });

        return res.status(201).json({ 
            success: true,
            message: "Course created successfully", 
            course: {
                id: course._id,
                name: course.name,
                description: course.description,
                duration: course.duration,
                fees: course.fees,
                isActive: course.isActive,
                createdBy: req.user.userId
            }
        });
        
    } catch (err: any) {
        console.error("Create course error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Get All Courses
export const getAllCoursesController = async (req: Request, res: Response) => {
    try {
        const courses = await courseRepo.findAll();

        const coursesResponse = courses.map(course => ({
            id: course._id,
            name: course.name,
            description: course.description,
            duration: course.duration,
            fees: course.fees,
            isActive: course.isActive,
            createdBy: course.createdBy,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt
        }));

        return res.status(200).json({ 
            success: true,
            message: "Courses fetched successfully",
            courses: coursesResponse
        });
        
    } catch (err: any) {
        console.error("Get courses error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Update Course (Admin Only)
export const updateCourseController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only admin can update courses." 
            });
        }

        const schema = Joi.object({
            name: Joi.string().min(2).max(100),
            description: Joi.string().min(10),
            duration: Joi.number().min(1).max(36),
            fees: Joi.number().min(0)
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const { courseId } = req.params;

        const course = await courseRepo.updateCourse(courseId, value);
        if (!course) {
            return res.status(404).json({ 
                success: false,
                message: "Course not found" 
            });
        }

        return res.status(200).json({ 
            success: true,
            message: "Course updated successfully", 
            course: {
                id: course._id,
                name: course.name,
                description: course.description,
                duration: course.duration,
                fees: course.fees,
                isActive: course.isActive
            }
        });
        
    } catch (err: any) {
        console.error("Update course error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Delete Course (Admin Only - Soft Delete)
export const deleteCourseController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only admin can delete courses." 
            });
        }

        const { courseId } = req.params;

        const course = await courseRepo.deleteCourse(courseId);
        if (!course) {
            return res.status(404).json({ 
                success: false,
                message: "Course not found" 
            });
        }

        return res.status(200).json({ 
            success: true,
            message: "Course deleted successfully"
        });
        
    } catch (err: any) {
        console.error("Delete course error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};