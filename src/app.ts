// eslint-disable @typescript-eslint/no-explicit-any */
/* The provided code is a TypeScript file that creates an Express application. Here is a breakdown of
what it does: */
/* eslint-disable @typescript-eslint/no-unused-vars */

// npm install -D @types/jsonwebtoken --legacy-peer-deps

import express, { NextFunction, Request, Response } from "express";
import createHttpError, { HttpError } from "http-errors";
import helmet from "helmet";

import globalErrorHandler from "./middlewares/globalErrorHandler";


import userRouter from "./user/userRouter";
import bookRouter from "./book/book.router";
import noteRouter from "./note/note.router";

import cookieParser from 'cookie-parser';


const app = express();
app.use(express.json());
app.use(cookieParser());

// Helmet configuration
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],  // Consider removing 'unsafe-inline' for stricter security
            objectSrc: ["'none'"],  // Disallow Flash and other plugins
            upgradeInsecureRequests: []  // Upgrade insecure requests to HTTPS
        }
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'no-referrer' },
    xssFilter: true
}));

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
app.use('/api/books', bookRouter);
app.use('/api/notes', noteRouter);


// Global error handler

app.use(globalErrorHandler);

export default app;
