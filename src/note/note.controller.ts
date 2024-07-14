import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import createHttpError from "http-errors";
import { v4 as uuidv4 } from 'uuid';

import { uploadFileToS3, deleteAllVersionsOfObjectFromS3, getObjectKeyFromS3Url } from "./utils";
import { configAWSS3 } from "../config/aws-config";
import { getUserId } from "../user/utils";
import noteModel from "./note.model";

// const createNote = async (req: Request, res: Response, next: NextFunction) => {
//     const { title, genre } = req.body;

//     const files = req.files as { [filename: string]: Express.Multer.File[] };

//     const coverImage = files.coverImage[0];

//     console.log(coverImage);

//     const coverImageFilePath = path.resolve(
//         __dirname,
//         "../../public/data/uploads",
//         coverImage.originalname
//     );
//     const coverImageKey = `coverImages/${Date.now().toString()}-${
//         coverImage.originalname
//     }`;

//     const file = files.file[0];
//     const filePath = path.resolve(
//         __dirname,
//         "../../public/data/uploads",
//         file.originalname
//     );
//     const fileKey = `files/${Date.now().toString()}-${file.originalname}`;

//     let uploadCoverResult, uploadFileResult;
//     try {
//         const _coverImage_params: UploadParams = {
//             Bucket: configAWSS3.bucket as string,
//             Key: coverImageKey,
//             Body: coverImage.buffer,
//             ContentType: coverImage.mimetype as string,
//         };
//         uploadCoverResult = await uploadFileToS3(_coverImage_params);

//         const _file_params: UploadParams = {
//             Bucket: configAWSS3.bucket as string,
//             Key: fileKey,
//             Body: file.buffer,
//             ContentType: file.mimetype as string,
//         };
//         uploadFileResult = await uploadFileToS3(_file_params);
//     } catch (error) {
//         return next(
//             createHttpError(
//                 500,
//                 "Something went wrong while uploading files to S3."
//             )
//         );
//     }

//     const refreshToken = req.cookies?.refreshToken;
//     if (!refreshToken) {
//         return next(
//             createHttpError(400, "Refresher token not found or expired.")
//         );
//     }
//     const currentUser = await getUserId(refreshToken);

//     const newNote = await noteModel.create({
//         title: title,
//         genre: genre,
//         contributor: currentUser,
//         coverImage: uploadCoverResult,
//         file: uploadFileResult,
//     });

//     await newNote.save();

//     if (coverImageFilePath) await fs.promises.unlink(coverImageFilePath);
//     if (filePath) await fs.promises.unlink(filePath);

//     res.status(201).json({
//         message: "Note is created successfully.",
//         resource_id: newNote._id,
//     });
// };

const createNote = async (req: Request, res: Response, next: NextFunction) => {

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
    const coverImageKey = `coverImages/${Date.now().toString()}-${uuidv4()}`;

    const coverFileMimeType = files.file[0].mimetype;
    const fileName = files.file[0].filename;
    const filePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        fileName
    );
    const fileKey = `files/${Date.now().toString()}-${uuidv4()}`;

    const aws_cover_image_path = await uploadFileToS3(configAWSS3.bucket as string, coverImageKey, coverImageFilePath, coverImageMimeType);
    const aws_file_path = await uploadFileToS3(configAWSS3.bucket as string, fileKey, filePath, coverFileMimeType);

    // Get userId from refreshToken available on cookies
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return next(
            createHttpError(400, "Refresher token not found or expired.")
        );
    }
    const authorId = await getUserId(refreshToken);

    const newBook = noteModel.create({
        title: title,
        genre: genre,
        contributor: authorId,
        coverImage: aws_cover_image_path,
        file: aws_file_path,
    });

    // delete the temporary file that is stored in the local storage

    if(coverImageFilePath)await fs.promises.unlink(coverImageFilePath);
    if(filePath)await fs.promises.unlink(filePath);

    res.status(201).json({
        message: "Note is created successfully.",
        resource_id: (await newBook)._id,
    });

}

const deleteNote = async (req: Request, res: Response, next: NextFunction) => {
    const noteId = req.params.noteId;

    const note = await noteModel.findById(noteId);
    
    if(!note) {
        return next(createHttpError(404, 'Note not found.'));
    }

    const refreshToken = req.cookies?.refreshToken;

    const currentUser = await getUserId(refreshToken);

    if(note?.contributor.toString() !== currentUser.toString() ){
        return next(createHttpError(500, 'You are not allowed to delete this note.'));
    }

    const coverImageObjectKey = getObjectKeyFromS3Url(note.coverImage);
    const fileObjectKey = getObjectKeyFromS3Url(note.file);

    try{
        await deleteAllVersionsOfObjectFromS3(configAWSS3.bucket as string, coverImageObjectKey);
        await deleteAllVersionsOfObjectFromS3(configAWSS3.bucket as string, fileObjectKey);
    }catch(error){
        console.log(error);
        return next(createHttpError(500, 'Problem while deleting the files from AWS S3 bucket.'));
    }


    
    try {
        await noteModel.deleteOne({_id: noteId});
    
    } catch (error) {
        console.log(error);
        return next(createHttpError(500, 'Problem while deleting the note object.'));
    }

    res.status(200).json({message: 'Note deleted successfully.'});
}

export { createNote, deleteNote };
