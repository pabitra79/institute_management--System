import { Document, ObjectId } from 'mongoose';

export interface ICourse extends Document {
    _id: ObjectId;
    name: string;
    description: string;
    duration: number; 
    fees: number;
    createdBy: ObjectId;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICourseDocument extends ICourse {}