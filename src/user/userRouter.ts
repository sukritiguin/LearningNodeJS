// eslint-disable @typescript-eslint/no-unused-vars */
import express from "express";
import {
    createUser,
    loginUser,
    verifyEmail,
    refreshAccessToken,
    logout,
} from "./userController";

const userRouter = express.Router();

userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/verify-email", verifyEmail);
userRouter.post("/refresh-access-token", refreshAccessToken);
userRouter.post("/logout", logout);

export default userRouter;
