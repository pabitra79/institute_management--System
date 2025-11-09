import { Request, Response } from "express";
import Joi from 'joi';
import { UserRepository } from "../repository/user.repo";
import { hashPassword, comparePassword } from "../helper/password.helper";
import { generateToken } from "../helper/jwt.helper"; 

const userRepo = new UserRepository();

// Signup Controller
export const SignupController = async (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            name: Joi.string().min(2).max(50).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
            role: Joi.string().valid('student', 'teacher', 'admin').default('student'),
            contactInfo: Joi.string().min(10).required(),
            profilePicture: Joi.string().optional()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { name, email, password, role, contactInfo, profilePicture } = value;

        const existingUser = await userRepo.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashed = await hashPassword(password);
        const user = await userRepo.createUser({
            name,
            email,
            contactInfo,
            password: hashed,
            role: role || "student",
            profilePicture: profilePicture || "default-avatar.png"
        });

        console.log("User created successfully:", user.email);
        
        return res.status(201).json({ 
            success: true,
            message: "Signup successful", 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (err: any) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Login Controller
export const LoginController = async (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { email, password } = value;

        // Find user
        const user = await userRepo.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Check password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT token using your existing helper
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role
        });

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err: any) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
