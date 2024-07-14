import { config as conf } from "dotenv";

conf();

const _config = {
    access_key: process.env.AWS_IAM_USER_ACCESS_KEY,
    secret_key: process.env.AWS_IAM_USER_SECREAT_KEY,
    bucket: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_S3_ELIBSTORAGE_REGION,
}

export const configAWSS3 = Object.freeze(_config);
