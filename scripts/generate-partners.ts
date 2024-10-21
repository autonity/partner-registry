import { examplePartnerName, partnerDir, partnerFileName, partnerStorageName } from "./constants";
import fs from "fs-extra";
import path from "path";
import { Partner } from "./interface";
import { getJsonfromYaml } from "./translation-layer";
import { isPartner } from "./validate-partners";


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
        const validExtensions = [".png"];
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
        return partner;
    } catch (error) {
        throw new Error(`Invalid partner object for ${partnerPath}`);
    }
}

/**
 * Generates a JSON array of partner objects from the partners directory array
 * @returns {Partner[]} - array of partner objects
 */
export function buildPartnersJson(partnerDirectories: string[]): Partner[] {
    try {
        const partners = partnerDirectories.map((path:string) => getPartnerObject(`${path}/${partnerFileName}`));
        partners.forEach((partner) => {
            if(!isPartner(partner)) {
                throw new Error("Invalid partner object");
            }
        });
        return partners;
    } catch (error) {
        return [];
    }
}
