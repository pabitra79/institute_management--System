import { Router } from 'express';
import { 
    enrollStudentController, 
    getStudentEnrollmentsController, 
    getCourseEnrollmentsController,
    getMyEnrollmentsController,
    assignStudentToBatchController
} from '../controller/enrollment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const Enrollmentrouter = Router();

/**
 * @swagger
 * /api/enrollments/enroll:
 *   post:
 *     summary: Enroll in a course
 *     description: Enroll in a course. Students enroll themselves, admins can enroll any student.
 *     tags:
 *       - Enrollment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: enrollment
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - courseId
 *           properties:
 *             studentId:
 *               type: string
 *               description: Required only for admin/teacher to enroll specific students
 *               example: "507f1f77bcf86cd799439011"
 *             courseId:
 *               type: string
 *               required: true
 *               description: Get course ID from /api/courses/public
 *               example: "507f1f77bcf86cd799439012"
 *     responses:
 *       201:
 *         description: Enrolled in course successfully
 */
Enrollmentrouter.post('/enrollments/enroll', authMiddleware, enrollStudentController);

/**
 * @swagger
 * /api/enrollments/my-enrollments:
 *   get:
 *     summary: Get my enrollments (Student only)
 *     description: Students can view their own course enrollments with full details
 *     tags:
 *       - Enrollment
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student enrollments retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Your enrollments fetched successfully"
 *             enrollments:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   course:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       duration:
 *                         type: number
 *                       fees:
 *                         type: number
 *                   batch:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                   enrollmentDate:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                     example: "active"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (not a student)
 *       500:
 *         description: Internal server error
 */
Enrollmentrouter.get('/enrollments/my-enrollments', authMiddleware, getMyEnrollmentsController);

/**
 * @swagger
 * /api/enrollments/student/{studentId}:
 *   get:
 *     summary: Get student enrollments
 *     description: Retrieve all course enrollments for a specific student. Students can only view their own data.
 *     tags:
 *       - Enrollment
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
 *         description: Student enrollments retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Enrollments fetched successfully"
 *             enrollments:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   course:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       duration:
 *                         type: number
 *                       fees:
 *                         type: number
 *                   batch:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                   enrollmentDate:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                     example: "active"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (student trying to view another student's enrollments)
 *       500:
 *         description: Internal server error
 */
Enrollmentrouter.get('/enrollments/student/:studentId', authMiddleware, getStudentEnrollmentsController);

/**
 * @swagger
 * /api/enrollments/course/{courseId}:
 *   get:
 *     summary: Get course enrollments (Admin/Teacher only)
 *     description: Retrieve all student enrollments for a specific course with student details
 *     tags:
 *       - Enrollment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         type: string
 *         description: ID of the course
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Course enrollments retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Course enrollments fetched successfully"
 *             enrollments:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   student:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       contactInfo:
 *                         type: string
 *                   batch:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   enrollmentDate:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                     example: "active"
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (user is not admin or teacher)
 *       500:
 *         description: Internal server error
 */
Enrollmentrouter.get('/enrollments/course/:courseId', authMiddleware, getCourseEnrollmentsController);

/**
 * @swagger
 * /api/enrollments/assign-batch:
 *   post:
 *     summary: Assign student to batch (Admin/Teacher only)
 *     description: Assign an enrolled student to a specific batch. This activates the enrollment.
 *     tags:
 *       - Enrollment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: assignment
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - enrollmentId
 *             - batchId
 *           properties:
 *             enrollmentId:
 *               type: string
 *               example: "507f1f77bcf86cd799439011"
 *             batchId:
 *               type: string
 *               example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Student assigned to batch successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Student assigned to batch successfully"
 *             enrollment:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 studentId:
 *                   type: string
 *                 courseId:
 *                   type: string
 *                 batchId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   example: "active"
 *       400:
 *         description: Bad request (validation error, enrollment not found)
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (user is not admin or teacher)
 *       404:
 *         description: Enrollment not found
 *       500:
 *         description: Internal server error
 */
Enrollmentrouter.post('/enrollments/assign-batch', authMiddleware, assignStudentToBatchController);

export { Enrollmentrouter };