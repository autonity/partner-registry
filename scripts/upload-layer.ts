import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import dotenv from 'dotenv'
import { buildPartnersJson, getPartnerDirectories } from './generate-partners'
import { validatePartnerInfo } from './validate-partners'
import path from 'path'
import * as fs from 'fs'
dotenv.config()

const REGION = process.env.REGION ?? ''
const BUCKET_NAME = process.env.BUCKET_NAME ?? ''
const OBJECT_KEY = process.env.OBJECT_KEY ?? ''
const ACCOUNT_ID = process.env.ACCOUNT_ID ?? ''

const validationCheck = async (partnerDirectories: string[]) => {
    const results = await Promise.all(
        partnerDirectories.map(validatePartnerInfo),
    )
    return results
}

const uploadFile = async (s3Client: S3Client, filePath: string, key: string) => {
    try {
        const fileStream = fs.createReadStream(filePath)
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileStream,
            ContentType: 'image/png'
        }
        const data = await s3Client.send(new PutObjectCommand(uploadParams))
        console.log(`File uploaded successfully. ETag: ${data.ETag}`)
    } catch (err) {
        process.stderr.write(`Error uploading file: ${err}\n`)
    }
}

const run = async () => {
    const s3Client = new S3Client({
        region: REGION,
        endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.ACCESS_KEY_ID ?? '',
            secretAccessKey: process.env.SECRET_ACCESS_KEY ?? '',
        },
    })

    try {
        console.log('getting directories...')
        const partnerDirectories = getPartnerDirectories()
        console.log('Validating partner info...')
        await validationCheck(partnerDirectories)
        console.log('Proceeding with upload...')
        const partners = buildPartnersJson(partnerDirectories)
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: OBJECT_KEY,
            Body: JSON.stringify(partners),
            ContentType: 'application/json',
        }
        const data = await s3Client.send(new PutObjectCommand(uploadParams))
        console.log(`Partners uploaded. ETag: ${data.ETag}`)

        console.log('Proceeding with image uploads...')
        for (const partnerDir of partnerDirectories) {
            const thumbnail = path.join(partnerDir, 'thumbnail.png')
            const thumbnailKey = `images/${path.basename(partnerDir)}.png`

            const banner = path.join(partnerDir, 'banner.png')
            const bannerKey = `images/${path.basename(partnerDir)}.png`
            
            await uploadFile(s3Client, thumbnail, thumbnailKey)
            await uploadFile(s3Client, banner, bannerKey)
        }
    } catch (err) {
        process.stderr.write(`Error uploading object: ${err}\n`)
        process.exit(1)
    }
}
run()
