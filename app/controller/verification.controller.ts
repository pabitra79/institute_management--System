import { Request, Response } from "express";
import { UserRepository } from "../repository/user.repo";
import { sendEmailVerification } from "../helper/mailverify.helper";

const userRepo = new UserRepository();

// Verify Email Controller
export const verifyEmailController = async (req: Request, res: Response) => {
    try {
        const { token, email } = req.query;

        if (!token || !email) {
            return res.status(400).json({
                success: false,
                message: "Token and email are required"
            });
        }

        // Find user by email
        const user = await userRepo.findByEmail(email as string);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
// Check if already verified
        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }


        // Check if token matches and is not expired
        if (user.emailVerificationToken !== token) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification token"
            });
        }

        if (user.emailVerificationExpires && new Date() > user.emailVerificationExpires) {
            return res.status(400).json({
                success: false,
                message: "Verification token has expired"
            });
        }

        // Update user as verified
        const updatedUser = await userRepo.verifyUserEmail(user._id.toString());
         // Verify the email
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found during verification"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Email verified successfully! You can now login.",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isEmailVerified: updatedUser.isEmailVerified
            }
        });

    } catch (err: any) {
        console.error("Email verification error:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Resend Verification Email Controller
export const resendVerificationEmailController = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // Find user by email
        const user = await userRepo.findByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if already verified
        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        // Send verification email
        const emailResult = await sendEmailVerification(user);

        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                message: "Failed to send verification email. Please try again later."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Verification email sent successfully! Please check your inbox.",
            emailSent: true
        });

    } catch (err: any) {
        console.error("Resend verification error:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};