/* eslint-disable @typescript-eslint/no-unused-vars */
// ⁡⁣⁣⁢𝘜𝘴𝘪𝘯𝘨 𝘨𝘭𝘰𝘣𝘢𝘭 𝘦𝘳𝘳𝘰𝘳 𝘩𝘢𝘯𝘥𝘭𝘦𝘳⁡

import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import { config } from "../config/config";

const globalErrorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        message: err.message,
        errorStack: config.env === 'development' ? err.stack : ''
    })
}

export default globalErrorHandler