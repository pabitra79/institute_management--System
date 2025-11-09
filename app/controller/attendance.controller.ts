import { Request, Response } from "express";
import Joi from 'joi';
import { AttendanceRepository } from "../repository/attendance.repo";
import { BatchRepository } from "../repository/batch.repo";
import { AuthRequest, UserRole } from "../middleware/auth.middleware";

const attendanceRepo = new AttendanceRepository();
const batchRepo = new BatchRepository();

// Mark Attendance (Teacher)
export const markAttendanceController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required" 
            });
        }

        // Use type-safe role checking
        if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ 
        success: false,
        message: "Access denied. Only teachers can mark attendance." 
    });
}


        const schema = Joi.object({
            batchId: Joi.string().required(),
            date: Joi.date().iso().required(),
            presentStudents: Joi.array().items(Joi.string()).required(),
            absentStudents: Joi.array().items(Joi.string()).required()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const { batchId, date, presentStudents, absentStudents } = value;

        // Check if batch exists and teacher has access
        const batch = await batchRepo.findById(batchId);
        if (!batch) {
            return res.status(404).json({ 
                success: false,
                message: "Batch not found" 
            });
        }

        // Use proper type-safe comparisons
        const isTeacherAssigned = batch.teacherId.toString() === req.user.userId;
    const userIsAdmin = req.user.role === 'admin'; 

if (!isTeacherAssigned && !userIsAdmin) {
    return res.status(403).json({ 
        success: false,
        message: "Access denied. You are not assigned to this batch." 
    });

        }

        // Check if attendance already marked for this date
        const existingAttendance = await attendanceRepo.findByBatchAndDate(batchId, new Date(date));
        if (existingAttendance) {
            return res.status(400).json({ 
                success: false,
                message: "Attendance already marked for this date" 
            });
        }

        const totalStudents = presentStudents.length + absentStudents.length;

        const attendance = await attendanceRepo.createAttendance({
            batchId,
            date: new Date(date),
            presentStudents,
            absentStudents,
            totalStudents,
            recordedBy: req.user.userId
        });

        return res.status(201).json({ 
            success: true,
            message: "Attendance marked successfully", 
            attendance: {
                id: attendance._id,
                batchId: attendance.batchId,
                date: attendance.date,
                presentCount: attendance.presentStudents.length,
                absentCount: attendance.absentStudents.length,
                totalStudents: attendance.totalStudents,
                recordedBy: attendance.recordedBy
            }
        });
        
    } catch (err: any) {
        console.error("Mark attendance error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// View Attendance by Batch
export const getBatchAttendanceController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required" 
            });
        }

        const { batchId } = req.params;

        const attendanceRecords = await attendanceRepo.findByBatchId(batchId);

        const attendanceResponse = attendanceRecords.map(record => ({
            id: record._id,
            date: record.date,
            presentStudents: record.presentStudents,
            absentStudents: record.absentStudents,
            totalStudents: record.totalStudents,
            recordedBy: record.recordedBy,
            createdAt: record.createdAt
        }));

        return res.status(200).json({ 
            success: true,
            message: "Attendance records fetched successfully",
            attendance: attendanceResponse
        });
        
    } catch (err: any) {
        console.error("Get batch attendance error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// View Student Attendance
export const getStudentAttendanceController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required" 
            });
        }

        const { studentId, batchId } = req.query;

        //  Add proper type checking for query parameters
        if (!studentId || typeof studentId !== 'string') {
            return res.status(400).json({ 
                success: false,
                message: "Student ID is required" 
            });
        }

        // Students can only view their own attendance
        if (req.user.role === 'student' && req.user.userId !== studentId) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You can only view your own attendance." 
            });
        }

        const attendanceRecords = await attendanceRepo.findByStudentId(
            studentId, 
            batchId as string
        );

        // Calculate attendance percentage
        let totalClasses = 0;
        let presentClasses = 0;

        const attendanceResponse = attendanceRecords.map(record => {
            totalClasses++;
            const isPresent = record.presentStudents.some(
                (student: any) => student._id.toString() === studentId
            );
            if (isPresent) presentClasses++;

            return {
                id: record._id,
                date: record.date,
                batch: record.batchId,
                status: isPresent ? 'present' : 'absent',
                recordedBy: record.recordedBy
            };
        });

        const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

        return res.status(200).json({ 
            success: true,
            message: "Student attendance fetched successfully",
            attendance: attendanceResponse,
            summary: {
                totalClasses,
                presentClasses,
                absentClasses: totalClasses - presentClasses,
                attendancePercentage: Math.round(attendancePercentage * 100) / 100
            }
        });
        
    } catch (err: any) {
        console.error("Get student attendance error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

// Get Batch Attendance Statistics
export const getBatchAttendanceStatsController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required" 
            });
        }

        //  Use proper type checking for role validation
        const allowedRoles: UserRole[] = ['admin', 'teacher'];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only admin and teachers can view attendance statistics." 
            });
        }

        const { batchId } = req.params;

        const stats = await attendanceRepo.getAttendanceStats(batchId);

        return res.status(200).json({ 
            success: true,
            message: "Attendance statistics fetched successfully",
            statistics: stats
        });
        
    } catch (err: any) {
        console.error("Get attendance stats error:", err);
        res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};