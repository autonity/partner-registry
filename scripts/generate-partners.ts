import { examplePartnerName, partnerDir, partnerFileName, partnerStorageName } from "./constants";
import fs from "fs-extra";
import path from "path";
import { Partner } from "./interface";
import { isPartner } from "./validate-partners";
import { getJsonfromYaml } from "./translation-layer";


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
export function getPartnerObject(partnerPath: string): Partner {
    try {
        const partner = getJsonfromYaml(partnerPath);      
       
        partner.featured = false;
        return partner;
    } catch (error) {        
        throw new Error(`Invalid partner object for ${partnerPath}`);
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
        console.log('number of partners:', partnerDirectories.length);
        const partners = partnerDirectories.map((path:string) => getPartnerObject(`${path}/${partnerFileName}`));
        
            
        return partners;
    } catch (error) {        
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
