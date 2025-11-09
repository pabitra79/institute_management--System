import { CourseModel } from "../models/course.model";
import { ICourseDocument } from "../interface/course.interface";

export class CourseRepository {
    async createCourse(courseData: {
        name: string;
        description: string;
        duration: number;
        fees: number;
        createdBy: string;
    }): Promise<ICourseDocument> {
        const course = new CourseModel(courseData);
        return await course.save();
    }

    async findById(courseId: string): Promise<ICourseDocument | null> {
        return await CourseModel.findById(courseId);
    }

    async findAll(): Promise<ICourseDocument[]> {
        return await CourseModel.find({ isActive: true })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
    }

    async updateCourse(courseId: string, updateData: {
        name?: string;
        description?: string;
        duration?: number;
        fees?: number;
    }): Promise<ICourseDocument | null> {
        return await CourseModel.findByIdAndUpdate(
            courseId,
            updateData,
            { new: true, runValidators: true }
        );
    }

    async deleteCourse(courseId: string): Promise<ICourseDocument | null> {
        return await CourseModel.findByIdAndUpdate(
            courseId,
            { isActive: false },
            { new: true }
        );
    }

    async getCourseWithStats(courseId: string): Promise<any> {
        // This will be implemented to get course with batch and enrollment stats
        return await CourseModel.findById(courseId)
            .populate('createdBy', 'name email');
    }
}