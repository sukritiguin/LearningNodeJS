/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import path from "node:path";
import fs from "node:fs";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";

import bookModel from "./book.model";
import cloudinary from "../config/cloudinary";
import { config } from "../config/config";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre } = req.body;

    const files = req.files as { [filename: string]: Express.Multer.File[] };

    const coverImageMimeType = files.coverImage[0].mimetype;
    const coverIMageFileName = files.coverImage[0].filename;
    const coverImageFilePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        coverIMageFileName
    );

    const coverFileMimeType = files.file[0].mimetype;
    const fileName = files.file[0].filename;
    const filePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        fileName
    );

    let uploadCoverResult, uploadFileResult;
    try {
        uploadCoverResult = await cloudinary.uploader.upload(
            coverImageFilePath,
            {
                filename_override: coverIMageFileName,
                folder: "book-covers",
                format: coverImageMimeType.split("/").at(-1),
            }
        );
    } catch (error) {
        next(
            createHttpError(
                500,
                "Something went wrong while uploading cover image."
            )
        );
    }

    try {
        uploadFileResult = await cloudinary.uploader.upload(filePath, {
            resource_type: "raw",
            filename_override: fileName,
            folder: "book-pdfs",
            format: coverFileMimeType.split("/").at(-1),
        });
    } catch (error) {
        next(
            createHttpError(500, "Something went wrong while uploading file.")
        );
    }

    // Get userId from refreshToken available on cookies
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return next(
            createHttpError(400, "Refresher token not found or expired.")
        );
    }

    const decoded = jwt.verify(refreshToken, config.jwtSecret as string) as {
        id: string;
    };

    const authorId = decoded.id;

    const newBook = bookModel.create({
        title: title,
        genre: genre,
        author: authorId,
        coverImage: uploadCoverResult?.secure_url,
        file: uploadFileResult?.secure_url,
    });

    // delete the temporary file that is stored in the local storage

    await fs.promises.unlink(coverImageFilePath);
    await fs.promises.unlink(filePath);

    res.status(201).json({
        message: "Book is created successfully.",
        resource_id: (await newBook)._id,
    });
};

export { createBook };
