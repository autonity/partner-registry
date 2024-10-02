import fs from "fs-extra";
import path from "path";
import { Partner } from "./interface";

const partnerManifest = "info.json";
const partnerDir = "../partners";
const logoPath = "logo.png";
const partnerStorageName = "partners.json";
const examplePartnerName = "example";
/**
 * Reads all the directories inside the partners directory and returns their path as an array
 * @returns {string[]} Array of paths to the directories inside the partners directory
 */
export function getPartnerDirectories(): string[] {
    try {
        const partnersDir = path.join(__dirname, partnerDir);
        if (!fs.existsSync(partnersDir)) {
            console.error("Partners directory does not exist");
            return [];
        }

        // gets all the directories in the partners directory, filters out {examplePartnerName}
        return fs
            .readdirSync(partnersDir)
            .map((dir) => path.join(partnersDir, dir))
            .filter(
                (dir) => dir !== path.join(partnersDir, examplePartnerName)
            );
    } catch (error) {
        console.error("Error reading partner directories:", error);
        return [];
    }
}

/**
 * Checking function that checks if a string is a valid HTTPS URL and that it has an extension of .png, jpg, .webp or .svg
 * @param {string} url - URL to check
 * @returns {boolean} - true if the URL is valid, false otherwise
 */
export function isValidLogoUrl(url: string): boolean {
    try {
        if (!url) {
            return false;
        }
        const validExtensions = [".png", ".jpg", ".webp", ".svg"];
        const urlObj = new URL(url);
        const extension = path.extname(urlObj.pathname);
        return (
            urlObj.protocol === "https:" && validExtensions.includes(extension)
        );
    } catch (error) {
        console.error("Error validating logo URL:", error);
        return false;
    }
}

/**
 * gets given a partner json file, returns the partner object, adds logo path to the object
 * @param {string} partnerPath - path to the partner directory where the logo and the json file is
 * @returns {Partner} - partner object or null if an error occurs
 */
export function getPartnerObject(partnerPath: string): Partner | null {
    try {
        const partnerJsonPath = path.join(partnerPath, partnerManifest);
        const partner = fs.readJsonSync(partnerJsonPath) as Partner;

        // Check if logo.png exists in the partner directory
        const logo = path.join(partnerPath, logoPath);
        if (fs.existsSync(logo)) {
            partner.logo = logoPath; // we dont want to store the full path, just the name, then we can pull the logo from github
        } else {
            throw new Error(`No valid logo provided for ${partner.name}`);
        }

        partner.featured = false;
        return partner;
    } catch (error) {
        console.error(`Error processing partner in ${partnerPath}:`, error);
        return null;
    }
}

export function generatePartnerList(): Partner[] {
    const partnerDirectories = getPartnerDirectories();
    return buildPartnersJson(partnerDirectories);
}

/**
 * Generates a JSON array of partner objects from the partners directory array
 * @returns {Partner[]} - array of partner objects
 */
export function buildPartnersJson(partnerDirectories: string[]): Partner[] {
    try {
        const partners = partnerDirectories
            .map(getPartnerObject)
            .filter((partner) => partner !== null) as Partner[];
        return partners;
    } catch (error) {
        console.error("Error generating partners JSON:", error);
        return [];
    }
}

/**
 * Stores the partner list in a JSON file
 * @param {Partner[]} partners - array of partner objects
 * @returns {void}
 */
export function storePartners(partners: Partner[]): void {
    try {
        const storagePath = path.join(__dirname, partnerStorageName);
        fs.writeJsonSync(storagePath, partners);
    } catch (error) {
        console.error("Error storing partners JSON:", error);
    }
}

storePartners(generatePartnerList());
