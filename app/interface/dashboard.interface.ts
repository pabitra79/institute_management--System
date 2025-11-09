export interface IUserBasicInfo {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    contactInfo?: string;
    memberSince: Date;
}

export interface IProfileCompletion {
    basicInfo: boolean;
    contactInfo: boolean;
    profilePicture: boolean;
    overallPercentage: number;
}

export interface IStudentDashboard {
    student: IUserBasicInfo;
    recentEnrollments: any[];
    upcomingExams: any[];
    attendanceSummary: any;
    recentResults: any[];
    quickStats: any;
    profileCompletion: IProfileCompletion; // NEW
}

export interface ITeacherDashboard {
    teacher: IUserBasicInfo;
    assignedBatches: any[];
    todaysClasses: any[];
    upcomingExams: any[];
    pendingTasks: any[];
    quickStats: any;
    profileCompletion: IProfileCompletion; // NEW
}
export interface IUserBasicInfo {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    contactInfo?: string;
    memberSince: Date;
}

export interface IRecentUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    joinedDate: Date;
}

export interface IProfileCompletion {
    basicInfo: boolean;
    contactInfo: boolean;
    profilePicture: boolean;
    overallPercentage: number;
}

export interface IOverviewStats {
    totalStudents: number;
    totalTeachers: number;
    totalCourses: number;
    totalBatches: number;
    activeEnrollments: number;
    revenueThisMonth: number;
    pendingApprovals: number;
}

export interface ISystemHealth {
    serverStatus: string;
    databaseStatus: string;
    activeUsers: number;
    storageUsage: string;
    lastChecked: Date;
}

export interface IQuickAction {
    action: string;
    endpoint: string;
    description: string;
    icon: string;
}

export interface IAdminDashboard {
    admin: IUserBasicInfo;
    overview: IOverviewStats;
    popularCourses: any[];
    recentUsers: IRecentUser[];
    systemHealth: ISystemHealth;
    quickActions: IQuickAction[];
    profileCompletion: IProfileCompletion;
}