import { UserModel } from "../models/user.model";
import bcrypt from "bcryptjs";

export class UserRepository {
    
    async getUserById(userId: string) {
        try {
            const user = await UserModel.findById(userId)
                .select("-password -refreshToken") // Exclude sensitive fields
                .lean();
            
            return user;
        } catch (error) {
            console.error("Get user by ID error:", error);
            throw error;
        }
    }

    async updateUserProfile(userId: string, updateData: any) {
        try {
            const allowedFields = ['name', 'phone', 'address'];
            const updateFields: any = {};
            
            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    updateFields[field] = updateData[field];
                }
            });

            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                { $set: updateFields },
                { new: true, runValidators: true }
            ).select("-password -refreshToken");

            return updatedUser;
        } catch (error) {
            console.error("Update user profile error:", error);
            throw error;
        }
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        try {
            const user = await UserModel.findById(userId);
            
            if (!user) {
                return { success: false, message: "User not found" };
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return { success: false, message: "Current password is incorrect" };
            }

            // Hash new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            
            // Update password
            user.password = hashedNewPassword;
            await user.save();

            return { success: true, message: "Password changed successfully" };
        } catch (error) {
            console.error("Change password error:", error);
            throw error;
        }
    }

    async updateUserAvatar(userId: string, avatarUrl: string) {
        try {
            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                { $set: { avatar: avatarUrl } },
                { new: true }
            ).select("-password -refreshToken");

            return updatedUser;
        } catch (error) {
            console.error("Update avatar error:", error);
            throw error;
        }
    }
}