import { Router } from "express";
import { 
    getStudentDashboardController,
    getTeacherDashboardController, 
    getAdminDashboardController,
    getDashboardController
} from "../controller/dashboard.controller";
import { authMiddleware } from '../middleware/auth.middleware';

const Dashboardrouter = Router();

/**
 * @swagger
 * /api/dashboard/student:
 *   get:
 *     summary: Get student dashboard
 *     description: Retrieve dashboard data specifically for students
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student dashboard fetched successfully
 *         schema:
 *           $ref: '#/definitions/ApiResponse'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied for non-students
 *       500:
 *         description: Internal server error
 */
// Change from "/student" to "/dashboard-student"
Dashboardrouter.get("/dashboard/student", authMiddleware, getStudentDashboardController);

/**
 * @swagger
 * /api/dashboard/teacher:
 *   get:
 *     summary: Get teacher dashboard
 *     description: Retrieve dashboard data specifically for teachers
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teacher dashboard fetched successfully
 *         schema:
 *           $ref: '#/definitions/ApiResponse'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied for non-teachers
 *       500:
 *         description: Internal server error
 */
// Change from "/teacher" to "/dashboard-teacher"
Dashboardrouter.get("/dashboard/teacher", authMiddleware, getTeacherDashboardController);

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Get admin dashboard
 *     description: Retrieve dashboard data specifically for administrators
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard fetched successfully
 *         schema:
 *           $ref: '#/definitions/ApiResponse'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied for non-admins
 *       500:
 *         description: Internal server error
 */
// Change from "/admin" to "/dashboard-admin"
Dashboardrouter.get("/dashboard/admin", authMiddleware, getAdminDashboardController);

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get role-based dashboard (universal endpoint)
 *     description: Automatically detects user role and returns appropriate dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard fetched successfully based on user role
 *         schema:
 *           $ref: '#/definitions/ApiResponse'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied - invalid user role
 *       500:
 *         description: Internal server error
 */
// Keep this one as is
Dashboardrouter.get("/", authMiddleware, getDashboardController);

export { Dashboardrouter };