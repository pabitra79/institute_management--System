import { Schema, model } from "mongoose";
import { IUserDocument } from "../interface/user.interface";

const userSchema = new Schema<IUserDocument>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['student', 'teacher', 'admin'], 
        default: 'student' 
    },
    profilePicture: { type: String, default: "default-avatar.png" },
    contactInfo: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    createdBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    } 
}, {
    timestamps: true
});

export const UserModel = model<IUserDocument>('User', userSchema);