// __tests__/validatePartnerInfo.test.ts

import { validatePartnerInfo, maxImageHeight, maxImageWidth } from '../scripts/validate-partners'; // Adjust the path as needed
import * as path from 'path';
import sharp from 'sharp';
import mockFs from 'mock-fs';

jest.mock('sharp');

describe('validatePartnerInfo', () => {
    const mockedSharp = sharp as jest.MockedFunction<typeof sharp>;
    const partnerPath = '/path/to/partner';

    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterEach(() => {
        mockFs.restore();
    });

    it('should return an error if info.json is missing', async () => {
        mockFs({
            [partnerPath]: {
                'logo.png': 'fake-image-data',
                'README.md': 'Some readme content'
            }
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({ width: 100, height: 100 }),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);

        expect(errors).toContain(`info.json is missing in ${partnerPath}`);
    });

    it('should return no errors for valid partner info', async () => {        
        mockFs({
            [partnerPath]: {
                'info.json': JSON.stringify({
                    name: "Autonity",
                    shortDescription: "A blockchain ",
                    longDescription: "A blockchain platform with Newton as a currency.",
                    tags: ["Autonity", "Blockchain", "Newton", "Explorer"],
                    url: "https://www.autonity.org"
                }),
                'logo.png': 'fake-image-data', // Mock image data as needed
                'README.md': 'Some readme content'
            }
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({ width: 125, height: 125 }),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);

        expect(errors).toHaveLength(0);
    });

    it('should return an error for invalid JSON in info.json', async () => {
        
        mockFs({
            [partnerPath]: {
                'info.json': "{ invalidJson: true, }",
                'logo.png': 'fake-image-data',
                'README.md': 'Some readme content'
            }
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({ width: 100, height: 100 }),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);

        expect(errors).toContain(`info.json contains invalid JSON in ${partnerPath}`);
    });

    it('should error if image dimensions are too big', async () => {        
        mockFs({
            [partnerPath]: {
                'info.json': JSON.stringify({
                    name: "Autonity",
                    shortDescription: "A blockchain ",
                    longDescription: "A blockchain platform with Newton as a currency.",
                    tags: ["Autonity", "Blockchain", "Newton", "Explorer"],
                    url: "https://www.autonity.org"
                }),
                'logo.png': 'fake-image-data', // Mock image data as needed
                'README.md': 'Some readme content'
            }
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({ width: 126, height: 126 }),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);        
        expect(errors).toContain(`Image dimensions exceed ${maxImageWidth}x${maxImageHeight} pixels.`);
    });

});
