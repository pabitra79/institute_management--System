import { Router } from "express";
import { 
    verifyEmailController,
    resendVerificationEmailController 
} from "../controller/verification.controller";

const Verificationrouter = Router();

/**
 * @swagger
 * /api/verify-email:
 *   get:
 *     summary: Verify user email
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
Verificationrouter.get("/verify-email", verifyEmailController);

/**
 * @swagger
 * /api/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *       404:
 *         description: User not found
 */
Verificationrouter.post("/resend-verification", resendVerificationEmailController);

export { Verificationrouter };