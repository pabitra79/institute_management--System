import { Schema, model } from "mongoose";
import { IAttendanceDocument } from "../interface/attendance.interface";

const attendanceSchema = new Schema<IAttendanceDocument>({
    batchId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Batch',
        required: true
    },
    date: { 
        type: Date, 
        required: true 
    },
    presentStudents: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    absentStudents: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    totalStudents: { 
        type: Number, 
        required: true 
    },
    recordedBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate attendance for same batch and date
attendanceSchema.index({ batchId: 1, date: 1 }, { unique: true });

export const AttendanceModel = model<IAttendanceDocument>('Attendance', attendanceSchema);