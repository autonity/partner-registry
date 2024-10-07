// __tests__/validatePartnerInfo.test.ts
import { maxImageHeight, maxImageWidth } from '../scripts/constants';
import { validatePartnerInfo } from '../scripts/validate-partners'; // Adjust the path as needed
import * as path from 'path';
import sharp from 'sharp';
import mockFs from 'mock-fs';

jest.mock('sharp');
describe('validatePartnerInfo', () => {
    const mockedSharp = sharp as jest.MockedFunction<typeof sharp>;
    const partnerPath = '/path/to/partner';
    
    const mockResults =  {
        'info.yaml': `
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
    `,
        'logo.png': 'fake-image-data'
    }
    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterEach(() => {
        mockFs.restore();
    });

    it('should return an error if info.yaml is missing', async () => {
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

        expect(errors).toEqual(["info.yaml is missing in /path/to/partner"]);
    });

    it('should return no errors for valid partner info', async () => {        
        mockFs({
            [partnerPath]: mockResults
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({ width: 125, height: 125 }),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);

        expect(errors).toHaveLength(0);
    });

    it('should return an error for invalid attributes in info.yaml', async () => {
        
        mockFs({
            [partnerPath]: {
                'info.yaml': "name_thing: 'yes'",
                'logo.png': 'fake-image-data',
                'README.md': 'Some readme content'
            }
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({ width: 100, height: 100 }),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);

        expect(errors).toEqual( ["name is missing in /path/to/partner/info.yaml", "shortDescription is missing in /path/to/partner/info.yaml", "longDescription is missing in /path/to/partner/info.yaml", "tags is missing in /path/to/partner/info.yaml", "url is missing in /path/to/partner/info.yaml", "info.yaml contains invalid data in /path/to/partner"]);
    });

    it('should error if image dimensions are too big', async () => {        
        mockFs({
            [partnerPath]: mockResults
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({ width: 126, height: 126 }),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);
        expect(errors).toEqual([`image dimensions exceed ${maxImageWidth}x${maxImageHeight} pixels`]);

    });

});
