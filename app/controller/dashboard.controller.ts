import { Request, Response } from "express";
import { DashboardRepository } from "../repository/dashboard.repo";
import { AuthRequest } from "../middleware/auth.middleware";

const dashboardRepo = new DashboardRepository();

// Get Student Dashboard
export const getStudentDashboardController = async (req: AuthRequest, res: Response) => {
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

        const dashboard = await dashboardRepo.getStudentDashboard(req.user.userId);

        return res.status(200).json({ 
            success: true,
            message: "Student dashboard fetched successfully",
            dashboard: dashboard
        });
        
    } catch (err: any) {
        console.error("Get student dashboard error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Get Teacher Dashboard
export const getTeacherDashboardController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'teacher') {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. This endpoint is for teachers only." 
            });
        }

        const dashboard = await dashboardRepo.getTeacherDashboard(req.user.userId);

        return res.status(200).json({ 
            success: true,
            message: "Teacher dashboard fetched successfully",
            dashboard: dashboard
        });
        
    } catch (err: any) {
        console.error("Get teacher dashboard error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Get Admin Dashboard
export const getAdminDashboardController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. This endpoint is for admin only." 
            });
        }

        const dashboard = await dashboardRepo.getAdminDashboard(req.user.userId);

        return res.status(200).json({ 
            success: true,
            message: "Admin dashboard fetched successfully",
            dashboard: dashboard
        });
        
    } catch (err: any) {
        console.error("Get admin dashboard error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Get Role-based Dashboard (Universal endpoint)
export const getDashboardController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required" 
            });
        }

        let dashboard;

        switch (req.user.role) {
            case 'student':
                dashboard = await dashboardRepo.getStudentDashboard(req.user.userId);
                break;
            case 'teacher':
                dashboard = await dashboardRepo.getTeacherDashboard(req.user.userId);
                break;
            case 'admin':
                dashboard = await dashboardRepo.getAdminDashboard(req.user.userId);
                break;
            default:
                return res.status(403).json({ 
                    success: false,
                    message: "Access denied. Invalid user role." 
                });
        }

        return res.status(200).json({ 
            success: true,
            message: `${req.user.role} dashboard fetched successfully`,
            dashboard: dashboard
        });
        
    } catch (err: any) {
        console.error("Get dashboard error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};