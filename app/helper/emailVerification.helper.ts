import crypto from "crypto";

// Simple function to send email verification
export const sendEmailVerification = async (user: { _id?: any; email: any; name?: any; save?: any; emailVerificationToken?: any; emailVerificationExpires?: any; isEmailVerified?: any; }) => {
  try {
    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    
    // Create verification URL
    const verifyUrl = `http://localhost:5001/verify-email?token=${token}&email=${user.email}`;
    
    // Update user with token (if your user model has these fields)
    if (user.save) {
      user.emailVerificationToken = token;
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      user.isEmailVerified = false;
      await user.save();
    }
    
    // Send email (you need to implement this part)
    console.log('Verification URL:', verifyUrl);
    
    return { success: true, token };
  } catch (error) {
    console.error("Email verification error:", error);
    return { success: false, error };
  }
};