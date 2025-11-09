import { Document, ObjectId } from "mongoose";

export interface IAttendance extends Document {
    _id: ObjectId;
    batchId: ObjectId;
    date: Date;
    presentStudents: ObjectId[];
    absentStudents: ObjectId[];
    totalStudents: number;
    recordedBy: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAttendanceDocument extends IAttendance {}