export interface IStudentPerformance {
    student: {
        _id: string;
        name: string;
        email: string;
        contactInfo: string;
    };
    attendance: {
        totalClasses: number;
        presentClasses: number;
        absentClasses: number;
        attendancePercentage: number;
    };
    exams: {
        examName: string;
        marksObtained: number;
        totalMarks: number;
        percentage: number;
        grade: string;
        date: Date;
    }[];
    overallPerformance: {
        totalExams: number;
        averageMarks: number;
        averagePercentage: number;
        totalMarksObtained: number;
        grades: { [key: string]: number };
    };
}

export interface IBatchPerformance {
    batch: {
        _id: string;
        name: string;
        course: {
            _id: string;
            name: string;
        };
        teacher: {
            _id: string;
            name: string;
            email: string;
        };
    };
    attendance: {
        totalClasses: number;
        averageAttendance: number;
        studentStats: {
            studentId: string;
            studentName: string;
            presentClasses: number;
            totalClasses: number;
            percentage: number;
        }[];
    };
    exams: {
        examName: string;
        averageMarks: number;
        highestMarks: number;
        lowestMarks: number;
        totalStudents: number;
    }[];
    overallStats: {
        totalStudents: number;
        averagePerformance: number;
        topPerformer?: { // FIX: Made optional
            studentId: string;
            studentName: string;
            averagePercentage: number;
        };
    };
}

export interface ICourseEnrollmentReport {
    course: {
        _id: string;
        name: string;
        description: string;
        duration: number;
        fees: number;
    };
    enrollments: {
        total: number;
        active: number;
        completed: number;
        pending: number;
    };
    batches: {
        batchId: string;
        batchName: string;
        studentCount: number;
        teacherName: string;
    }[];
    revenue: {
        potential: number;
        collected: number;
    };
}