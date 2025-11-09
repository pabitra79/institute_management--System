import { Request, Response } from "express";
import { UserRepository } from "../repository/profile.user.repo";
import { AuthRequest } from "../middleware/auth.middleware";

const userRepo = new UserRepository();

export const getUserProfileController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const userProfile = await userRepo.getUserById(req.user.userId);
        
        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            user: userProfile
        });

    } catch (err: any) {
        console.error("Get user profile error:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const updateUserProfileController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const { name, phone, address } = req.body;
        
        const updatedUser = await userRepo.updateUserProfile(req.user.userId, {
            name,
            phone,
            address
        });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (err: any) {
        console.error("Update profile error:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const changePasswordController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const { currentPassword, newPassword } = req.body;
        
        const result = await userRepo.changePassword(
            req.user.userId, 
            currentPassword, 
            newPassword
        );

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (err: any) {
        console.error("Change password error:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const uploadAvatarController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        
        const updatedUser = await userRepo.updateUserAvatar(req.user.userId, avatarUrl);

        return res.status(200).json({
            success: true,
            message: "Avatar uploaded successfully",
            avatarUrl: avatarUrl,
            user: updatedUser
        });

    } catch (err: any) {
        console.error("Upload avatar error:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};