import { Router } from 'express';
import { 
    assignMarksToMultipleController, 
    getStudentPerformanceController, 
    getExamResultByIdController, 
    deleteExamResultController 
} from '../controller/examResult.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const ExamResultrouter = Router();

/**
 * @swagger
 * /api/exam-results/assign-multiple:
 *   post:
 *     summary: Assign marks to multiple students (Teacher only)
 *     description: Assign marks to multiple students for a specific exam in bulk
 *     tags:
 *       - Exam Result
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: results
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - examId
 *             - results
 *           properties:
 *             examId:
 *               type: string
 *               example: "507f1f77bcf86cd799439011"
 *             results:
 *               type: array
 *               items:
 *                 type: object
 *                 required:
 *                   - studentId
 *                   - marksObtained
 *                 properties:
 *                   studentId:
 *                     type: string
 *                     example: "507f1f77bcf86cd799439012"
 *                   marksObtained:
 *                     type: number
 *                     example: 85
 *                   remarks:
 *                     type: string
 *                     example: "Good performance"
 *     responses:
 *       200:
 *         description: Marks assigned to multiple students successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Marks assigned successfully"
 *             results:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   studentId:
 *                     type: string
 *                   marksObtained:
 *                     type: number
 *                   grade:
 *                     type: string
 *                   remarks:
 *                     type: string
 *             errors:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   studentId:
 *                     type: string
 *                   error:
 *                     type: string
 *             summary:
 *               type: object
 *               properties:
 *                 totalProcessed:
 *                   type: number
 *                   example: 10
 *                 successful:
 *                   type: number
 *                   example: 8
 *                 failed:
 *                   type: number
 *                   example: 2
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
ExamResultrouter.post('/exam-results/assign-multiple', authMiddleware, assignMarksToMultipleController);

/**
 * @swagger
 * /api/exam-results/student-performance/{studentId}:
 *   get:
 *     summary: Get student performance summary
 *     description: Retrieve comprehensive performance summary for a specific student
 *     tags:
 *       - Exam Result
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
 *         description: Student performance retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Student performance fetched successfully"
 *             performance:
 *               type: object
 *               properties:
 *                 totalExams:
 *                   type: number
 *                   example: 5
 *                 averageMarks:
 *                   type: number
 *                   example: 78.5
 *                 averagePercentage:
 *                   type: number
 *                   example: 78.5
 *                 totalMarksObtained:
 *                   type: number
 *                   example: 392.5
 *                 grades:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *                   example:
 *                     A: 2
 *                     B: 2
 *                     C: 1
 *                 recentResults:
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
 *                       grade:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (student trying to view another student's performance)
 *       500:
 *         description: Internal server error
 */
ExamResultrouter.get('/exam-results/student-performance/:studentId', authMiddleware, getStudentPerformanceController);

/**
 * @swagger
 * /api/exam-results/{resultId}:
 *   get:
 *     summary: Get exam result by ID
 *     description: Retrieve detailed information about a specific exam result
 *     tags:
 *       - Exam Result
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resultId
 *         required: true
 *         type: string
 *         description: ID of the exam result
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Exam result retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Exam result fetched successfully"
 *             result:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 exam:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     totalMarks:
 *                       type: number
 *                     date:
 *                       type: string
 *                       format: date-time
 *                 student:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                 marksObtained:
 *                   type: number
 *                 totalMarks:
 *                   type: number
 *                 percentage:
 *                   type: number
 *                 grade:
 *                   type: string
 *                 remarks:
 *                   type: string
 *                 submittedBy:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                 submittedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (student trying to view another student's result)
 *       404:
 *         description: Exam result not found
 *       500:
 *         description: Internal server error
 */
ExamResultrouter.get('/exam-results/:resultId', authMiddleware, getExamResultByIdController);

/**
 * @swagger
 * /api/exam-results/{resultId}:
 *   delete:
 *     summary: Delete exam result (Admin/Teacher only)
 *     description: Delete a specific exam result from the system
 *     tags:
 *       - Exam Result
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resultId
 *         required: true
 *         type: string
 *         description: ID of the exam result to delete
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Exam result deleted successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Exam result deleted successfully"
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (user is not admin or teacher)
 *       404:
 *         description: Exam result not found
 *       500:
 *         description: Internal server error
 */
ExamResultrouter.delete('/exam-results/:resultId', authMiddleware, deleteExamResultController);

export { ExamResultrouter };