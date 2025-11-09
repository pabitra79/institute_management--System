import { Router } from 'express';
import { 
    markAttendanceController, 
    getBatchAttendanceController, 
    getStudentAttendanceController, 
    getBatchAttendanceStatsController 
} from '../controller/attendance.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const Attendancerouter = Router();

/**
 * @swagger
 * /api/attendance/mark:
 *   post:
 *     summary: Mark attendance (Teacher only)
 *     description: Mark attendance for a batch on a specific date
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: attendance
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - batchId
 *             - date
 *             - presentStudents
 *             - absentStudents
 *           properties:
 *             batchId:
 *               type: string
 *               example: "507f1f77bcf86cd799439011"
 *             date:
 *               type: string
 *               format: date
 *               example: "2024-01-15"
 *             presentStudents:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
 *             absentStudents:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["507f1f77bcf86cd799439014"]
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Attendance marked successfully"
 *             attendance:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 batchId:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 presentCount:
 *                   type: number
 *                   example: 2
 *                 absentCount:
 *                   type: number
 *                   example: 1
 *                 totalStudents:
 *                   type: number
 *                   example: 3
 *                 recordedBy:
 *                   type: string
 *       400:
 *         description: Bad request (attendance already marked, validation error)
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (user is not teacher or not assigned to batch)
 *       404:
 *         description: Batch not found
 *       500:
 *         description: Internal server error
 */
Attendancerouter.post('/attendance/mark', authMiddleware, markAttendanceController);

/**
 * @swagger
 * /api/attendance/batch/{batchId}:
 *   get:
 *     summary: Get batch attendance records
 *     description: Retrieve all attendance records for a specific batch
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: batchId
 *         required: true
 *         type: string
 *         description: ID of the batch
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Batch attendance records retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Attendance records fetched successfully"
 *             attendance:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   presentStudents:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                   absentStudents:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                   totalStudents:
 *                     type: number
 *                   recordedBy:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized (no token provided)
 *       500:
 *         description: Internal server error
 */
Attendancerouter.get('/attendance/batch/:batchId', authMiddleware, getBatchAttendanceController);

/**
 * @swagger
 * /api/attendance/student:
 *   get:
 *     summary: Get student attendance
 *     description: Retrieve attendance records for a specific student, optionally filtered by batch
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         required: true
 *         type: string
 *         description: ID of the student
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: batchId
 *         type: string
 *         description: ID of the batch to filter by (optional)
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Student attendance retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Student attendance fetched successfully"
 *             attendance:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   batch:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       courseId:
 *                         type: string
 *                   status:
 *                     type: string
 *                     enum: [present, absent]
 *                   recordedBy:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *             summary:
 *               type: object
 *               properties:
 *                 totalClasses:
 *                   type: number
 *                   example: 20
 *                 presentClasses:
 *                   type: number
 *                   example: 18
 *                 absentClasses:
 *                   type: number
 *                   example: 2
 *                 attendancePercentage:
 *                   type: number
 *                   example: 90.0
 *       400:
 *         description: Bad request (missing studentId)
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (student trying to view another student's attendance)
 *       500:
 *         description: Internal server error
 */
Attendancerouter.get('/attendance/student', authMiddleware, getStudentAttendanceController);

/**
 * @swagger
 * /api/attendance/stats/{batchId}:
 *   get:
 *     summary: Get batch attendance statistics (Admin/Teacher only)
 *     description: Retrieve detailed attendance statistics for a specific batch
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: batchId
 *         required: true
 *         type: string
 *         description: ID of the batch
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Attendance statistics retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Attendance statistics fetched successfully"
 *             statistics:
 *               type: object
 *               properties:
 *                 totalClasses:
 *                   type: number
 *                   example: 25
 *                 averageAttendance:
 *                   type: number
 *                   example: 85.5
 *                 studentStats:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       present:
 *                         type: number
 *                         example: 20
 *                       total:
 *                         type: number
 *                         example: 25
 *                       percentage:
 *                         type: number
 *                         example: 80.0
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (user is not admin or teacher)
 *       500:
 *         description: Internal server error
 */
Attendancerouter.get('/attendance/stats/:batchId', authMiddleware, getBatchAttendanceStatsController);

export { Attendancerouter };