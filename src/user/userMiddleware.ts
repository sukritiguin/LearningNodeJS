/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import { JwtPayload } from "jsonwebtoken";

import { config } from "../config/config";
import userModel from "./userModel";
import { User } from "./userTypes";

const authenticateJWT = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token =
        req.header("Authorization")?.split(" ")[1] || req.cookies.refreshToken;

    if (!token) {
        return next(createHttpError(401, "Authentication failed."));
    }

    jwt.verify(token, config.jwtSecret as string, (err: any, user: any) => {
        if (err) {
            return next(createHttpError(500, "Token verification failed."));
        }
        req.user = user as JwtPayload;
        next();
    });
};

const checkVerified = async (req: Request, res: Response, next: NextFunction) => {
    try{
        let user;
        if(req.body && req.body.id){
            user = await userModel.findById(req.body.id);
        }else{
            const refreshToken = req.cookies?.refreshToken;
            const decoded = jwt.verify(refreshToken, config.jwtSecret as string) as { id: string };
            user = await userModel.findById(decoded.id);
        }

        if(!user) {
            return next(createHttpError(404, "User not found."));
        }

        if(!user.verified){
            return next(createHttpError(403, "User not verified."));
        }

        next();
    }catch(err){
        return next(createHttpError(500, "Internal server error."));
    }
}

const checkIfLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.refreshToken || req.header("Authorization")?.split(" ")[1];

    if(!(token===undefined)){
        try {
            jwt.verify(token, config.jwtSecret as string)

            return res.status(200).json({
                message: 'You are already logged in.',
            })
        }catch(err) {
            if(req.cookies && req.cookies.refreshToken){
                res.clearCookie('refreshToken');
            }else if(req.headers && req.headers.Authorization){
                delete req.headers.Authorization;
            }
            next(createHttpError(500, "Token verification failed. Try to login."));
        }
    }else{
        next();
    }
}

export {authenticateJWT, checkVerified, checkIfLoggedIn};