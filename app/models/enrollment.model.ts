import { Schema, model } from "mongoose";
import { IEnrollmentDocument } from "../interface/enrollment.interface";

const enrollmentSchema = new Schema<IEnrollmentDocument>({
    studentId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    courseId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Course',
        required: true
    },
    batchId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Batch'
    },
    enrollmentDate: { 
        type: Date, 
        default: Date.now 
    },
    status: { 
        type: String, 
        enum: ['pending', 'active', 'completed', 'cancelled'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const EnrollmentModel = model<IEnrollmentDocument>('Enrollment', enrollmentSchema);