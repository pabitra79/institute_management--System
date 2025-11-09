import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../helper/jwt.helper';

// Define proper user roles type as union of string literals
export type UserRole = 'student' | 'teacher' | 'admin';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: UserRole;
    };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'No token provided, access denied'
            });
            return;
        }

        const decoded = verifyToken(token) as { userId: string; email: string; role: string };
        
        // Validate the role before assigning
        const validRoles: UserRole[] = ['student', 'teacher', 'admin'];
        const userRole: UserRole = validRoles.includes(decoded.role as UserRole) 
            ? decoded.role as UserRole 
            : 'student'; // default to student if invalid

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: userRole
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Token is invalid'
        });
    }
};