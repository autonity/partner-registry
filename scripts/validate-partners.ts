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

function validatePartnerInfo(partnerPath: string): void {
    const infoPath = path.join(partnerPath, 'info.json');

    if (!fs.existsSync(infoPath)) {
        throw new Error(`info.json is missing in ${partnerPath}`);
    }

    const partnerInfo: Partner = JSON.parse(fs.readFileSync(infoPath, 'utf8'));

    requiredFields.forEach((field) => {
        if (!partnerInfo[field]) {
            throw new Error(`${field} is missing in ${infoPath}`);
        }
    });

    // check for logo.png in the partner directory
    const logoPath = path.join(partnerPath, 'logo.png');
    if (!fs.existsSync(logoPath)) {
        throw new Error(`logo.png is missing in ${partnerPath}`);
    }

    // Check for character limits and valid types
    validatePartnerFields(partnerInfo);

    console.log(`✅ ${infoPath}`);
}

function validatePartnerFields(partner: Partner): void {
    if (partner.name.length > nameLimit) {
        throw new Error(`'name' exceeds ${nameLimit} characters: ${partner.name}`);
    }

    if (partner.shortDescription.length > shortDescriptionLimit) {
        throw new Error(`'shortDescription' exceeds ${shortDescriptionLimit} characters: ${partner.shortDescription}`);
    }

    if (partner.longDescription.length > longDescriptionLimit) {
        throw new Error(`'longDescription' exceeds ${longDescriptionLimit} characters: ${partner.longDescription}`);
    }

    if (!Array.isArray(partner.tags) || partner.tags.length === 0) {
        throw new Error(`'tags' should be a non-empty array: ${partner.tags}`);
    }

    if(partner.tags.length > maxNumberOfTags) {
        throw new Error(`'tags' should not contain more than ${maxNumberOfTags} tags: ${partner.tags}`);
    }

    for (let tag of partner.tags) {
        if (tag.length > tagCharacterLimit) {
            throw new Error(`'tag' exceeds ${tagCharacterLimit} characters: ${tag}`);
        }
    }

    try {
        const urlObject = new URL(partner.url);
        if (urlObject.protocol !== 'https:') {
            throw new Error(`'url' should be an HTTPS URL: ${partner.url}`);
        }
    } catch (error) {
        throw new Error(`'url' is not a valid URL: ${partner.url}`);
    }
}

getPartnerDirectories().forEach((partnerPath) => {
    try {
        validatePartnerInfo(partnerPath);
    } catch (error) {
        console.log('Failed')
        console.error(error);
        process.exit(1);
    }
});