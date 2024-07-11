// eslint-disable @typescript-eslint/no-unused-vars */
import express from "express";
import { createUser, loginUser, verifyEmail } from "./userController";

const userRouter = express.Router();

userRouter.post('/register', createUser);
userRouter.post('/login', loginUser);
userRouter.get('/verify-email', verifyEmail);

export default userRouter;