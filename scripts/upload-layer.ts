import * as fs from 'fs'

import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { buildPartnersJson, getPartnerDirectories } from './generate-partners'

import dotenv from 'dotenv'
import { getJsonfromYaml } from './translation-layer'
import { partnerFileName } from './constants'
import path from 'path'
import { validatePartnerInfo } from './validate-partners'

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

const cleanupUnusedImages = async (s3Client: S3Client, currentPartnerNames: Set<string>) => {
    try {
        const listParams = {
            Bucket: BUCKET_NAME,
            Prefix: 'images/'
        }

        const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams))

        if (!listedObjects.Contents) return

        for (const item of listedObjects.Contents) {
            const key = item.Key ?? ''
            const match = key.match(/^images\/([^/]+)\/.*$/)
            if (match) {
                const partnerName = match[1]
                if (!currentPartnerNames.has(partnerName)) {
                    console.log(`Deleting unused image: ${key}`)
                    await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }))
                }
            }
        }
    } catch (err) {
        process.stderr.write(`Error cleaning up images: ${err}\n`)
    }
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
        const currentPartnerNames = new Set(partners.map(partner => partner.name))

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
            const { name } = getJsonfromYaml(`${partnerDir}/${partnerFileName}`)

            console.log('Uploading images for:', name)

            // Light thumbnail
            const thumbnailLight = path.join(partnerDir, 'thumbnail_light.png')
            const thumbnailLightKey = `images/${name}/thumbnail_light.png`

            // Dark thumbnail
            const thumbnailDark = path.join(partnerDir, 'thumbnail_dark.png')
            const thumbnailDarkKey = `images/${name}/thumbnail_dark.png`

            // Light Banner
            const bannerLight = path.join(partnerDir, 'banner_light.png')
            const bannerLightKey = `images/${name}/banner_light.png`

            // Dark Banner
            const bannerDark = path.join(partnerDir, 'banner_dark.png')
            const bannerDarkKey = `images/${name}/banner_dark.png`

            //upload light thumbnail
            await uploadFile(s3Client, thumbnailLight, thumbnailLightKey)
            //upload dark thumbnail
            await uploadFile(s3Client, thumbnailDark, thumbnailDarkKey)

            //upload light banner
            await uploadFile(s3Client, bannerLight, bannerLightKey)
            //upload dark banner
            await uploadFile(s3Client, bannerDark, bannerDarkKey)
        }

        console.log('Cleaning up unused images...')
        await cleanupUnusedImages(s3Client, currentPartnerNames)
    } catch (err) {
        process.stderr.write(`Error uploading object: ${err}\n`)
        process.exit(1)
    }
}
run()
