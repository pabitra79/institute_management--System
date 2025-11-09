import { transporter } from "../config/emailConfig";
import crypto from "crypto";
import { IUser } from "../interface/user.interface"; 

/**
 * Send email verification link
 */
export const sendEmailVerification = async (user: IUser & { save?: () => Promise<any> }): Promise<{ 
  success: boolean; 
  messageId?: string; 
  error?: string;
  token?: string;
}> => {
  try {
    console.log(" Starting email verification for:", user.email);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Update user with verification token
    if (user.save) {
      (user as any).emailVerificationToken = verificationToken;
      (user as any).emailVerificationExpires = verificationExpires;
      (user as any).isEmailVerified = false;
      await user.save();
      console.log(" Verification token saved to user");
    }
    
  const verificationUrl = `${process.env.EMAIL_LINK || "http://localhost:5001"}/api/verify-email?token=${verificationToken}&email=${user.email}`;
    const websiteName = "Institute Management";
    const fromEmail = process.env.EMAIL_FROM;

    console.log(" Attempting to send email via transporter...");
    console.log(" From:", fromEmail);
    console.log(" To:", user.email);
    
    const mailOptions = {
      from: `"${websiteName}" <${fromEmail}>`,
      to: user.email,
      subject: `Verify Your Email - ${websiteName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Verify Your Email Address</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Click the button below to verify your email address:</p>
          <a href="${verificationUrl}" style="background: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 15px 0;">Verify Email</a>
          <p>Or copy this link: ${verificationUrl}</p>
          <p>If you didn't create an account, ignore this email.</p>
          <p><small>This link expires in 24 hours.</small></p>
        </div>
      `,
    };


    console.log(" Calling transporter.sendMail()...");
    const result = await transporter.sendMail(mailOptions);
    console.log("EMAIL SENT SUCCESSFULLY!");
    console.log(" Message ID:", result.messageId);
    console.log(" Response:", result.response);
    
    return { 
      success: true, 
      messageId: result.messageId, 
      token: verificationToken 
    };
    
  } catch (err: any) {
    console.error(" EMAIL SENDING FAILED!");
    console.error("Error message:", err.message);
    console.error("Full error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Send login credentials to newly created user
 */
export const sendLoginCredentials = async (user: IUser, plainPassword: string): Promise<boolean> => {
  try {
    const websiteName = "Institute Management";
    const loginUrl = "http://localhost:5001/login";
    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    const mailOptions = {
      from: `"${websiteName}" <${fromEmail}>`,
      to: user.email,
      subject: `Your ${websiteName} Login Credentials`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #333;">Welcome to ${websiteName}!</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Your account has been created. Here are your login details:</p>
          <div style="background: #b5c3d0ff; padding: 15px; border-radius: 5px;">
            <p><strong>Login Page:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Temporary Password:</strong> <code>${plainPassword}</code></p>
          </div>
          <p><strong>Security Note:</strong> Please change your password after first login.</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Login credentials sent to:", user.email);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};

/**
 * Password Reset Email
 */
export const sendPasswordResetEmail = async (user: IUser, resetToken: string): Promise<void> => {
  try {
    const resetLink = `${process.env.EMAIL_LINK || "http://localhost:5001"}/reset-password/${resetToken}`;
    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    
    const mailOptions = {
      from: `"Institute Management" <${fromEmail}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>Click below to reset your password:</p>
          <a href="${resetLink}" style="background: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 15px 0;">Reset Password</a>
          <p>Or copy this link: ${resetLink}</p>
          <p>This link expires in 1 hour.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent to:", user.email);
  } catch (error) {
    console.error("❌ Password reset email error:", error);
    throw new Error("Failed to send password reset email");
  }
};