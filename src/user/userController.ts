import { User } from './userTypes';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Response, Request } from "express"
import createHttpError from "http-errors"
import bcrypt from "bcrypt"
import userModel from "./userModel";
import {config} from "../config/config";
import { sign } from "jsonwebtoken";


const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const {name, email, password} = req.body;
    if(!name || !email || !password) {
        const error = createHttpError(400, "All fields are required")
        return next(error);
    }

    try {
            const user = await userModel.findOne({email: email})
        
            if(user){
                const error = createHttpError(400, "User already exists with the same email")
                return next(error);
            }
    }catch(error){
        const err = createHttpError(500, "Error while getting user")
        return next(err);
    }

        const saltRounds = parseInt(config.saltOrRounds, 10)
        const hashedPassword = await bcrypt.hash(password, saltRounds)
    

    let newUser: User;

    try{
        newUser = await userModel.create({
            name: name,
            email: email,
            password: hashedPassword,
        })
    }catch(error){
        const err = createHttpError(500, "Error while creating user")
        return next(err)
    }
    
    try{
        // Token Generation
        const token = sign({sub: newUser._id}, config.jwtSecret as string, {expiresIn: '7d'})
    
        res.status(201).json({
            "message": "User created successfully",
            "userID": newUser._id,
            "userEmail": newUser.email,
            "accessToken": token,
        })
    } catch (error) {
        const err = createHttpError(500, "Something went wrong while generating token or while sending response")
        return next(err);
    }
}

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return next(createHttpError(400, "Both fields are required."));
    }


    let user;
    try{
        user = await userModel.findOne({ email: email });

    }catch(err) {
        return next(createHttpError(400, "Email is not registed."))
    }

    if(user === null) {
        return next(createHttpError(404, "User not found."))
    }

    let isMatch = false;
    try{
    isMatch = await bcrypt.compare(password, user.password);
    }catch(err) {
        return next(createHttpError(500, "Unable to compare password."))
    }

    if(isMatch === false) {
        return next(createHttpError(401, "User not authenticated."))
    }

    try{
        const token = sign({sub: user._id}, config.jwtSecret as string, {expiresIn: '7d'});

        res.json({
            "message": "Login successful",
            "accessToken": token,
        })
    }catch(err) {
        return next(createHttpError(500, "Something went wrong."))
    }
}

export {createUser, loginUser};