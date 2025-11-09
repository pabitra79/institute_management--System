import { AttendanceModel } from "../models/attendance.model";
import { IAttendanceDocument } from "../interface/attendance.interface";

export class AttendanceRepository {
    async createAttendance(attendanceData: {
        batchId: string;
        date: Date;
        presentStudents: string[];
        absentStudents: string[];
        totalStudents: number;
        recordedBy: string;
    }): Promise<IAttendanceDocument> {
        const attendance = new AttendanceModel(attendanceData);
        return await attendance.save();
    }

    async findByBatchAndDate(batchId: string, date: Date): Promise<IAttendanceDocument | null> {
        return await AttendanceModel.findOne({ batchId, date });
    }

    async findByBatchId(batchId: string): Promise<IAttendanceDocument[]> {
        return await AttendanceModel.find({ batchId })
            .populate('presentStudents', 'name email')
            .populate('absentStudents', 'name email')
            .populate('recordedBy', 'name email')
            .sort({ date: -1 });
    }

    async findByStudentId(studentId: string, batchId?: string): Promise<IAttendanceDocument[]> {
        const query: any = {
            $or: [
                { presentStudents: studentId },
                { absentStudents: studentId }
            ]
        };

        if (batchId) {
            query.batchId = batchId;
        }

        return await AttendanceModel.find(query)
            .populate('batchId', 'name courseId')
            .sort({ date: -1 });
    }

    async getAttendanceStats(batchId: string): Promise<any> {
        const attendanceRecords = await AttendanceModel.find({ batchId });
        
        if (attendanceRecords.length === 0) {
            return { totalClasses: 0, averageAttendance: 0 };
        }

        const studentStats: { [key: string]: { present: number, total: number } } = {};

        attendanceRecords.forEach(record => {
            // Count presents
            record.presentStudents.forEach(studentId => {
                const studentIdStr = studentId.toString();
                if (!studentStats[studentIdStr]) {
                    studentStats[studentIdStr] = { present: 0, total: 0 };
                }
                studentStats[studentIdStr].present += 1;
                studentStats[studentIdStr].total += 1;
            });

            // Count absents
            record.absentStudents.forEach(studentId => {
                const studentIdStr = studentId.toString();
                if (!studentStats[studentIdStr]) {
                    studentStats[studentIdStr] = { present: 0, total: 0 };
                }
                studentStats[studentIdStr].total += 1;
            });
        });

        return {
            totalClasses: attendanceRecords.length,
            studentStats
        };
    }
}