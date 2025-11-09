import { Document, ObjectId } from "mongoose";

export interface IUser extends Document {
    _id: ObjectId;
    name: string;
    email: string;
    password: string;
    role: 'student' | 'teacher' | 'admin';
    profilePicture: string;
    contactInfo: string;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    createdBy?: ObjectId; // Add this field
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserDocument extends IUser {}