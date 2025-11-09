import { Router } from 'express';
import { 
    createExamController, 
    assignMarksController, 
    getStudentResultsController, 
    getBatchResultsController, 
    updateExamController 
} from '../controller/exam.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const Examrouter = Router();

/**
 * @swagger
 * /api/exams/create:
 *   post:
 *     summary: Create exam (Admin/Teacher only)
 *     description: Create a new exam for a specific batch
 *     tags:
 *       - Exam
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: exam
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - batchId
 *             - date
 *             - duration
 *             - totalMarks
 *           properties:
 *             name:
 *               type: string
 *               example: "Midterm Examination"
 *             batchId:
 *               type: string
 *               example: "507f1f77bcf86cd799439011"
 *             date:
 *               type: string
 *               format: date
 *               example: "2024-02-15"
 *             duration:
 *               type: number
 *               description: Duration in minutes
 *               example: 120
 *             totalMarks:
 *               type: number
 *               example: 100
 *             subject:
 *               type: string
 *               example: "Mathematics"
 *             description:
 *               type: string
 *               example: "Midterm exam covering chapters 1-5"
 *     responses:
 *       201:
 *         description: Exam created successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Exam created successfully"
 *             exam:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 batchId:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 duration:
 *                   type: number
 *                 totalMarks:
 *                   type: number
 *                 subject:
 *                   type: string
 *                 description:
 *                   type: string
 *                 createdBy:
 *                   type: string
 *       400:
 *         description: Bad request (validation error, batch not found)
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (user is not admin or teacher)
 *       500:
 *         description: Internal server error
 */
Examrouter.post('/exams/create', authMiddleware, createExamController);

/**
 * @swagger
 * /api/exams/assign-marks:
 *   post:
 *     summary: Assign marks to student (Teacher only)
 *     description: Assign marks to a student for a specific exam
 *     tags:
 *       - Exam
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: marks
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - examId
 *             - studentId
 *             - marksObtained
 *           properties:
 *             examId:
 *               type: string
 *               example: "507f1f77bcf86cd799439011"
 *             studentId:
 *               type: string
 *               example: "507f1f77bcf86cd799439012"
 *             marksObtained:
 *               type: number
 *               example: 85
 *             remarks:
 *               type: string
 *               example: "Excellent performance"
 *     responses:
 *       200:
 *         description: Marks assigned successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Marks assigned successfully"
 *             result:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 examId:
 *                   type: string
 *                 studentId:
 *                   type: string
 *                 marksObtained:
 *                   type: number
 *                 grade:
 *                   type: string
 *                 remarks:
 *                   type: string
 *                 submittedBy:
 *                   type: string
 *       400:
 *         description: Bad request (marks exceed total marks, validation error)
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (user is not teacher)
 *       404:
 *         description: Exam or student not found
 *       500:
 *         description: Internal server error
 */
Examrouter.post('/exams/assign-marks', authMiddleware, assignMarksController);

/**
 * @swagger
 * /api/exams/student/{studentId}:
 *   get:
 *     summary: Get student exam results
 *     description: Retrieve all exam results for a specific student
 *     tags:
 *       - Exam
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
 *         description: Student results retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Student results fetched successfully"
 *             results:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   exam:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       totalMarks:
 *                         type: number
 *                       date:
 *                         type: string
 *                         format: date-time
 *                   marksObtained:
 *                     type: number
 *                   grade:
 *                     type: string
 *                   remarks:
 *                     type: string
 *                   submittedBy:
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
 *       403:
 *         description: Forbidden (student trying to view another student's results)
 *       500:
 *         description: Internal server error
 */
Examrouter.get('/exams/student/:studentId', authMiddleware, getStudentResultsController);

/**
 * @swagger
 * /api/exams/batch/{examId}:
 *   get:
 *     summary: Get batch exam results (Admin/Teacher only)
 *     description: Retrieve all student results for a specific exam
 *     tags:
 *       - Exam
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         type: string
 *         description: ID of the exam
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Batch results retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Batch results fetched successfully"
 *             results:
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
 *                   marksObtained:
 *                     type: number
 *                   grade:
 *                     type: string
 *                   remarks:
 *                     type: string
 *                   percentage:
 *                     type: number
 *                     example: 85.5
 *             statistics:
 *               type: object
 *               properties:
 *                 totalStudents:
 *                   type: number
 *                   example: 30
 *                 averageMarks:
 *                   type: number
 *                   example: 75.2
 *                 highestMarks:
 *                   type: number
 *                   example: 98
 *                 lowestMarks:
 *                   type: number
 *                   example: 45
 *                 totalMarks:
 *                   type: number
 *                   example: 100
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (user is not admin or teacher)
 *       500:
 *         description: Internal server error
 */
Examrouter.get('/exams/batch/:examId', authMiddleware, getBatchResultsController);

/**
 * @swagger
 * /api/exams/{examId}:
 *   put:
 *     summary: Update exam details (Teacher only)
 *     description: Update information for a specific exam
 *     tags:
 *       - Exam
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         type: string
 *         description: ID of the exam to update
 *         example: "507f1f77bcf86cd799439011"
 *       - in: body
 *         name: exam
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "Updated Midterm Examination"
 *             date:
 *               type: string
 *               format: date
 *               example: "2024-02-20"
 *             duration:
 *               type: number
 *               example: 150
 *             totalMarks:
 *               type: number
 *               example: 100
 *             subject:
 *               type: string
 *               example: "Advanced Mathematics"
 *             description:
 *               type: string
 *               example: "Updated exam description"
 *     responses:
 *       200:
 *         description: Exam updated successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Exam updated successfully"
 *             exam:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 duration:
 *                   type: number
 *                 totalMarks:
 *                   type: number
 *                 subject:
 *                   type: string
 *                 description:
 *                   type: string
 *       400:
 *         description: Bad request (validation error)
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (user is not teacher)
 *       404:
 *         description: Exam not found
 *       500:
 *         description: Internal server error
 */
Examrouter.put('/exams/:examId', authMiddleware, updateExamController);

export { Examrouter };