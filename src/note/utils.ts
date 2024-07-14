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


import { S3Client } from "@aws-sdk/client-s3";
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

export { uploadFileToS3 };
