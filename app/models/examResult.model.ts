import { Schema, model } from "mongoose";
import { IExamResultDocument } from "../interface/examResult.interface";

const examResultSchema = new Schema<IExamResultDocument>({
    examId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Exam',
        required: true
    },
    studentId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    marksObtained: { 
        type: Number, 
        required: true,
        min: 0
    },
    grade: { 
        type: String 
    },
    remarks: { 
        type: String 
    },
    submittedBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate results for same exam and student
examResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

export const ExamResultModel = model<IExamResultDocument>('ExamResult', examResultSchema);