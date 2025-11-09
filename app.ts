import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


const swaggerPath = path.join(__dirname, "./swagger.json");
const swaggerDocument = require(swaggerPath);

const swaggerDocs = swaggerJSDoc(swaggerDocument);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

import {connectionDb} from "./app/config/dbConfig"
connectionDb()
import  {connectRedis} from "./app/config/redisConfig"
connectRedis()

import {Authrouter} from "./app/router/auth.router"
app.use("/api",Authrouter);
import { Teacherrouter } from "./app/router/teacher.router";
app.use("/api",Teacherrouter)
import { Courserouter } from "./app/router/course.router";
app.use("/api",Courserouter)
import { Batchrouter } from "./app/router/batch.router";
app.use("/api",Batchrouter)
import { Enrollmentrouter } from "./app/router/enrollment.router";
app.use("/api",Enrollmentrouter)
import { Attendancerouter } from "./app/router/attendance.router";
app.use("/api",Attendancerouter)
import { ExamResultrouter } from "./app/router/examResult.router";
app.use("/api",ExamResultrouter)
import { Examrouter } from "./app/router/exam.router";
app.use("/api",Examrouter)
import { Reportrouter } from './app/router/report.router';
app.use('/api', Reportrouter);
import {Dashboardrouter} from "./app/router/dashboard.router"
app.use("/api",Dashboardrouter)
import { Userrouter } from "./app/router/user.router";
app.use("/api", Userrouter);
import { Verificationrouter } from "./app/router/verification.router";
app.use("/api",Verificationrouter);

app.listen(5001,()=>{
    console.log("Server port is 5001")
})