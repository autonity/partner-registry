import { getPartnerDirectories, isValidLogoUrl, getPartnerObject, buildPartnersJson } from "../scripts/generate-partners";
import fs from "fs-extra";
import path from "path";

// Mocking fs-extra functions
jest.mock("fs-extra");

describe("Partners Module", () => {
    const mockPartnerPath = "/mock/partnerPath";
    const validPartner = {
        name: "Mock Partner",
        badge: "mockBadge",
        shortDescription: "Mock short description",
        longDescription: "Mock long description",
        tags: ["mock", "partner"],
        url: "https://mockpartner.com",
        logo: "logo.png",
        featured: false
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getPartnerDirectories", () => {
        it("should return an empty array if the partners directory does not exist", () => {
            jest.spyOn(fs, 'existsSync').mockReturnValue(false);
            
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
    });

    describe("getPartnerObject", () => {        

        it("should return null if the partner JSON is invalid or an error occurs", () => {
            jest.spyOn(fs, 'readJsonSync').mockImplementation(() => { throw new Error("Invalid JSON") });

            const partner = getPartnerObject(mockPartnerPath);
            expect(partner).toBeNull();
        });

        it("should log error and return null if logo URL is invalid and no logo.png exists", () => {
            const invalidLogoPartner = { ...validPartner, logo: "invalid-url" };
            jest.spyOn(fs, 'readJsonSync').mockReturnValue(invalidLogoPartner);
            jest.spyOn(fs, 'existsSync').mockReturnValue(false); // Simulating logo.png does not exist

            const partner = getPartnerObject(mockPartnerPath);
            expect(partner).toBeNull();
        });
    });

    describe("buildPartnersJson", () => {
        it("should build an array of valid partner objects from partner directories", () => {
            const directories = ["/mock/partner1", "/mock/partner2"];
            jest.spyOn(fs, 'readJsonSync').mockReturnValue(validPartner);
            jest.spyOn(fs, 'existsSync').mockReturnValue(true); // Simulating directories exist

            const partners = buildPartnersJson(directories);
            expect(partners).toEqual([validPartner, validPartner]);
        });

        it("should return an empty array if all partners are invalid", () => {
            const directories = ["/mock/partner1", "/mock/partner2"];
            jest.spyOn(fs, 'readJsonSync').mockImplementation(() => { throw new Error("Invalid JSON") });

            const partners = buildPartnersJson(directories);
            expect(partners).toEqual([]);
        });
    });
});
