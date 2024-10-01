import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
const fs = require("fs");
dotenv.config();

const REGION = process.env.REGION ?? "";
const BUCKET_NAME = process.env.BUCKET_NAME ?? "";
const OBJECT_KEY = process.env.OBJECT_KEY ?? "";
const FILE_PATH = process.env.FILE_PATH ?? "";
const ACCOUNT_ID = process.env.ACCOUNT_ID ?? "";
const ENDPOINT = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;

const run = async () => {
    const s3Client = new S3Client({
        region: REGION,
        endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.ACCESS_KEY_ID ?? "",
            secretAccessKey: process.env.SECRET_ACCESS_KEY ?? "",
        },
    });

    try {
        const fileStream = fs.createReadStream(FILE_PATH);
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: OBJECT_KEY,
            Body: fileStream,
        };
        const data = await s3Client.send(new PutObjectCommand(uploadParams));
        console.log(`Partners updated. ETag: ${data.ETag}`);
    } catch (err) {
        process.stderr.write(`Error uploading object: ${err}\n`);
        process.exit(1);
    }
};

run();
