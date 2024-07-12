/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "./userTypes";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Response, Request } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import userModel from "./userModel";
import { config } from "../config/config";
import { sign } from "jsonwebtoken";
import jwt, { JwtPayload } from "jsonwebtoken";
import { sendVerificationEmail, generateToken } from "./utils";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        const error = createHttpError(400, "All fields are required");
        return next(error);
    }

    try {
        const user = await userModel.findOne({ email: email });

        if (user) {
            const error = createHttpError(
                400,
                "User already exists with the same email"
            );
            return next(error);
        }
    } catch (error) {
        const err = createHttpError(500, "Error while getting user");
        return next(err);
    }

    const saltRounds = parseInt(config.saltOrRounds, 10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let newUser: User;

    try {
        newUser = await userModel.create({
            name: name,
            email: email,
            password: hashedPassword,
        });
    } catch (error) {
        const err = createHttpError(500, "Error while creating user");
        return next(err);
    }

    try {
        // Token Generation
        const { accessToken, refreshToken } = await generateToken(newUser._id);

        await sendVerificationEmail(newUser._id.toString(), email);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
        });

        res.status(201).json({
            message:
                "User created successfully. Check Email to verify your account",
            userID: newUser._id,
            userEmail: newUser.email,
            verified: newUser.verified,
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    } catch (error) {
        const err = createHttpError(
            500,
            "Something went wrong while generating token or while sending response"
        );
        return next(err);
    }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(createHttpError(400, "Both fields are required."));
    }

    let user;
    try {
        user = await userModel.findOne({ email: email });
    } catch (err) {
        return next(createHttpError(400, "Email is not registed."));
    }

    if (user === null) {
        return next(createHttpError(404, "User not found."));
    }

    let isMatch = false;
    try {
        isMatch = await bcrypt.compare(password, user.password);
    } catch (err) {
        return next(createHttpError(500, "Unable to compare password."));
    }

    if (isMatch === false) {
        return next(createHttpError(401, "User not authenticated."));
    }

    try {
        const { accessToken, refreshToken } = await generateToken(
            user._id.toString()
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
        });

        res.json({
            message: "Login successful",
            accessToken: accessToken,
            refreshToken: refreshToken,
            email: user.email,
            name: user.name,
        });
    } catch (err) {
        return next(createHttpError(500, "Something went wrong."));
    }
};

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.query.token as string;

    if (!token) {
        return next(createHttpError(500, "Token is not provided."));
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret as string) as {
            id: string;
        };
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return next(createHttpError(500, "User not found."));
        }

        if (user.verified) {
            return next(createHttpError(500, "User already verified."));
        }

        user.verified = true;

        await user.save();

        res.status(200).json({
            message: "User is verified.",
            userId: user._id,
            email: user.email,
            verified: user.verified,
        });
    } catch (err) {
        console.log(err);
    }
};

const refreshAccessToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return next(
            createHttpError(400, "Refresher token not found or expired.")
        );
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            config.jwtSecret as string
        ) as { id: string };
        const accessToken = jwt.sign(
            { id: decoded.id },
            config.jwtSecret as string,
            { expiresIn: "15m" }
        );
        res.status(200).json({
            message: "Access token is refreshed",
            accessToken: accessToken,
        });
    } catch (err) {
        return next(err);
    }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("refreshToken");
    res.status(200).json({
        message: "Logout successfully.",
    });
};



const profileProtectedRouter = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.status(200).json({
        message: "This is a protected router.",
        info: "You will get the profile the message only if you are logged in.",
        user: req.user,
    });
};

const resendVerificationEmail = async (req:Request, res:Response, next:NextFunction) => {
    const {email} = req.body;
    if(!email) {
        return next(createHttpError(400, "Email is required."));
    }

    try{
        const user = await userModel.findOne({ email: email });

        if(!user) {
            return next(createHttpError(400, "User is not registered."))
        }

        if(user.verified){
            return next(createHttpError(400, "User is verified."));
        }

        await sendVerificationEmail(user._id.toString(), email);

        res.status(200).json({
            message: "Verification email send check your mail.",
        });
    }catch(err){
        next(err)
    }
}

export {
    createUser,
    loginUser,
    verifyEmail,
    refreshAccessToken,
    logout,
    profileProtectedRouter,
    resendVerificationEmail,
};
