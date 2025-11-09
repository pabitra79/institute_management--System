import { Schema, model } from "mongoose";
import { ICourseDocument } from "../interface/course.interface";

const courseSchema = new Schema<ICourseDocument>({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String, 
        required: true 
    },
    duration: { 
        type: Number, 
        required: true,
        min: 1 // in months
    },
    fees: { 
        type: Number, 
        required: true,
        min: 0
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    createdBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export const CourseModel = model<ICourseDocument>('Course', courseSchema);