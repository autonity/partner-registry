import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { buildPartnersJson, generatePartnerList, getPartnerDirectories, getPartnerObject } from "./generate-partners";
import { validatePartnerInfo } from "./validate-partners";
import { partnerFileName } from "./constants";
const fs = require("fs");
dotenv.config();

const REGION = process.env.REGION ?? "";
const BUCKET_NAME = process.env.BUCKET_NAME ?? "";
const OBJECT_KEY = process.env.OBJECT_KEY ?? "";
const ACCOUNT_ID = process.env.ACCOUNT_ID ?? "";

const validationCheck = async (partnerDirectories: string[]) => { 
    const promise = new Promise((resolve, reject) => {
    //validate
    partnerDirectories.forEach((partnerPath) => {
        validatePartnerInfo(partnerPath).then((errorMessages) => {
            if (errorMessages.length > 0) {
                console.log(errorMessages.join(',\n').trim());
                reject(new Error('Error with partner info'));
            }
            resolve(true);
        }).catch((error) => {
            reject(error)
        }
        );
    });
    });
    return promise;
}

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
        const partnerDirectories = getPartnerDirectories();
        const validationResult = await validationCheck(partnerDirectories);
        if (!validationResult) {
            process.exit(1);
        }
        const partners = buildPartnersJson(partnerDirectories);                
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: OBJECT_KEY,
            Body: JSON.stringify(partners),
            ContentType: "application/json", 
        };
         const data = await s3Client.send(new PutObjectCommand(uploadParams));
         console.log(`Partners updated. ETag: ${data.ETag}`);
    } catch (err) {
        process.stderr.write(`Error uploading object: ${err}\n`);
        process.exit(1);
    }
};

run();
