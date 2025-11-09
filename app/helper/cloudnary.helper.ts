import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageToCloudinary = async (file: Express.Multer.File) => {
  if (!file) {
    console.log("No file provided");
    return null;
  }

  try {
    console.log(" Uploading file to Cloudinary:", file.path);

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "institute_management/users",
      resource_type: "auto",
      transformation: [
        { width: 500, height: 500, crop: "limit" },
        { quality: "auto" },
      ],
    });

    console.log(" Upload successful:", result.secure_url);

    // Delete local file after upload
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
      console.log(" Local file deleted:", file.path);
    }

    return result.secure_url;
  } catch (error: any) {
    console.error(" Cloudinary upload error:", error);

    // Clean up local file even if upload fails
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    throw new Error("Image upload failed: " + error.message);
  }
};
