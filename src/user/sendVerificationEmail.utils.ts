/* eslint-disable @typescript-eslint/no-unused-vars */
import nodemailer from 'nodemailer';
import jwt from "jsonwebtoken";

import { config } from '../config/config';

const sendVerificationEmail = async (userId: string, email: string) => {
    const token = jwt.sign(
        {id: userId},
        config.jwtSecret as string,
        {expiresIn: '5m'}
    );

    const transpoter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: config.emailUser,
            pass: config.emailPassword,
        },
    });

    const mailOptions = {
        from: config.emailUser,
        to: email,
        subject: "Email verification for ELIB",
        html: `<p>Please verify your email by clicking on the following link: <a href="http://localhost:5515/api/users/verify-email?token=${token}">Verify Email</a></p>`
    }

    await transpoter.sendMail(mailOptions);
}

export default sendVerificationEmail;