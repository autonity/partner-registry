import * as fs from 'fs';
import * as path from 'path';
import { getPartnerDirectories, getPartnerObject } from './generate-partners';
import sharp from 'sharp';
import { Partner } from './interface';
import { maxThumbnailWidth, maxThumbnailHeight, nameLimit, shortDescriptionLimit, longDescriptionLimit, maxNumberOfTags, tagCharacterLimit, defaultThumbnailName, defaultBannerName, partnerFileName, maxBannerWidth, maxBannerHeight } from './constants';

const requiredFields: (keyof Partner)[] = ['name', 'shortDescription', 'longDescription', 'tags', 'url'];

/**
 * Type guard to check if an object conforms to the Partner interface.
 * 
 * @param {any} obj - The object to be checked.
 * @returns {obj is Partner} - Returns true if the object matches the Partner interface.
 */
export function isPartner(obj: any): obj is Partner {
    return typeof obj.name === 'string' &&
        typeof obj.shortDescription === 'string' &&
        typeof obj.longDescription === 'string' &&
        Array.isArray(obj.tags) && obj.tags.every((tag: string) => typeof tag === 'string') &&
        typeof obj.url === 'string' &&
        typeof obj.featured === 'boolean';
}

/**
 * Validates partner information found at the given path.
 * 
 * @param {string} partnerPath - The path to the partner directory.
 * @returns {Promise<string[]>} - Returns a promise that resolves with an array of error messages.
 */
export async function validatePartnerInfo(partnerPath: string): Promise<string[]> {

    const fullPartnerPath = path.join(partnerPath, partnerFileName);
    const fullThumbnailPath = path.join(partnerPath, defaultThumbnailName);
    const fullBannerPath = path.join(partnerPath, defaultBannerName);

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

        // check images
        if (!fs.existsSync(fullThumbnailPath)) {
            errorMessages.push(`Thumbnail image is missing`);
        }

        if(!fs.existsSync(fullBannerPath)) { 
            errorMessages.push(`Banner image is missing`)
        }

        if(!fullThumbnailPath.endsWith('.png')) {
            errorMessages.push(`Thumbnail image is not a PNG`)
        }

        if(!fullBannerPath.endsWith('.png')) {
            errorMessages.push(`Banner image is not a PNG`)
        }

        errorMessages = errorMessages.concat(await checkImageDimensions(fullThumbnailPath, maxThumbnailWidth, maxThumbnailHeight));
        errorMessages = errorMessages.concat(await checkImageDimensions(fullBannerPath, maxBannerWidth, maxBannerHeight));

        // Check for character limits and valid types
        validatePartnerFields(partnerInfo, errorMessages);

        return errorMessages
    } catch (error) {
        errorMessages.push(`${partnerFileName} contains invalid data in ${partnerPath}`);
        return errorMessages;
    }
}

/**
 * Checks the dimensions of the partner's logo.
 * 
 * @param {string} filePath - The file path to the image.
 * @returns {Promise<string[]>} - Returns a promise that resolves with an array of error messages if the image is invalid.
 */
async function checkImageDimensions(filePath: string, maxWidth = maxThumbnailWidth, maxHeight = maxThumbnailHeight): Promise<string[]> {
    const errorMessages: string[] = [];
    try {
        const { width, height } = await sharp(filePath).metadata();

        if (!width || !height) {
            errorMessages.push(`image metadata could not be read for ${filePath}`);
        } else if (width > maxWidth || height > maxHeight) {
            errorMessages.push(`image dimensions exceed ${maxWidth}x${maxHeight} pixels`);
        }
    } catch (error) {
        errorMessages.push('Error reading image metadata');
    } finally {
        return errorMessages;
    }
}

/**
 * Validates partner fields such as name, description, tags, and URL.
 * 
 * @param {Partner} partner - The partner object to be validated.
 * @param {string[]} errorMessages - An array of error messages that will be appended to if any validations fail.
 * @returns {void}
 */
export function validatePartnerFields(partner: Partner, errorMessages: string[]): void {
    if (partner.name.length > nameLimit) {
        errorMessages.push(`'name' exceeds ${nameLimit} characters`);
    }

    if (partner.shortDescription.length > shortDescriptionLimit) {
        errorMessages.push(`'short_description' exceeds ${shortDescriptionLimit} characters`);
    }

    if (partner.longDescription.length > longDescriptionLimit) {
        errorMessages.push(`'long_description' exceeds ${longDescriptionLimit} characters`);
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

    if(partner.url) {
    try {
        console.log('partner url call', partner.url)
        console.log(URL)
        const urlObject = new URL(partner.url);
        if (urlObject.protocol !== 'https:') {
            errorMessages.push(`'url' should be a HTTPS`);
        }
    } catch (error) {
        errorMessages.push(`'url' is not a valid URL`);
    }
}
}

/**
 * Retrieves partner directories and validates the partner info for each directory.
 * Logs any error messages found during validation.
 */
export async function processAllPartners() {
    const partnerDirectories = getPartnerDirectories();

    for (const partnerPath of partnerDirectories) {
        try {
            const errorMessages = await validatePartnerInfo(partnerPath);
            if (errorMessages.length > 0) {
                console.log(errorMessages.join(',\n').trim());
            }
        } catch (error) {
            console.log('Problem with your submission, please check it carefully and try again.');
        }
    }
}
