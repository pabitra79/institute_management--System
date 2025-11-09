import { ExamModel } from "../models/exam.model";
import { IExamDocument } from "../interface/exam.interface";
import { Types } from "mongoose";

export class ExamRepository {
    async createExam(examData: {
        name: string;
        batchId: string;
        date: Date;
        duration: number;
        totalMarks: number;
        subject?: string;
        description?: string;
        createdBy: string;
    }): Promise<IExamDocument> {
        const exam = new ExamModel(examData);
        const savedExam = await exam.save();
        return savedExam.toObject() as IExamDocument;
    }

    async findById(examId: string): Promise<any | null> {
        const results = await ExamModel.aggregate([
            { $match: { _id: new Types.ObjectId(examId) } },
            {
                $lookup: {
                    from: 'batches',
                    localField: 'batchId',
                    foreignField: '_id',
                    as: 'batch'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdByUser'
                }
            },
            { $unwind: '$batch' },
            { $unwind: '$createdByUser' },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    date: 1,
                    duration: 1,
                    totalMarks: 1,
                    subject: 1,
                    description: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    'batch._id': 1,
                    'batch.name': 1,
                    'batch.courseId': 1,
                    'createdByUser._id': 1,
                    'createdByUser.name': 1,
                    'createdByUser.email': 1
                }
            }
        ]);

        return results.length > 0 ? results[0] : null;
    }

    async findByBatchId(batchId: string): Promise<any[]> {
        return await ExamModel.aggregate([
            { $match: { batchId: new Types.ObjectId(batchId) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdByUser'
                }
            },
            { $unwind: '$createdByUser' },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    date: 1,
                    duration: 1,
                    totalMarks: 1,
                    subject: 1,
                    description: 1,
                    createdAt: 1,
                    'createdByUser._id': 1,
                    'createdByUser.name': 1,
                    'createdByUser.email': 1
                }
            },
            { $sort: { date: -1 } }
        ]);
    }

    async updateExam(examId: string, updateData: {
        name?: string;
        date?: Date;
        duration?: number;
        totalMarks?: number;
        subject?: string;
        description?: string;
    }): Promise<IExamDocument | null> {
        const exam = await ExamModel.findByIdAndUpdate(
            examId,
            updateData,
            { new: true, runValidators: true }
        );
        
        return exam ? exam.toObject() as IExamDocument : null;
    }

    async deleteExam(examId: string): Promise<IExamDocument | null> {
        const exam = await ExamModel.findByIdAndDelete(examId);
        return exam ? exam.toObject() as IExamDocument : null;
    }

    // Get raw exam document without aggregation
    async findRawById(examId: string): Promise<IExamDocument | null> {
        const exam = await ExamModel.findById(examId);
        return exam ? exam.toObject() as IExamDocument : null;
    }

    // Get exams with batch and course details
    async getExamsWithFullDetails(batchId?: string): Promise<any[]> {
        const matchStage: any = {};
        if (batchId) {
            matchStage.batchId = new Types.ObjectId(batchId);
        }

        return await ExamModel.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'batches',
                    localField: 'batchId',
                    foreignField: '_id',
                    as: 'batch'
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'batch.courseId',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdByUser'
                }
            },
            { $unwind: '$batch' },
            { $unwind: '$course' },
            { $unwind: '$createdByUser' },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    date: 1,
                    duration: 1,
                    totalMarks: 1,
                    subject: 1,
                    description: 1,
                    createdAt: 1,
                    'batch._id': 1,
                    'batch.name': 1,
                    'course._id': 1,
                    'course.name': 1,
                    'createdByUser.name': 1,
                    'createdByUser.email': 1
                }
            },
            { $sort: { date: -1 } }
        ]);
    }

    // Get exam statistics
    async getExamStatistics(examId: string): Promise<any> {
        const results = await ExamModel.aggregate([
            { $match: { _id: new Types.ObjectId(examId) } },
            {
                $lookup: {
                    from: 'examresults',
                    localField: '_id',
                    foreignField: 'examId',
                    as: 'results'
                }
            },
            {
                $project: {
                    name: 1,
                    totalMarks: 1,
                    totalStudents: { $size: '$results' },
                    averageMarks: { $avg: '$results.marksObtained' },
                    highestMarks: { $max: '$results.marksObtained' },
                    lowestMarks: { $min: '$results.marksObtained' }
                }
            }
        ]);

        return results.length > 0 ? results[0] : {
            totalStudents: 0,
            averageMarks: 0,
            highestMarks: 0,
            lowestMarks: 0
        };
    }

    // Get exams by course ID
    async findByCourseId(courseId: string): Promise<any[]> {
        return await ExamModel.aggregate([
            {
                $lookup: {
                    from: 'batches',
                    localField: 'batchId',
                    foreignField: '_id',
                    as: 'batch'
                }
            },
            { $unwind: '$batch' },
            { $match: { 'batch.courseId': new Types.ObjectId(courseId) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdByUser'
                }
            },
            { $unwind: '$createdByUser' },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    date: 1,
                    duration: 1,
                    totalMarks: 1,
                    subject: 1,
                    description: 1,
                    'batch._id': 1,
                    'batch.name': 1,
                    'createdByUser.name': 1,
                    'createdByUser.email': 1
                }
            },
            { $sort: { date: -1 } }
        ]);
    }
}