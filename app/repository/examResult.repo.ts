import { ExamResultModel } from "../models/examResult.model";
import { ExamModel } from "../models/exam.model"; 
import { IExamResultDocument } from "../interface/examResult.interface";
import { Types } from "mongoose";

export class ExamResultRepository {
    
    // Create or update exam result
    async createOrUpdateResult(resultData: {
        examId: string;
        studentId: string;
        marksObtained: number;
        grade?: string;
        remarks?: string;
        submittedBy: string;
    }): Promise<IExamResultDocument> {
        const exam = await ExamModel.findById(resultData.examId);
        if (exam) {
            const percentage = (resultData.marksObtained / exam.totalMarks) * 100;
            resultData.grade = this.calculateGrade(percentage);
        }

        const result = await ExamResultModel.findOneAndUpdate(
            { examId: resultData.examId, studentId: resultData.studentId },
            resultData,
            { new: true, upsert: true, runValidators: true }
        );

        if (!result) {
            throw new Error('Failed to create or update exam result');
        }

        // Convert to plain object to avoid Mongoose document issues
        return result.toObject() as IExamResultDocument;
    }

    // Find by exam ID
    async findByExamId(examId: string): Promise<IExamResultDocument[]> {
        const results = await ExamResultModel.find({ examId: new Types.ObjectId(examId) })
            .sort({ marksObtained: -1 });
        
        return results.map(result => result.toObject() as IExamResultDocument);
    }

    // Find by student ID
    async findByStudentId(studentId: string): Promise<IExamResultDocument[]> {
        const results = await ExamResultModel.find({ studentId: new Types.ObjectId(studentId) })
            .sort({ createdAt: -1 });
        
        return results.map(result => result.toObject() as IExamResultDocument);
    }

    // Find by student and exam
    async findByStudentAndExam(studentId: string, examId: string): Promise<IExamResultDocument | null> {
        const result = await ExamResultModel.findOne({ 
            studentId: new Types.ObjectId(studentId),
            examId: new Types.ObjectId(examId)
        });
        
        return result ? result.toObject() as IExamResultDocument : null;
    }

    // Get exam statistics
    async getExamStatistics(examId: string): Promise<any> {
        const results = await this.findByExamId(examId);
        const exam = await ExamModel.findById(examId);

        if (results.length === 0) {
            return { totalStudents: 0, averageMarks: 0, highestMarks: 0, lowestMarks: 0 };
        }

        const marks = results.map(r => r.marksObtained);
        const totalMarks = marks.reduce((sum, mark) => sum + mark, 0);
        const averageMarks = totalMarks / results.length;
        const highestMarks = Math.max(...marks);
        const lowestMarks = Math.min(...marks);

        return {
            totalStudents: results.length,
            averageMarks: Math.round(averageMarks * 100) / 100,
            highestMarks,
            lowestMarks,
            totalMarks: exam?.totalMarks || 100
        };
    }

    // Find by ID
    async findById(resultId: string): Promise<IExamResultDocument | null> {
        const result = await ExamResultModel.findById(resultId);
        return result ? result.toObject() as IExamResultDocument : null;
    }

    // Create multiple results
    async createMultipleResults(resultsData: {
        examId: string;
        studentId: string;
        marksObtained: number;
        grade?: string;
        remarks?: string;
        submittedBy: string;
    }[]): Promise<IExamResultDocument[]> {
        const exam = await ExamModel.findById(resultsData[0]?.examId);
        const resultsWithGrades = resultsData.map(result => {
            if (exam && !result.grade) {
                const percentage = (result.marksObtained / exam.totalMarks) * 100;
                result.grade = this.calculateGrade(percentage);
            }
            return result;
        });

        const results = await ExamResultModel.insertMany(resultsWithGrades);
        return results.map(result => result.toObject() as IExamResultDocument);
    }

    // Delete result
    async deleteResult(resultId: string): Promise<IExamResultDocument | null> {
        const result = await ExamResultModel.findByIdAndDelete(resultId);
        return result ? result.toObject() as IExamResultDocument : null;
    }

    // Get results with exam details using aggregation
    async getResultsWithExamDetails(examId: string): Promise<any[]> {
        return await ExamResultModel.aggregate([
            { $match: { examId: new Types.ObjectId(examId) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },
            {
                $project: {
                    marksObtained: 1,
                    grade: 1,
                    remarks: 1,
                    createdAt: 1,
                    'student._id': 1,
                    'student.name': 1,
                    'student.email': 1
                }
            },
            { $sort: { marksObtained: -1 } }
        ]);
    }

    // Get student results with exam details using aggregation
    async getStudentResultsWithDetails(studentId: string): Promise<any[]> {
        return await ExamResultModel.aggregate([
            { $match: { studentId: new Types.ObjectId(studentId) } },
            {
                $lookup: {
                    from: 'exams',
                    localField: 'examId',
                    foreignField: '_id',
                    as: 'exam'
                }
            },
            { $unwind: '$exam' },
            {
                $project: {
                    marksObtained: 1,
                    grade: 1,
                    remarks: 1,
                    createdAt: 1,
                    'exam._id': 1,
                    'exam.name': 1,
                    'exam.totalMarks': 1,
                    'exam.date': 1
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
    }

    // Get single result with all details using aggregation
    async getResultWithDetails(resultId: string): Promise<any> {
        const results = await ExamResultModel.aggregate([
            { $match: { _id: new Types.ObjectId(resultId) } },
            {
                $lookup: {
                    from: 'exams',
                    localField: 'examId',
                    foreignField: '_id',
                    as: 'exam'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$exam' },
            { $unwind: '$student' },
            {
                $project: {
                    marksObtained: 1,
                    grade: 1,
                    remarks: 1,
                    createdAt: 1,
                    'exam._id': 1,
                    'exam.name': 1,
                    'exam.totalMarks': 1,
                    'exam.date': 1,
                    'student._id': 1,
                    'student.name': 1,
                    'student.email': 1
                }
            }
        ]);

        return results.length > 0 ? results[0] : null;
    }

    // Private method to calculate grade
    private calculateGrade(percentage: number): string {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        if (percentage >= 40) return 'D';
        return 'F';
    }
}