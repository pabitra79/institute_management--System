import { UserModel } from "../models/user.model";
import { IUser, IUserDocument } from "../interface/user.interface";

export class UserRepository {
    updateUserAvatar(userId: string, avatarUrl: string) {
        throw new Error("Method not implemented.");
    }
    async createUser(userData: {
        name: string;
        email: string;
        password: string;
        role: string; // Change to string
        contactInfo: string;
        profilePicture?: string;
        isEmailVerified?: boolean; 
        emailVerificationToken?: string; 
        emailVerificationExpires?: Date; 
    }): Promise<IUserDocument> {
        const user = new UserModel({
            ...userData,
            profilePicture: userData.profilePicture || "default-avatar.png",
            isEmailVerified: false
        });
        
        return await user.save();
    }

    async findByEmail(email: string): Promise<IUserDocument | null> {
        return await UserModel.findOne({ email });
    }
    async findById(id: string): Promise<IUserDocument | null> {
        return await UserModel.findById(id);
    }
    async createTeacher(teacherData: {
        name: string;
        email: string;
        password: string;
        contactInfo: string;
        profilePicture?: string;
        createdBy: string; // Admin ID who created this teacher
    }): Promise<IUserDocument> {
        const teacher = new UserModel({
            ...teacherData,
            role: 'teacher',
            profilePicture: teacherData.profilePicture || "default-avatar.png",
            isEmailVerified: true // Auto-verify teachers created by admin
        });
        
        return await teacher.save();
    }

    async getAllTeachers(): Promise<IUserDocument[]> {
        return await UserModel.find({ role: 'teacher' }).select('-password');
    }

    async getUserById(userId: string): Promise<IUserDocument | null> {
        return await UserModel.findById(userId).select('-password');
    }

    async updateUserProfile(userId: string, updateData: {
        name?: string;
        contactInfo?: string;
        profilePicture?: string;
    }): Promise<IUserDocument | null> {
        return await UserModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password');
    }
    async verifyUserEmail(userId: string) {
        try {
            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                { 
                    $set: { 
                        isEmailVerified: true,
                        emailVerificationToken: null,
                        emailVerificationExpires: null
                    } 
                },
                { new: true }
            ).select("-password");
// for email verify
            if (!updatedUser) {
                throw new Error("User not found during email verification");
            }


            return updatedUser;
        } catch (error) {
            console.error("Verify user email error:", error);
            throw error;
        }
    }

}
