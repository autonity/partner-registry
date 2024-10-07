import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';
import { getPartnerDirectories, getPartnerObject } from './generate-partners';
import sharp from 'sharp';
import { Partner } from './interface';
import { maxImageWidth, maxImageHeight, nameLimit, shortDescriptionLimit, longDescriptionLimit, maxNumberOfTags, tagCharacterLimit, defaultLogoName, partnerFileName } from './constants';



const requiredFields: (keyof Partner)[] = ['name', 'shortDescription', 'longDescription', 'tags', 'url'];

//type guard
export function isPartner(obj: any): obj is Partner {
    return typeof obj === 'object' &&
        typeof obj.name === 'string' &&
        typeof obj.short_description === 'string' &&
        typeof obj.long_description === 'string' &&
        Array.isArray(obj.tags) && obj.tags.every((tag: string) => typeof tag === 'string') &&
        typeof obj.url === 'string' &&
        typeof obj.featured === 'boolean' &&
        typeof obj.logo === 'string';
}

export async function validatePartnerInfo(partnerPath: string): Promise<string[]> {

    const fullPartnerPath = path.join(partnerPath, partnerFileName);
    const fullLogoPath = path.join(partnerPath, defaultLogoName);
    let errorMessages: string[] = [];

    if (!fs.existsSync(fullPartnerPath)) {
        errorMessages.push(`${partnerFileName} is missing in ${partnerPath}`);
        return errorMessages;
    }

    try {
        const partnerInfo = getPartnerObject(fullPartnerPath);
        requiredFields.forEach((field) => {
            if (!partnerInfo[field]) {
                errorMessages.push(`${field} is missing in ${fullPartnerPath}`);
            }
        });

        if (!fs.existsSync(fullLogoPath)) {
            errorMessages.push(`logo.png is missing in ${partnerPath}`);
        }

        errorMessages = errorMessages.concat(await checkImageDimensions(fullLogoPath));
        // Check for character limits and valid types
        validatePartnerFields(partnerInfo, errorMessages);

        return errorMessages
    } catch (error) {
        errorMessages.push(`${partnerFileName} contains invalid data in ${partnerPath}`);
        return errorMessages;
    }
}

async function checkImageDimensions(filePath: string): Promise<string[]> {
    const errorMessages: string[] = [];
    try {
        const { width, height } = await sharp(filePath).metadata();

        if (!width || !height) {
            errorMessages.push('image metadata could not be read');
        } else if (width > maxImageWidth || height > maxImageHeight) {
            errorMessages.push(`image dimensions exceed ${maxImageWidth}x${maxImageHeight} pixels`);
        }
    } catch (error) {
        errorMessages.push('Error reading image metadata');
    } finally {
        return errorMessages;
    }
}

export function validatePartnerFields(partner: Partner, errorMessages: string[]): void {
    if (partner.name.length > nameLimit) {
        errorMessages.push(`'name' exceeds ${nameLimit} characters`);
    }

    if (partner.shortDescription.length > shortDescriptionLimit) {
        errorMessages.push(`'shortDescription' exceeds ${shortDescriptionLimit} characters`);
    }

    if (partner.longDescription.length > longDescriptionLimit) {
        errorMessages.push(`'longDescription' exceeds ${longDescriptionLimit} characters`);
    }

    if (!Array.isArray(partner.tags) || partner.tags.length === 0) {
        errorMessages.push(`'tags' should be a non-empty array`);
    }

    if (partner.tags.length > maxNumberOfTags) {
        errorMessages.push(`'tags' should not contain more than ${maxNumberOfTags} tags`);
    }

    for (let tag of partner.tags) {
        if (tag.length > tagCharacterLimit) {
            errorMessages.push(`'tag' exceeds ${tagCharacterLimit} characters`);
        }
    }

    try {
        const urlObject = new URL(partner.url);
        if (urlObject.protocol !== 'https:') {
            errorMessages.push(`'url' should be a HTTPS`);
        }
    } catch (error) {
        errorMessages.push(`'url' is not a valid URL`);
    }
}

getPartnerDirectories().forEach((partnerPath) => {
    validatePartnerInfo(partnerPath).then((errorMessages) => {
        if (errorMessages.length > 0) {
            console.log(errorMessages.join(',\n').trim());
        }
    }).catch((error) => {
        console.log('Problem with your submission, please check it carefully and try again.')
    }
    );
});