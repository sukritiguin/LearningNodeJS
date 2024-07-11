// eslint-disable @typescript-eslint/no-explicit-any */
/* The provided code is a TypeScript file that creates an Express application. Here is a breakdown of
what it does: */
/* eslint-disable @typescript-eslint/no-unused-vars */

// npm install -D @types/jsonwebtoken --legacy-peer-deps

import express, { NextFunction, Request, Response } from "express";
import createHttpError, { HttpError } from "http-errors";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";
import cookieParser from 'cookie-parser';


const app = express();
app.use(express.json());
app.use(cookieParser());

// ⁡⁣⁣⁢𝘙𝘰𝘶𝘵𝘦𝘴⁡
app.get("/", (req, res, next) => {
    //Creating and throwing error
    const error = createHttpError(400, "Something went wrong");
    throw error;

    res.json({
        name: "Sukriti",
        college: "Netaji Subhash Engineering College",
    });
});


// User router

app.use('/api/users' ,userRouter);

// Global error handler

app.use(globalErrorHandler);

export default app;
