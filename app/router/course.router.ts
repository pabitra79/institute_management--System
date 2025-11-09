import { Router } from 'express';
import { 
    createCourseController, 
    getAllCoursesController, 
    updateCourseController, 
    deleteCourseController 
} from '../controller/course.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const Courserouter = Router();

/**
 * @swagger
 * /api/courses/create:
 *   post:
 *     summary: Create a new course (Admin only)
 *     description: Admin creates a new course in the system
 *     tags:
 *       - Course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: course
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - description
 *             - duration
 *             - fees
 *           properties:
 *             name:
 *               type: string
 *               example: "Web Development Bootcamp"
 *             description:
 *               type: string
 *               example: "Complete web development course covering HTML, CSS, JavaScript, Node.js and React"
 *             duration:
 *               type: number
 *               example: 6
 *             fees:
 *               type: number
 *               example: 15000
 *     responses:
 *       201:
 *         description: Course created successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Course created successfully"
 *             course:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 duration:
 *                   type: number
 *                 fees:
 *                   type: number
 *                 isActive:
 *                   type: boolean
 *                 createdBy:
 *                   type: string
 *       400:
 *         description: Bad request (validation error)
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (user is not admin)
 *       500:
 *         description: Internal server error
 */
Courserouter.post('/courses/create', authMiddleware, createCourseController);

/**
 * @swagger
 * /api/courses/public:
 *   get:
 *     summary: Get all available courses (Public)
 *     description: Retrieve list of all active courses for students to browse
 *     tags:
 *       - Course
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Courses fetched successfully"
 *             courses:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                     example: "Web Development Bootcamp"
 *                   description:
 *                     type: string
 *                     example: "Learn full-stack web development"
 *                   duration:
 *                     type: number
 *                     example: 6
 *                   fees:
 *                     type: number
 *                     example: 15000
 *       500:
 *         description: Internal server error
 */
Courserouter.get('/courses/public', getAllCoursesController); // Use existing controller
/**
 * @swagger
 * /api/courses/{courseId}:
 *   put:
 *     summary: Update course details (Admin only)
 *     description: Update information for a specific course
 *     tags:
 *       - Course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         type: string
 *         description: ID of the course to update
 *         example: "507f1f77bcf86cd799439011"
 *       - in: body
 *         name: course
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "Advanced Web Development"
 *             description:
 *               type: string
 *               example: "Updated course description"
 *             duration:
 *               type: number
 *               example: 8
 *             fees:
 *               type: number
 *               example: 20000
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Course updated successfully"
 *             course:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 duration:
 *                   type: number
 *                 fees:
 *                   type: number
 *                 isActive:
 *                   type: boolean
 *       400:
 *         description: Bad request (validation error)
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (user is not admin)
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */
Courserouter.put('/courses/:courseId', authMiddleware, updateCourseController);

/**
 * @swagger
 * /api/courses/{courseId}:
 *   delete:
 *     summary: Delete a course (Admin only)
 *     description: Soft delete a course from the system
 *     tags:
 *       - Course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         type: string
 *         description: ID of the course to delete
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Course deleted successfully"
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (user is not admin)
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */
Courserouter.delete('/courses/:courseId', authMiddleware, deleteCourseController);

export { Courserouter };