import { Request, Response } from "express";
import Joi from 'joi';
import { UserRepository } from "../repository/user.repo";
import { hashPassword } from "../helper/password.helper";
import { AuthRequest } from "../middleware/auth.middleware";

const userRepo = new UserRepository();

// Admin creates teacher
export const createTeacherController = async (req: AuthRequest, res: Response) => {
    try {
        // Check if user is authenticated and is admin
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required" 
            });
        }

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only admin can create teachers." 
            });
        }

        const schema = Joi.object({
            name: Joi.string().min(2).max(50).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
            contactInfo: Joi.string().min(10).required(),
            profilePicture: Joi.string().optional()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const { name, email, password, contactInfo, profilePicture } = value;

        // Check if email already exists
        const existingUser = await userRepo.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: "Email already registered" 
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create teacher with admin ID
        const teacher = await userRepo.createTeacher({
            name,
            email,
            password: hashedPassword,
            contactInfo,
            profilePicture,
            createdBy: req.user.userId // Admin ID from token
        });

        console.log("Teacher created by admin:", req.user.email, "Teacher:", teacher.email);

        return res.status(201).json({ 
            success: true,
            message: "Teacher created successfully", 
            teacher: {
                id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                role: teacher.role,
                contactInfo: teacher.contactInfo,
                profilePicture: teacher.profilePicture,
                createdBy: req.user.userId
            }
        });
        
    } catch (err: any) {
        console.error("Create teacher error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Get all teachers (Admin only)
export const getAllTeachersController = async (req: AuthRequest, res: Response) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required" 
            });
        }

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only admin can view all teachers." 
            });
        }

        const teachers = await userRepo.getAllTeachers();

        const teachersResponse = teachers.map(teacher => ({
            id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            contactInfo: teacher.contactInfo,
            profilePicture: teacher.profilePicture,
            isEmailVerified: teacher.isEmailVerified,
            createdBy: teacher.createdBy,
            createdAt: teacher.createdAt
        }));

        return res.status(200).json({ 
            success: true,
            message: "Teachers fetched successfully",
            teachers: teachersResponse
        });
        
    } catch (err: any) {
        console.error("Get teachers error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Get teacher by ID (Admin only)
export const getTeacherByIdController = async (req: AuthRequest, res: Response) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required" 
            });
        }

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only admin can view teacher details." 
            });
        }

        const { teacherId } = req.params;

        const teacher = await userRepo.getUserById(teacherId);
        if (!teacher) {
            return res.status(404).json({ 
                success: false,
                message: "Teacher not found" 
            });
        }

        if (teacher.role !== 'teacher') {
            return res.status(400).json({ 
                success: false,
                message: "User is not a teacher" 
            });
        }

        const teacherResponse = {
            id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            role: teacher.role,
            contactInfo: teacher.contactInfo,
            profilePicture: teacher.profilePicture,
            isEmailVerified: teacher.isEmailVerified,
            createdBy: teacher.createdBy,
            createdAt: teacher.createdAt,
            updatedAt: teacher.updatedAt
        };

        return res.status(200).json({ 
            success: true,
            message: "Teacher details fetched successfully",
            teacher: teacherResponse
        });
        
    } catch (err: any) {
        console.error("Get teacher by ID error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};