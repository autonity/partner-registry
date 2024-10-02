import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';
import { getPartnerDirectories } from './generate-partners';
import sharp from 'sharp';
import { error } from 'console';

interface Partner {
    name: string;
    shortDescription: string;
    longDescription: string;
    tags: string[];
    url: string;
}

export const shortDescriptionLimit = 75;
export const longDescriptionLimit = 250;
export const nameLimit = 40;
export const tagCharacterLimit = 20;
export const maxNumberOfTags = 5;
export const maxImageWidth = 125;
export const maxImageHeight = 125;

const requiredFields: (keyof Partner)[] = ['name', 'shortDescription', 'longDescription', 'tags', 'url'];

export async function validatePartnerInfo(partnerPath: string): Promise<string[]> {

    const infoPath = path.join(partnerPath, 'info.json');
    const logoPath = path.join(partnerPath, 'logo.png');
    let errorMessages: string[] = [];

    if (!fs.existsSync(infoPath)) {
        errorMessages.push(`info.json is missing in ${partnerPath}`);
        return errorMessages;
    }

    try {
        const partnerInfo: Partner = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
        requiredFields.forEach((field) => {
            if (!partnerInfo[field]) {
                errorMessages.push(`${field} is missing in ${infoPath}`);
            }
        });

        if (!fs.existsSync(logoPath)) {
            errorMessages.push(`logo.png is missing in ${partnerPath}`);
        }

        errorMessages = errorMessages.concat(await checkImageDimensions(logoPath));
        // Check for character limits and valid types
        validatePartnerFields(partnerInfo, errorMessages);

        return errorMessages
    } catch (error) {
        errorMessages.push(`info.json contains invalid JSON in ${partnerPath}`);
        return errorMessages;
    }
}

async function checkImageDimensions(filePath: string): Promise<string[]> {
    const errorMessages: string[] = [];
    try {
        const { width, height } = await sharp(filePath).metadata();

        if (!width || !height) {
            errorMessages.push('Image metadata could not be read.');
        } else if (width > maxImageWidth || height > maxImageHeight) {
            errorMessages.push(`Image dimensions exceed ${maxImageWidth}x${maxImageHeight} pixels.`);
        }
    } catch (error) {
        errorMessages.push('Error reading image metadata.');
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