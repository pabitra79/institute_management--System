import { Document, ObjectId } from "mongoose";

export interface IExam extends Document {
    _id: ObjectId;
    name: string;
    batchId: ObjectId;
    date: Date;
    duration: number; // in minutes
    totalMarks: number;
    subject?: string;
    description?: string;
    createdBy: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IExamDocument extends IExam {}