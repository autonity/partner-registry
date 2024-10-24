import { Part } from "@aws-sdk/client-s3";
import { getPartnerDirectories, isValidLogoUrl, getPartnerObject, buildPartnersJson } from "../scripts/generate-partners";
import { Partner } from "../scripts/interface";
import * as translationLayer from "../scripts/translation-layer";
import fs from "fs-extra";
jest.mock('../scripts/translation-layer');
jest.mock("fs-extra");
describe("Partners Module", () => {
    const mockPartnerPath = "/mock/partnerPath";

    const invalidPartner = {
        name: "Mock Partner",
    }

    const validPartnerJson: Partner = { 
        name: "Mock Partner",
        shortDescription: "Mock short description",
        longDescription: "Mock long description",
        tags: ["mock", "partner"],
        url: "https://mockpartner.com",
    }
    
    const validPartner = `
    name: "Mock Partner"
    badge: "mockBadge"
    short_description: "Mock short description"
    long_description: "Mock long description"
    tags:
      - "mock"
      - "partner"
    url: "https://mockpartner.com"
    logo: "logo.png"
    featured: false
    `;

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getPartnerDirectories", () => {
        it("should return an empty array if the partners directory does not exist", () => {
            jest.spyOn(fs, 'existsSync').mockReturnValue(false);
            
            const directories = getPartnerDirectories();
            expect(directories).toEqual([]);
        });

        it("should return an empty array if an error occurs while reading the file", () => {
            jest.spyOn(fs, 'existsSync').mockImplementation(() => { throw new Error("Error reading partner directories") });
            
            const directories = getPartnerDirectories();
            expect(directories).toEqual([]);
        });
    });
    

    describe("isValidLogoUrl", () => {
        it("should return true for a valid HTTPS URL with a valid extension", () => {
            const validUrl = "https://example.com/logo.png";
            expect(isValidLogoUrl(validUrl)).toBe(true);
        });

        it("should return false for a non-HTTPS URL", () => {
            const invalidUrl = "http://example.com/logo.png";
            expect(isValidLogoUrl(invalidUrl)).toBe(false);
        });

        it("should return false for a URL with an invalid file extension", () => {
            const invalidUrl = "https://example.com/logo.bmp";
            expect(isValidLogoUrl(invalidUrl)).toBe(false);
        });

        it("should return false if URL is not provided", () => {
            expect(isValidLogoUrl("")).toBe(false);
        });

        it("should return false if an error occurs while validating the URL", () => {
            jest.spyOn(global, 'URL').mockImplementation(() => { throw new Error("Invalid URL") });
            expect(isValidLogoUrl("https://example.com/logo.png")).toBe(false);
        });
    });

    describe("getPartnerObject", () => {        

        it("should throw an error if partner object is invalid", () => {
            jest.spyOn(translationLayer, 'getJsonfromYaml').mockImplementation(() => { throw new Error("Invalid JSON") });
            jest.spyOn(fs, 'readJsonSync').mockImplementation(() => { throw new Error("Invalid JSON") });
            expect(() => getPartnerObject(mockPartnerPath)).toThrow("Invalid partner object for /mock/partnerPath");            
        });
    });

    describe("buildPartnersJson", () => {
        it("should build an array of valid partner objects from partner directories", () => {
            const directories = ["/mock/partner1", "/mock/partner2"];
            jest.spyOn(translationLayer, 'getJsonfromYaml').mockReturnValue(validPartnerJson);
            jest.spyOn(fs, 'existsSync').mockReturnValue(true);
            const partners = buildPartnersJson(directories);            
            expect(partners.length).toEqual(2);
        });

        it("should return an empty array if all partners are invalid", () => {
            const directories = ["/mock/partner1", "/mock/partner2"];
            jest.spyOn(translationLayer, 'getJsonfromYaml').mockReturnValue(invalidPartner as unknown as Partner);
            jest.spyOn(fs, 'existsSync').mockReturnValue(true);
            const partners = buildPartnersJson(directories);
            expect(partners).toEqual([]);
        });
    });
});
