import { ObjectId } from "mongoose";

export interface IExamResult {
    _id: ObjectId;
    examId: ObjectId;
    studentId: ObjectId;
    marksObtained: number;
    grade?: string;
    remarks?: string;
    submittedBy: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// No Document extension - keep it simple
export type IExamResultDocument = IExamResult;