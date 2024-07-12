// eslint-disable @typescript-eslint/no-unused-vars */
import express from "express";
import {
    createUser,
    loginUser,
    verifyEmail,
    refreshAccessToken,
    logout,
    profileProtectedRouter,
    resendVerificationEmail
} from "./userController";
import {authenticateJWT, checkVerified, checkIfLoggedIn} from "./userMiddleware";

const userRouter = express.Router();

userRouter.post("/register", createUser);
userRouter.post("/login", checkIfLoggedIn, loginUser);
userRouter.get("/verify-email", verifyEmail);
userRouter.post("/refresh-access-token", refreshAccessToken);
userRouter.post("/logout", logout);
userRouter.get(
    "/profile-protecte-route",
    authenticateJWT,
    checkVerified,
    profileProtectedRouter
);
userRouter.post("/resend-verification-email", resendVerificationEmail);

export default userRouter;
