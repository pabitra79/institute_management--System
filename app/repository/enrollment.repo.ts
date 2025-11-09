import { EnrollmentModel } from "../models/enrollment.model";
import { IEnrollmentDocument } from "../interface/enrollment.interface";
import { Types } from "mongoose";

export class EnrollmentRepository {
    async createEnrollment(enrollmentData: {
        studentId: string;
        courseId: string;
        batchId?: string;
    }): Promise<IEnrollmentDocument> {
        const enrollment = new EnrollmentModel(enrollmentData);
        const savedEnrollment = await enrollment.save();
        return savedEnrollment.toObject() as IEnrollmentDocument;
    }

    async findByStudentAndCourse(studentId: string, courseId: string): Promise<IEnrollmentDocument | null> {
        const enrollment = await EnrollmentModel.findOne({ studentId, courseId });
        return enrollment ? enrollment.toObject() as IEnrollmentDocument : null;
    }

    async findByStudentId(studentId: string): Promise<any[]> {
        return await EnrollmentModel.aggregate([
            { $match: { studentId: new Types.ObjectId(studentId) } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            {
                $lookup: {
                    from: 'batches',
                    localField: 'batchId',
                    foreignField: '_id',
                    as: 'batch'
                }
            },
            { $unwind: '$course' },
            { $unwind: { path: '$batch', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    enrollmentDate: 1,
                    status: 1,
                    createdAt: 1,
                    'course._id': 1,
                    'course.name': 1,
                    'course.description': 1,
                    'course.duration': 1,
                    'course.fees': 1,
                    'batch._id': 1,
                    'batch.name': 1,
                    'batch.startDate': 1,
                    'batch.endDate': 1
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
    }

    async findByCourseId(courseId: string): Promise<any[]> {
        return await EnrollmentModel.aggregate([
            { $match: { courseId: new Types.ObjectId(courseId) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            {
                $lookup: {
                    from: 'batches',
                    localField: 'batchId',
                    foreignField: '_id',
                    as: 'batch'
                }
            },
            { $unwind: '$student' },
            { $unwind: { path: '$batch', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    enrollmentDate: 1,
                    status: 1,
                    'student._id': 1,
                    'student.name': 1,
                    'student.email': 1,
                    'student.contactInfo': 1,
                    'batch._id': 1,
                    'batch.name': 1
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
    }

        async updateEnrollmentStatus(enrollmentId: string, status: 'pending' | 'active' | 'completed' | 'cancelled'): Promise<IEnrollmentDocument | null> {
        const enrollment = await EnrollmentModel.findByIdAndUpdate(
            enrollmentId,
            { status },
            { new: true }
        );
        return enrollment ? enrollment.toObject() as IEnrollmentDocument : null;
    }

    async assignToBatch(enrollmentId: string, batchId: string): Promise<IEnrollmentDocument | null> {
        const enrollment = await EnrollmentModel.findByIdAndUpdate(
            enrollmentId,
            { batchId, status: 'active' },
            { new: true }
        );
        return enrollment ? enrollment.toObject() as IEnrollmentDocument : null;
    }

    async getCourseEnrollmentStats(courseId: string): Promise<{ total: number; active: number; completed: number }> {
        const stats = await EnrollmentModel.aggregate([
            { $match: { courseId: new Types.ObjectId(courseId) } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const result = { total: 0, active: 0, completed: 0 };
        stats.forEach(stat => {
            result.total += stat.count;
            if (stat._id === 'active') result.active = stat.count;
            if (stat._id === 'completed') result.completed = stat.count;
        });

        return result;
    }
}
