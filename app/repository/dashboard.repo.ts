import { Types } from "mongoose";
import { IStudentDashboard, ITeacherDashboard, IAdminDashboard } from "../interface/dashboard.interface";
import { UserModel } from "../models/user.model";
import { CourseModel } from "../models/course.model";
import { EnrollmentModel } from "../models/enrollment.model";
import { BatchModel } from "../models/batch.model";

export class DashboardRepository {
    
    // Get Student Dashboard with REAL user data
    async getStudentDashboard(studentId: string): Promise<IStudentDashboard> {
        try {
            // Get REAL student data from database using your existing UserModel
            const student = await UserModel.findById(studentId)
                .select("name email profilePicture contactInfo createdAt")
                .lean();

            if (!student) {
                throw new Error("Student not found");
            }

            // Combine real user data with other dashboard data
            const dashboardData: IStudentDashboard = {
                student: {
                    _id: student._id.toString(),
                    name: student.name,
                    email: student.email,
                    profilePicture: student.profilePicture,
                    contactInfo: student.contactInfo,
                    memberSince: student.createdAt
                },
                recentEnrollments: [
                    {
                        _id: "enroll1",
                        courseName: "Web Development Bootcamp",
                        enrollmentDate: new Date('2024-01-15'),
                        status: "active",
                        batchName: "WD-2024-Batch-1"
                    },
                    {
                        _id: "enroll2",
                        courseName: "Data Science Fundamentals",
                        enrollmentDate: new Date('2024-01-10'),
                        status: "active"
                    }
                ],
                upcomingExams: [
                    {
                        _id: "exam1",
                        examName: "Midterm JavaScript",
                        date: new Date('2024-02-20'),
                        batchName: "WD-2024-Batch-1",
                        totalMarks: 100
                    },
                    {
                        _id: "exam2",
                        examName: "HTML/CSS Practical",
                        date: new Date('2024-02-25'),
                        batchName: "WD-2024-Batch-1",
                        totalMarks: 50
                    }
                ],
                attendanceSummary: {
                    totalClasses: 45,
                    presentClasses: 40,
                    percentage: 88.9,
                    recentAttendance: [
                        { date: new Date('2024-02-15'), status: 'present' },
                        { date: new Date('2024-02-14'), status: 'present' },
                        { date: new Date('2024-02-13'), status: 'absent' },
                        { date: new Date('2024-02-12'), status: 'present' }
                    ]
                },
                recentResults: [
                    {
                        _id: "result1",
                        examName: "HTML Basics",
                        marksObtained: 45,
                        totalMarks: 50,
                        percentage: 90,
                        grade: "A+",
                        date: new Date('2024-02-10')
                    },
                    {
                        _id: "result2",
                        examName: "CSS Fundamentals",
                        marksObtained: 42,
                        totalMarks: 50,
                        percentage: 84,
                        grade: "A",
                        date: new Date('2024-02-05')
                    }
                ],
                quickStats: {
                    totalCourses: 2,
                    activeCourses: 2,
                    examsThisMonth: 3,
                    attendanceThisMonth: 95
                },
                // NEW: Add profile completion status
                profileCompletion: {
                    basicInfo: true, // name, email always true
                    contactInfo: !!student.contactInfo,
                    profilePicture: student.profilePicture !== "default-avatar.png",
                    overallPercentage: this.calculateProfileCompletion(student)
                }
            };
            
            return dashboardData;
        } catch (error) {
            console.error("Error in getStudentDashboard:", error);
            throw error;
        }
    }


    // Get Teacher Dashboard with REAL user data
    async getTeacherDashboard(teacherId: string): Promise<ITeacherDashboard> {
        try {
            // Get REAL teacher data from database
            const teacher = await UserModel.findById(teacherId)
                .select("name email profilePicture contactInfo createdAt")
                .lean();

            if (!teacher) {
                throw new Error("Teacher not found");
            }

            const mockData: ITeacherDashboard = {
                teacher: {
                    _id: teacher._id.toString(),
                    name: teacher.name,
                    email: teacher.email,
                    profilePicture: teacher.profilePicture,
                    contactInfo: teacher.contactInfo,
                    memberSince: teacher.createdAt
                },
                assignedBatches: [
                    {
                        _id: "batch1",
                        name: "WD-2024-Batch-1",
                        courseName: "Web Development",
                        studentCount: 30,
                        startDate: new Date('2024-01-15'),
                        endDate: new Date('2024-07-15')
                    }
                ],
                todaysClasses: [
                    {
                        batchId: "batch1",
                        batchName: "WD-2024-Batch-1",
                        courseName: "Web Development",
                        time: "10:00 AM - 12:00 PM",
                        attendanceMarked: true
                    }
                ],
                upcomingExams: [
                    {
                        _id: "exam1",
                        examName: "Midterm JavaScript",
                        batchName: "WD-2024-Batch-1",
                        date: new Date('2024-02-20'),
                        totalStudents: 30
                    }
                ],
                pendingTasks: [
                    {
                        type: "attendance",
                        count: 1,
                        description: "Mark attendance for today's classes"
                    }
                ],
                quickStats: {
                    totalBatches: 2,
                    totalStudents: 55,
                    examsThisWeek: 3,
                    attendancePending: 1
                },
                // NEW: Add profile completion for teacher
                profileCompletion: {
                    basicInfo: true,
                    contactInfo: !!teacher.contactInfo,
                    profilePicture: teacher.profilePicture !== "default-avatar.png",
                    overallPercentage: this.calculateProfileCompletion(teacher)
                }
            };
            
            return mockData;
        } catch (error) {
            console.error("Error in getTeacherDashboard:", error);
            throw error;
        }
    }

    // Get Admin Dashboard with REAL user data
    async getAdminDashboard(adminId: string): Promise<IAdminDashboard> {
        try {
            // Get REAL admin data
            const admin = await UserModel.findById(adminId)
                .select("name email profilePicture contactInfo createdAt")
                .lean();

            if (!admin) {
                throw new Error("Admin not found");
            }

            // Get REAL statistics from database
            const [
                totalStudents,
                totalTeachers,
                totalCourses,
                totalBatches,
                activeEnrollments,
                recentUsers,
                popularCourses,
                pendingApprovals // ✅ Get this from the method call
            ] = await Promise.all([
                // Total Students
                UserModel.countDocuments({ role: 'student', isActive: true }),
                
                // Total Teachers
                UserModel.countDocuments({ role: 'teacher', isActive: true }),
                
                // Total Courses
                CourseModel.countDocuments({ isActive: true }),
                
                // Total Batches
                BatchModel.countDocuments({ isActive: true }),
                
                // Active Enrollments
                EnrollmentModel.countDocuments({ status: 'active' }),
                
                // Recent Users (last 7 days)
                UserModel.find({ 
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                })
                .select("name email role createdAt")
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
                
                // Popular Courses (by enrollment count)
                CourseModel.aggregate([
                    {
                        $lookup: {
                            from: 'enrollments',
                            localField: '_id',
                            foreignField: 'course',
                            as: 'enrollments'
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            description: 1,
                            enrollmentCount: { $size: '$enrollments' },
                            revenue: { $multiply: [{ $size: '$enrollments' }, '$fees'] }
                        }
                    },
                    { $sort: { enrollmentCount: -1 } },
                    { $limit: 5 }
                ]),
                
                // ✅ FIXED: Call the method here and await it
                this.getPendingApprovalsCount()
            ]);

            // Calculate revenue this month
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            const revenueThisMonth = await EnrollmentModel.aggregate([
                {
                    $match: {
                        enrolledAt: {
                            $gte: new Date(currentYear, currentMonth, 1),
                            $lt: new Date(currentYear, currentMonth + 1, 1)
                        },
                        status: 'active'
                    }
                },
                {
                    $lookup: {
                        from: 'courses',
                        localField: 'course',
                        foreignField: '_id',
                        as: 'course'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: { $arrayElemAt: ['$course.fees', 0] } }
                    }
                }
            ]);

            // Get recent activity
            // const recentActivity = await this.getRecentActivity();
            
            // Get system health
            const systemHealth = await this.getSystemHealth();

            const dashboardData: IAdminDashboard = {
                admin: {
                    _id: admin._id.toString(),
                    name: admin.name,
                    email: admin.email,
                    profilePicture: admin.profilePicture,
                    contactInfo: admin.contactInfo,
                    memberSince: admin.createdAt
                },
                overview: {
                    totalStudents,
                    totalTeachers,
                    totalCourses,
                    totalBatches,
                    activeEnrollments,
                    revenueThisMonth: revenueThisMonth[0]?.totalRevenue || 0,
                    pendingApprovals: pendingApprovals // ✅ Now this is a number
                },
                // recentActivity: recentActivity,
                popularCourses: popularCourses.map(course => ({
                    _id: course._id.toString(),
                    name: course.name,
                    enrollmentCount: course.enrollmentCount,
                    revenue: course.revenue || 0
                })),
                recentUsers: recentUsers.map(user => ({
                    _id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    joinedDate: user.createdAt
                })),
                systemHealth: systemHealth,
                quickActions: [
                    {
                        action: "Create Course",
                        endpoint: "/api/courses",
                        description: "Add a new course to the system",
                        icon: "📚"
                    },
                    {
                        action: "Create Batch",
                        endpoint: "/api/batches",
                        description: "Create a new batch for a course",
                        icon: "👥"
                    },
                    {
                        action: "Manage Users",
                        endpoint: "/api/users",
                        description: "View and manage all users",
                        icon: "👨‍💼"
                    },
                    {
                        action: "View Reports",
                        endpoint: "/api/reports",
                        description: "Check enrollment and performance reports",
                        icon: "📊"
                    },
                    {
                        action: "Create Exam",
                        endpoint: "/api/exams",
                        description: "Schedule a new exam",
                        icon: "📝"
                    },
                    {
                        action: "Mark Attendance",
                        endpoint: "/api/attendance",
                        description: "Take attendance for batches",
                        icon: "✅"
                    }
                ],
                profileCompletion: {
                    basicInfo: true,
                    contactInfo: !!admin.contactInfo,
                    profilePicture: admin.profilePicture !== "default-avatar.png",
                    overallPercentage: this.calculateProfileCompletion(admin)
                }
            };
            
            return dashboardData;
        } catch (error) {
            console.error("Error in getAdminDashboard:", error);
            throw error;
        }
    }

    // ✅ FIXED: This method now returns a Promise<number>
    private async getPendingApprovalsCount(): Promise<number> {
        try {
            // Count pending email verifications
            const pendingEmailVerifications = await UserModel.countDocuments({
                isEmailVerified: false
            });

            // You can add more pending items here
            // For example, if you have course approval system:
            // const pendingCourseApprovals = await CourseModel.countDocuments({ status: 'pending' });
            
            return pendingEmailVerifications;
        } catch (error) {
            console.error("Error getting pending approvals count:", error);
            return 0; // Return 0 if there's an error
        }
    }
    // ✅ FIXED: This method now returns a Promise<ISystemHealth>
    private async getSystemHealth(): Promise<any> {
        try {
            // Check database connection
            const dbStatus = await UserModel.findOne() ? "connected" : "disconnected";
            
            // Check storage (mock - you can implement actual storage check)
            const storageUsage = "2.3GB/10GB";
            
            // Get active users (users active in last 15 minutes)
            // If you don't have lastActive field, use createdAt as fallback
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
            const activeUsers = await UserModel.countDocuments({
                $or: [
                    { lastActive: { $gte: fifteenMinutesAgo } },
                    { createdAt: { $gte: fifteenMinutesAgo } } // fallback
                ]
            });

            return {
                serverStatus: "healthy",
                databaseStatus: dbStatus,
                activeUsers: activeUsers || 0,
                storageUsage: storageUsage,
                lastChecked: new Date()
            };
        } catch (error) {
            console.error("Error getting system health:", error);
            return {
                serverStatus: "healthy",
                databaseStatus: "error",
                activeUsers: 0,
                storageUsage: "Unknown",
                lastChecked: new Date()
            };
        }
    }

    // Helper method to calculate profile completion percentage
    private calculateProfileCompletion(user: any): number {
        let completedFields = 0;
        const totalFields = 3; // name/email, contactInfo, profilePicture

        // Basic info (name, email) is always completed during registration
        completedFields += 1;

        // Check contact info
        if (user.contactInfo && user.contactInfo.trim() !== '') {
            completedFields += 1;
        }

        // Check profile picture
        if (user.profilePicture && user.profilePicture !== "default-avatar.png") {
            completedFields += 1;
        }

        return Math.round((completedFields / totalFields) * 100);
    }
}
