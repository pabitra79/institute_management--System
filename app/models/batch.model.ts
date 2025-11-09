import { Schema, model } from "mongoose";
import { IBatchDocument } from "../interface/batch.interface";

const batchSchema = new Schema<IBatchDocument>({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    courseId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Course',
        required: true
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    endDate: { 
        type: Date, 
        required: true 
    },
    teacherId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    students: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    maxStudents: { 
        type: Number, 
        default: 30,
        min: 1
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

export const BatchModel = model<IBatchDocument>('Batch', batchSchema);