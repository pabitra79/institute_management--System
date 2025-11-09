import { Document, ObjectId } from "mongoose";

export interface IBatch extends Document {
    _id: ObjectId;
    name: string;
    courseId: ObjectId;
    startDate: Date;
    endDate: Date;
    teacherId: ObjectId;
    students: ObjectId[];
    maxStudents: number;
    isActive: boolean;
    createdBy: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBatchDocument extends IBatch {}