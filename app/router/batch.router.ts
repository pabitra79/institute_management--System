import { Router } from 'express';
import { 
    createBatchController, 
    getBatchesByCourseController, 
    assignStudentToBatchController, 
    updateBatchController, 
    deleteBatchController 
} from '../controller/batch.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const Batchrouter = Router();

/**
 * @swagger
 * /api/batches/create:
 *   post:
 *     summary: Create a new batch (Admin/Teacher)
 *     description: Create a new batch for a specific course
 *     tags:
 *       - Batch
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: batch
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - courseId
 *             - startDate
 *             - endDate
 *             - teacherId
 *           properties:
 *             name:
 *               type: string
 *               example: "WD-2024-Batch-1"
 *             courseId:
 *               type: string
 *               example: "507f1f77bcf86cd799439011"
 *             startDate:
 *               type: string
 *               format: date
 *               example: "2024-01-15"
 *             endDate:
 *               type: string
 *               format: date
 *               example: "2024-07-15"
 *             teacherId:
 *               type: string
 *               example: "507f1f77bcf86cd799439012"
 *             maxStudents:
 *               type: number
 *               example: 30
 *     responses:
 *       201:
 *         description: Batch created successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Batch created successfully"
 *             batch:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 courseId:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *                 teacherId:
 *                   type: string
 *                 maxStudents:
 *                   type: number
 *                 isActive:
 *                   type: boolean
 *                 createdBy:
 *                   type: string
 *       400:
 *         description: Bad request (validation error, course/teacher not found)
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (user is not admin or teacher)
 *       500:
 *         description: Internal server error
 */
Batchrouter.post('/batches/create', authMiddleware, createBatchController);

/**
 * @swagger
 * /api/batches/course/{courseId}:
 *   get:
 *     summary: Get all batches for a course
 *     description: Retrieve all batches associated with a specific course
 *     tags:
 *       - Batch
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         type: string
 *         description: ID of the course
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Batches retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Batches fetched successfully"
 *             batches:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   courseId:
 *                     type: string
 *                   startDate:
 *                     type: string
 *                     format: date-time
 *                   endDate:
 *                     type: string
 *                     format: date-time
 *                   teacher:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                   totalStudents:
 *                     type: number
 *                   maxStudents:
 *                     type: number
 *                   isActive:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */
Batchrouter.get('/batches/course/:courseId', getBatchesByCourseController);

/**
 * @swagger
 * /api/batches/{batchId}/assign-student:
 *   post:
 *     summary: Assign student to batch (Admin only)
 *     description: Enroll a student into a specific batch
 *     tags:
 *       - Batch
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: batchId
 *         required: true
 *         type: string
 *         description: ID of the batch
 *         example: "507f1f77bcf86cd799439013"
 *       - in: body
 *         name: assignment
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - studentId
 *           properties:
 *             studentId:
 *               type: string
 *               example: "507f1f77bcf86cd799439014"
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
 *             batch:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 totalStudents:
 *                   type: number
 *       400:
 *         description: Bad request (student not found or invalid)
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (user is not admin)
 *       404:
 *         description: Batch not found
 *       500:
 *         description: Internal server error
 */
Batchrouter.post('/batches/:batchId/assign-student', authMiddleware, assignStudentToBatchController);

/**
 * @swagger
 * /api/batches/{batchId}:
 *   put:
 *     summary: Update batch details (Admin/Teacher)
 *     description: Modify batch information such as schedule or assigned teacher
 *     tags:
 *       - Batch
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: batchId
 *         required: true
 *         type: string
 *         description: ID of the batch to update
 *         example: "507f1f77bcf86cd799439013"
 *       - in: body
 *         name: batch
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "WD-2024-Batch-1-Updated"
 *             startDate:
 *               type: string
 *               format: date
 *               example: "2024-02-01"
 *             endDate:
 *               type: string
 *               format: date
 *               example: "2024-08-01"
 *             teacherId:
 *               type: string
 *               example: "507f1f77bcf86cd799439015"
 *             maxStudents:
 *               type: number
 *               example: 35
 *     responses:
 *       200:
 *         description: Batch updated successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Batch updated successfully"
 *             batch:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *                 teacherId:
 *                   type: string
 *                 maxStudents:
 *                   type: number
 *       400:
 *         description: Bad request (validation error, teacher not found)
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (user is not admin or teacher)
 *       404:
 *         description: Batch not found
 *       500:
 *         description: Internal server error
 */
Batchrouter.put('/batches/:batchId', authMiddleware, updateBatchController);

/**
 * @swagger
 * /api/batches/{batchId}:
 *   delete:
 *     summary: Delete a batch (Admin only)
 *     description: Soft delete a batch from the system
 *     tags:
 *       - Batch
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: batchId
 *         required: true
 *         type: string
 *         description: ID of the batch to delete
 *         example: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Batch deleted successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Batch deleted successfully"
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (user is not admin)
 *       404:
 *         description: Batch not found
 *       500:
 *         description: Internal server error
 */
Batchrouter.delete('/batches/:batchId', authMiddleware, deleteBatchController);

export { Batchrouter };