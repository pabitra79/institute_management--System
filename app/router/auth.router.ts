import { Router } from 'express';
import multer from 'multer';
const upload = multer();
import { LoginController, SignupController } from '../controller/auth.controller';

const Authrouter = Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and sends email verification
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: formData
 *         name: name
 *         type: string
 *         required: true
 *         description: User's full name
 *         example: "John Doe"
 *       - in: formData
 *         name: email
 *         type: string
 *         format: email
 *         required: true
 *         description: User's email address
 *         example: "john.doe@example.com"
 *       - in: formData
 *         name: password
 *         type: string
 *         format: password
 *         required: true
 *         description: User's password (min 6 characters)
 *         example: "password123"
 *       - in: formData
 *         name: contactInfo
 *         type: string
 *         required: true
 *         description: User's contact information
 *         example: "+1234567890"
 *       - in: formData
 *         name: role
 *         type: string
 *         enum: [student, teacher, admin]
 *         default: student
 *         description: User role
 *         example: "student"
 *       - in: formData
 *         name: profilePicture
 *         type: file
 *         description: User profile picture
 *     responses:
 *       201:
 *         description: User created successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Signup successful, verify email"
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
Authrouter.post('/auth/signup',upload.single('profilePicture'), SignupController);//upload.single('profilePicture'),
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and return JWT token
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: body
 *         name: credentials
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - password
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               example: "john.doe@example.com"
 *             password:
 *               type: string
 *               format: password
 *               example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *               example: "Login successful"
 *             token:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             user:
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
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
Authrouter.post('/auth/login', LoginController);

export { Authrouter };