import { Document, ObjectId } from "mongoose";

export interface IEnrollment extends Document {
    _id: ObjectId;
    studentId: ObjectId;
    courseId: ObjectId;
    batchId?: ObjectId;
    enrollmentDate: Date;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

export interface IEnrollmentDocument extends IEnrollment {}