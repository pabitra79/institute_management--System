import { BatchModel } from "../models/batch.model";
import { IBatchDocument } from "../interface/batch.interface";

export class BatchRepository {
    async createBatch(batchData: {
        name: string;
        courseId: string;
        startDate: Date;
        endDate: Date;
        teacherId: string;
        maxStudents?: number;
        createdBy: string;
    }): Promise<IBatchDocument> {
        const batch = new BatchModel(batchData);
        return await batch.save();
    }

    async findById(batchId: string): Promise<IBatchDocument | null> {
        return await BatchModel.findById(batchId)
            .populate('courseId', 'name duration fees')
            .populate('teacherId', 'name email')
            .populate('students', 'name email');
    }

    async findByCourseId(courseId: string): Promise<IBatchDocument[]> {
        return await BatchModel.find({ courseId, isActive: true })
            .populate('teacherId', 'name email')
            .populate('students', 'name email')
            .sort({ createdAt: -1 });
    }

    async findAll(): Promise<IBatchDocument[]> {
        return await BatchModel.find({ isActive: true })
            .populate('courseId', 'name duration')
            .populate('teacherId', 'name email')
            .populate('students', 'name email')
            .sort({ createdAt: -1 });
    }

    async updateBatch(batchId: string, updateData: {
        name?: string;
        startDate?: Date;
        endDate?: Date;
        teacherId?: string;
        maxStudents?: number;
    }): Promise<IBatchDocument | null> {
        return await BatchModel.findByIdAndUpdate(
            batchId,
            updateData,
            { new: true, runValidators: true }
        ).populate('teacherId', 'name email');
    }

    async deleteBatch(batchId: string): Promise<IBatchDocument | null> {
        return await BatchModel.findByIdAndUpdate(
            batchId,
            { isActive: false },
            { new: true }
        );
    }

    async assignStudentToBatch(batchId: string, studentId: string): Promise<IBatchDocument | null> {
        return await BatchModel.findByIdAndUpdate(
            batchId,
            { $addToSet: { students: studentId } },
            { new: true }
        );
    }

    async removeStudentFromBatch(batchId: string, studentId: string): Promise<IBatchDocument | null> {
        return await BatchModel.findByIdAndUpdate(
            batchId,
            { $pull: { students: studentId } },
            { new: true }
        );
    }

    async getBatchWithStats(batchId: string): Promise<any> {
        const batch = await BatchModel.findById(batchId)
            .populate('courseId', 'name description')
            .populate('teacherId', 'name email contactInfo')
            .populate('students', 'name email contactInfo');

        if (!batch) return null;

        return {
            ...batch.toObject(),
            totalStudents: batch.students.length,
            availableSlots: batch.maxStudents - batch.students.length
        };
    }
}