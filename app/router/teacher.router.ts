import { Router } from 'express';
import { 
    createTeacherController, 
    getAllTeachersController, 
    getTeacherByIdController 
} from '../controller/teacher.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const Teacherrouter = Router();

/**
 * @swagger
 * /api/teachers/create:
 *   post:
 *     summary: Create a new teacher (Admin only)
 *     description: Admin creates a new teacher account. Teacher will be auto-verified.
 *     tags:
 *       - Teacher
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: teacher
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - email
 *             - password
 *             - contactInfo
 *           properties:
 *             name:
 *               type: string
 *               example: "Jane Smith"
 *             email:
 *               type: string
 *               format: email
 *               example: "jane.smith@example.com"
 *             password:
 *               type: string
 *               format: password
 *               example: "teacher123"
 *             contactInfo:
 *               type: string
 *               example: "+1234567890"
 *             profilePicture:
 *               type: string
 *               example: "profile.jpg"
 *     responses:
 *       201:
 *         description: Teacher created successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Teacher created successfully"
 *             teacher:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 contactInfo:
 *                   type: string
 *                 profilePicture:
 *                   type: string
 *                 createdBy:
 *                   type: string
 *       400:
 *         description: Bad request (email already exists, validation error)
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (user is not admin)
 *       500:
 *         description: Internal server error
 */
Teacherrouter.post('/teachers/create', authMiddleware, createTeacherController);

/**
 * @swagger
 * /api/teachers/all:
 *   get:
 *     summary: Get all teachers (Admin only)
 *     description: Retrieve a list of all teachers in the system
 *     tags:
 *       - Teacher
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of teachers retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Teachers fetched successfully"
 *             teachers:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   contactInfo:
 *                     type: string
 *                   profilePicture:
 *                     type: string
 *                   isEmailVerified:
 *                     type: boolean
 *                   createdBy:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (user is not admin)
 *       500:
 *         description: Internal server error
 */
Teacherrouter.get('/teachers/all', authMiddleware, getAllTeachersController);

/**
 * @swagger
 * /api/teachers/{teacherId}:
 *   get:
 *     summary: Get teacher by ID (Admin only)
 *     description: Retrieve detailed information about a specific teacher
 *     tags:
 *       - Teacher
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         type: string
 *         description: ID of the teacher to retrieve
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Teacher details retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Teacher details fetched successfully"
 *             teacher:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 contactInfo:
 *                   type: string
 *                 profilePicture:
 *                   type: string
 *                 isEmailVerified:
 *                   type: boolean
 *                 createdBy:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request (user is not a teacher)
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (user is not admin)
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Internal server error
 */
Teacherrouter.get('/teachers/:teacherId', authMiddleware, getTeacherByIdController);

export { Teacherrouter };