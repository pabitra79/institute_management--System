import { Schema, model } from "mongoose";
import { IExamDocument } from "../interface/exam.interface";

const examSchema = new Schema<IExamDocument>({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    batchId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Batch',
        required: true
    },
    date: { 
        type: Date, 
        required: true 
    },
    duration: { 
        type: Number, 
        required: true,
        min: 1
    },
    totalMarks: { 
        type: Number, 
        required: true,
        min: 1
    },
    subject: { 
        type: String 
    },
    description: { 
        type: String 
    },
    createdBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export const ExamModel = model<IExamDocument>('Exam', examSchema);