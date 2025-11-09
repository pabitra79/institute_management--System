import { Document, ObjectId } from 'mongoose';

export interface IRole extends Document {
    _id: ObjectId;
    name: 'student' | 'teacher' | 'admin';
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
}