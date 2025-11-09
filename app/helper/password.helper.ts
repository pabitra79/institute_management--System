import bcryptjs  from "bcryptjs";

export const hashPassword = async (password: string) => {
  try {
    console.log(" Hashing password with bcryptjs...");
    const salt = await bcryptjs.genSalt(10);

    const hashedPassword = await bcryptjs.hash(password, salt);
    console.log(" Password hashed");
    console.log("Hash:", hashedPassword);

    return hashedPassword;
  } catch (err) {
    console.error(" Hashing error:", err);
    throw err;
  }
};
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcryptjs.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error(" Password comparison failed:", error);
    throw error;
  }
};

