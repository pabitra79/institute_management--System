import { Router } from 'express';
import { 
    getStudentPerformanceController,
    getBatchPerformanceController,
    getCourseEnrollmentReportController,
    getAllCoursesEnrollmentController,
    getMyPerformanceController
} from '../controller/report.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const Reportrouter = Router();

/**
 * @swagger
 * /api/reports/student-performance/{studentId}:
 *   get:
 *     summary: Get student performance report
 *     description: Get comprehensive performance report for a student including attendance and exam results
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         type: string
 *         description: ID of the student
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Student performance report retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Student performance report fetched successfully"
 *             report:
 *               type: object
 *               properties:
 *                 student:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     contactInfo:
 *                       type: string
 *                 attendance:
 *                   type: object
 *                   properties:
 *                     totalClasses:
 *                       type: number
 *                     presentClasses:
 *                       type: number
 *                     absentClasses:
 *                       type: number
 *                     attendancePercentage:
 *                       type: number
 *                 exams:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       examName:
 *                         type: string
 *                       marksObtained:
 *                         type: number
 *                       totalMarks:
 *                         type: number
 *                       percentage:
 *                         type: number
 *                       grade:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                 overallPerformance:
 *                   type: object
 *                   properties:
 *                     totalExams:
 *                       type: number
 *                     averageMarks:
 *                       type: number
 *                     averagePercentage:
 *                       type: number
 *                     totalMarksObtained:
 *                       type: number
 *                     grades:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (student trying to view another student's report)
 *       404:
 *         description: Student not found
 *       500:
 *         description: Internal server error
 */
Reportrouter.get('/reports/student-performance/:studentId', authMiddleware, getStudentPerformanceController);

/**
 * @swagger
 * /api/reports/my-performance:
 *   get:
 *     summary: Get my performance report (Student only)
 *     description: Students can view their own comprehensive performance report
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance report retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a student)
 *       500:
 *         description: Internal server error
 */
Reportrouter.get('/reports/my-performance', authMiddleware, getMyPerformanceController);

/**
 * @swagger
 * /api/reports/batch-performance/{batchId}:
 *   get:
 *     summary: Get batch performance report (Admin/Teacher only)
 *     description: Get comprehensive performance report for a batch including attendance and exam statistics
 *     tags:
 *       - Reports
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
 *         description: Batch performance report retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Batch performance report fetched successfully"
 *             report:
 *               type: object
 *               properties:
 *                 batch:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     course:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                     teacher:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                 attendance:
 *                   type: object
 *                   properties:
 *                     totalClasses:
 *                       type: number
 *                     averageAttendance:
 *                       type: number
 *                     studentStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           studentId:
 *                             type: string
 *                           studentName:
 *                             type: string
 *                           presentClasses:
 *                             type: number
 *                           totalClasses:
 *                             type: number
 *                           percentage:
 *                             type: number
 *                 exams:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       examName:
 *                         type: string
 *                       averageMarks:
 *                         type: number
 *                       highestMarks:
 *                         type: number
 *                       lowestMarks:
 *                         type: number
 *                       totalStudents:
 *                         type: number
 *                 overallStats:
 *                   type: object
 *                   properties:
 *                     totalStudents:
 *                       type: number
 *                     averagePerformance:
 *                       type: number
 *                     topPerformer:
 *                       type: object
 *                       properties:
 *                         studentId:
 *                           type: string
 *                         studentName:
 *                           type: string
 *                         averagePercentage:
 *                           type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin/teacher)
 *       404:
 *         description: Batch not found
 *       500:
 *         description: Internal server error
 */
Reportrouter.get('/reports/batch-performance/:batchId', authMiddleware, getBatchPerformanceController);

/**
 * @swagger
 * /api/reports/course-enrollment/{courseId}:
 *   get:
 *     summary: Get course enrollment report (Admin/Teacher only)
 *     description: Get detailed enrollment report for a specific course
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         type: string
 *         description: ID of the course
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Course enrollment report retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Course enrollment report fetched successfully"
 *             report:
 *               type: object
 *               properties:
 *                 course:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     duration:
 *                       type: number
 *                     fees:
 *                       type: number
 *                 enrollments:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     active:
 *                       type: number
 *                     completed:
 *                       type: number
 *                     pending:
 *                       type: number
 *                 batches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       batchId:
 *                         type: string
 *                       batchName:
 *                         type: string
 *                       studentCount:
 *                         type: number
 *                       teacherName:
 *                         type: string
 *                 revenue:
 *                   type: object
 *                   properties:
 *                     potential:
 *                       type: number
 *                     collected:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin/teacher)
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */
Reportrouter.get('/reports/course-enrollment/:courseId', authMiddleware, getCourseEnrollmentReportController);

/**
 * @swagger
 * /api/reports/all-courses-enrollment:
 *   get:
 *     summary: Get all courses enrollment report (Admin only)
 *     description: Get enrollment statistics for all courses in the system
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All courses enrollment report retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "All courses enrollment report fetched successfully"
 *             courses:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   duration:
 *                     type: number
 *                   fees:
 *                     type: number
 *                   totalEnrollments:
 *                     type: number
 *                   activeEnrollments:
 *                     type: number
 *                   totalBatches:
 *                     type: number
 *                   potentialRevenue:
 *                     type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       500:
 *         description: Internal server error
 */
Reportrouter.get('/reports/all-courses-enrollment', authMiddleware, getAllCoursesEnrollmentController);

export { Reportrouter };