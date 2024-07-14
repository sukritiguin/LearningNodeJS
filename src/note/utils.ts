// import { PutObjectCommand } from '@aws-sdk/client-s3';
// import { configAWSS3 } from '../config/aws-config';

// import {s3} from "./note.middleware";


// interface UploadParams {
//   Bucket: string;
//   Key: string;
//   Body: Buffer | Uint8Array | Blob | string | ReadableStream;
//   ContentType: string;
// }

// const uploadFileToS3 = async (params: UploadParams): Promise<string> => {
//   const { Bucket, Key, Body, ContentType } = params;

//   const command = new PutObjectCommand({
//     Bucket,
//     Key,
//     Body,
//     ContentType,
//   });

//   try {
//     await s3.send(command);
//     return `https://${Bucket}.s3.${configAWSS3.region}.amazonaws.com/${Key}`;
//   } catch (error) {
//     console.error('Error uploading file to S3:', error);
//     throw error;
//   }
// };

// export {uploadFileToS3, UploadParams};


import { S3Client, DeleteObjectCommand, ListObjectVersionsCommand  } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";

import {configAWSS3} from "../config/aws-config";

const s3 = new S3Client({
    region: configAWSS3.region as string,
    credentials: {
      accessKeyId: configAWSS3.access_key as string,
      secretAccessKey: configAWSS3.secret_key as string,
    }
});

const uploadFileToS3 = async (
  bucket: string,
  key: string,
  filePath: string,
  contentType: string,
  options?: {
    // Optional parameters
    partSize?: number;
    queueSize?: number;
    leavePartsOnError?: boolean;
  }
): Promise<string> => {
  try {
    const s3Client = s3;

    // Read file as stream
    const fileStream = fs.createReadStream(filePath);

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: fileStream,
        ContentType: contentType,
        ContentDisposition: 'inline',
      },
      partSize: options?.partSize || 5 * 1024 * 1024, // 5MB part size
      queueSize: options?.queueSize || 4, // Number of concurrent uploads
      leavePartsOnError: options?.leavePartsOnError || false,
    });

    upload.on("httpUploadProgress", (progress) => {
      console.log(`Progress: ${progress.loaded} bytes`);
    });

    await upload.done();

    console.log(`File uploaded successfully: ${key}`);
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};

// Function to delete an object from S3 bucket
const deleteObjectFromS3 = async (bucketName: string, objectKey: string) => {
    try {
        const params = {
            Bucket: bucketName,
            Key: objectKey,
        };

        const command = new DeleteObjectCommand(params);
        const data = await s3.send(command);
        console.log("Object deleted successfully:", data);
        return data; // Optionally return data or a success message
    } catch (error) {
        console.error("Error deleting object:", error);
        throw error; // Handle the error as per your application's needs
    }
};

const getObjectKeyFromS3Url = (url: string) => {
    // Split the URL by '/'
    const parts = url.split('/');
    
    // The object key will be the last part of the URL
    const objectKey = parts[parts.length - 1];
    
    return objectKey;
}

// Function to delete all versions of an object from S3 bucket
const deleteAllVersionsOfObjectFromS3 = async (bucketName: string, objectKey: string) => {
    try {
        // List all versions and delete markers of the object
        const listVersionsCommand = new ListObjectVersionsCommand({
            Bucket: bucketName,
            Prefix: objectKey,
        });
        const versions = await s3.send(listVersionsCommand);

        if (versions.Versions || versions.DeleteMarkers) {
            const objectsToDelete = [];
            if (versions.Versions) {
                for (const version of versions.Versions) {
                    objectsToDelete.push({
                        Key: objectKey,
                        VersionId: version.VersionId
                    });
                }
            }

            if (versions.DeleteMarkers) {
                for (const deleteMarker of versions.DeleteMarkers) {
                    objectsToDelete.push({
                        Key: objectKey,
                        VersionId: deleteMarker.VersionId
                    });
                }
            }

            for (const obj of objectsToDelete) {
                const deleteParams = {
                    Bucket: bucketName,
                    Key: obj.Key,
                    VersionId: obj.VersionId,
                };
                const deleteCommand = new DeleteObjectCommand(deleteParams);
                const data = await s3.send(deleteCommand);
                console.log("Version or delete marker deleted successfully:", data);
            }
        } else {
            console.log("No versions or delete markers found for the object.");
        }

        console.log("All versions and delete markers of the object deleted successfully.");
    } catch (error) {
        console.error("Error deleting object versions and delete markers:", error);
        throw error; // Handle the error as per your application's needs
    }
};


export { uploadFileToS3, getObjectKeyFromS3Url, deleteObjectFromS3, deleteAllVersionsOfObjectFromS3 };
