/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import path from "node:path";
import fs from "node:fs";
import createHttpError from "http-errors";

import bookModel from "./book.model";
import cloudinary from "../config/cloudinary";
import { getUserId } from "../user/utils";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre } = req.body;

    const files = req.files as { [filename: string]: Express.Multer.File[] };

    console.log(files.coverImage);
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
    const authorId = await getUserId(refreshToken);

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

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre } = req.body;
    const bookId = req.params.bookId;

    const book = await bookModel.findById(bookId);

    if (!book) {
        next(createHttpError(404, "Book not found"));
    }

    const refreshToken = await req.cookies?.refreshToken;

    if (!refreshToken) {
        next(createHttpError(400, "Refresh token not found."));
    }

    if (
        book?.author.toString() !== (await getUserId(refreshToken)).toString()
    ) {
        next(createHttpError(404, "You are not allowed to update this book."));
    }

    const files = req.files as { [filename: string]: Express.Multer.File[] };

    let coverImageMimeType, coverIMageFileName, coverImageFilePath;
    try{
        coverImageMimeType = files.coverImage[0].mimetype;
        coverIMageFileName = files.coverImage[0].filename;
        coverImageFilePath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            coverIMageFileName
        );
    }catch{
        //console.log();
    }


    let coverFileMimeType, fileName, filePath;
    try {
            coverFileMimeType = files.file[0]?.mimetype;
            fileName = files.file[0]?.filename;
            filePath = path.resolve(
                __dirname,
                "../../public/data/uploads",
                fileName
            );
    } catch (error) {
        //console.log();
    }

    let uploadCoverResult, uploadFileResult;
    try {
        uploadCoverResult = await cloudinary.uploader.upload(
            coverImageFilePath || "",
            {
                filename_override: coverIMageFileName,
                folder: "book-covers",
                format: coverImageMimeType?.split("/").at(-1),
            }
        );
    } catch (error) {
        //console.log();
    }

    try {
        uploadFileResult = await cloudinary.uploader.upload(filePath || "", {
            resource_type: "raw",
            filename_override: fileName,
            folder: "book-pdfs",
            format: coverFileMimeType?.split("/").at(-1),
        });
    } catch (error) {
        //console.log();
    }

    const updatedBook = await bookModel.findOneAndUpdate(
        { _id: bookId },
        {
            title: title,
            genre: genre,
            coverImage: uploadCoverResult?.secure_url
                ? uploadCoverResult.secure_url
                : book?.coverImage,
            file: uploadFileResult?.secure_url
                ? uploadFileResult.secure_url
                : book?.file,
        },
        { new: true }
    );

    updatedBook?.save();

    // delete the temporary file that is stored in the local storage

    if(coverImageFilePath)await fs.promises.unlink(coverImageFilePath);
    if(filePath)await fs.promises.unlink(filePath);

    res.status(201).json({
        message: "Book is updated successfully.",
        resource_id: updatedBook?.id,
    });
};

const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
    const books = await bookModel.find();
    res.status(200).json({
        books: books,
    });
}

const getBook = async (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.bookId;
    const book = await bookModel.findById(bookId);

    res.status(200).json({
        'book': book,
    });
}

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const bookId = req.params.bookId;
        const currentUser = await getUserId(req.cookies?.refreshToken || "");
        const book = await bookModel.findById(bookId);

        if(!book){
            return next(createHttpError(404, "Book not found"));
        }

        if(book?.author.toString() !== currentUser.toString()){
            return next(createHttpError("You are not allowed to delete this book"));
        }

        await bookModel.deleteOne({_id: bookId});

        res.status(200).json({'message': 'Book deleted successfully'});
    }catch(err){
        next(err);
    }
}

export { createBook, updateBook, getAllBooks, getBook, deleteBook };