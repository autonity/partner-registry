import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';
import { getPartnerDirectories } from './generate-partners';

interface Partner {
    name: string;
    shortDescription: string;
    longDescription: string;
    tags: string[];
    url: string;
}

const shortDescriptionLimit = 75;
const longDescriptionLimit = 250;
const nameLimit = 40;
const tagCharacterLimit = 20;
const maxNumberOfTags = 5;

const requiredFields: (keyof Partner)[] = ['name', 'shortDescription', 'longDescription', 'tags', 'url'];

export function validatePartnerInfo(partnerPath: string): string[] {
    let errorMessages: string[] = [];
    const infoPath = path.join(partnerPath, 'info.json');
    if (!fs.existsSync(infoPath)) {
        errorMessages.push(`info.json is missing in ${partnerPath}`);
    }

    const partnerInfo: Partner = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
    requiredFields.forEach((field) => {
        if (!partnerInfo[field]) {
            errorMessages.push(`${field} is missing in ${infoPath}`);
        }
    });

    // check for logo.png in the partner directory
    const logoPath = path.join(partnerPath, 'logo.png');
    if (!fs.existsSync(logoPath)) {
        errorMessages.push(`logo.png is missing in ${partnerPath}`);
    }

    // Check for character limits and valid types
    validatePartnerFields(partnerInfo, errorMessages);
    return errorMessages
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

    if(partner.tags.length > maxNumberOfTags) {
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
    try {
        const errorMessages = validatePartnerInfo(partnerPath);
        if(errorMessages.length > 0) {
            console.log(errorMessages.join(',\n').trim());
        }
    } catch (error) {
        console.log('Problem with your submission')
    }
});