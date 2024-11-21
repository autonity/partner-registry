// __tests__/validatePartnerInfo.test.ts
import { longDescriptionLimit, maxBannerHeight, maxBannerWidth, maxNumberOfTags, maxThumbnailHeight, maxThumbnailWidth, nameLimit, shortDescriptionLimit, tagCharacterLimit } from '../scripts/constants';

import fs from "fs-extra";
import mockFs from 'mock-fs';
import sharp from 'sharp';
import { validatePartnerInfo } from '../scripts/validate-partners'; // Adjust the path as needed

jest.mock('sharp');
jest.mock("fs-extra");
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
    featured: false
    `,
    'banner.png': 'fake-image-data',
    'thumbnail.png': 'fake-image-data',
    }
    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterEach(() => {
        mockFs.restore();
    });

    it('should return an an array of error messages with one message, if path does not exist', async () => {
        const errors = await validatePartnerInfo(partnerPath);
        expect(errors).toEqual([`info.yaml is missing in ${partnerPath}`]);
    }
    );

    it('should error if a required field is missing', async () => {
        mockFs({
            [partnerPath]: {
                'info.yaml': `
                name: "Mock Partner"
                badge: "mockBadge"
                short_description: "Mock short description"
                long_description: "Mock long description"
                tags:
                  - "mock"
                  - "partner"
                featured: false
                `,
                'banner.png': 'fake-image-data',
                'thumbnail.png': 'fake-image-data',
            }
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({ width: 100, height: 100 }),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);
        expect(errors).toEqual([`url is missing in ${partnerPath}/info.yaml`]);
    })

    it('should error if unable to find images', async () => {

        const imagesMissing = {
            'info.yaml': `
        name: "Mock Partner"
        badge: "mockBadge"
        short_description: "Mock short description"
        long_description: "Mock long description"
        tags:
          - "mock"
          - "partner"
        url: "https://mockpartner.com"
        featured: false
        `
        }

        mockFs({
            [partnerPath]: imagesMissing,
            
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({ width: 100, height: 100 }),
        } as any);


        const errors = await validatePartnerInfo(partnerPath);
        expect(errors).toEqual(["Thumbnail image is missing", "Banner image is missing"]);
    });

    it('should log to the user an error if unable to read image dimensions', async () => {

        mockFs({
            [partnerPath]: mockResults,
            
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({}),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);
        expect(errors).toEqual(["image metadata could not be read for /path/to/partner/thumbnail.png", "image metadata could not be read for /path/to/partner/banner.png"]);
    });

    it('should log to the user an error if unable to read image metadata', async () => {

        mockFs({
            [partnerPath]: mockResults,
            
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockImplementation(() => {
                throw new Error('Error reading image metadata');
            }),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);
        expect(errors).toEqual(["Error reading image metadata","Error reading image metadata"]);
    });
    

    it('should return an a log to the user if the name exceeds a character length', async () => {
        const mockResults =  {
            'info.yaml': `
        name: "Mock Partner really long name that exceeds the character limit"
        badge: "mockBadge"
        short_description: "Mock short description"
        long_description: "Mock long description"
        tags:
          - "mock"
          - "partner"
        url: "https://mockpartner.com"
        featured: false
        `,
        'banner.png': 'fake-image-data',
        'thumbnail.png': 'fake-image-data',
        }
        mockFs({
            [partnerPath]: mockResults,
            
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({ width: 100, height: 100 }),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);
        expect(errors).toEqual([`'name' exceeds ${nameLimit} characters`]);
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
            metadata: jest.fn().mockResolvedValue({ width: 100, height: 100 }),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);

        expect(errors).toHaveLength(0);
    });

    it('should return an error if tag char limit is reached', async () => {
        const badTags =  {
            'info.yaml': `
            name: "Mock Partner"
            badge: "mockBadge"
            short_description: "Mock short description"
            long_description: "Mock long description"
            tags:
            - "mock"
            - "partner with long tags"
            url: "https://mockpartner.com"
            featured: false
            `,
            'banner.png': 'fake-image-data',
            'thumbnail.png': 'fake-image-data',
            }
        mockFs({
            [partnerPath]: badTags
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({ width: 100, height: 100 }),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);
        expect(errors).toEqual([`'tag' exceeds ${tagCharacterLimit} characters`]);
    });

    it('should return an error for invalid attributes in info.yaml', async () => {
        
        mockFs({
            [partnerPath]: {
                'info.yaml': {}
            }
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({ width: 100, height: 100 }),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);
        expect(errors).toEqual( ["info.yaml contains invalid data in /path/to/partner"]);
    });

    it('should error if image (banner) dimensions are too big', async () => {
        mockFs({
            [partnerPath]: mockResults
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({ width: 280, height: 105 }),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);
        const expectedErrors = [`image dimensions exceed ${maxThumbnailWidth}x${maxThumbnailHeight} pixels`]
        expect(errors).toEqual(expectedErrors);

    });

    it('should return an a log to the user if the long description exceeds a character length', async () => {
        const mockResults =  {
            'info.yaml': `
        name: "name"
        badge: "mockBadge"
        short_description: "Mock short description"
        long_description: "This is a really long description that exceeds the character limit so that we can indeed test the way in which the script handles descriptions that indeed do exceed expectations."
        tags:
          - "mock"
          - "partner"
        url: "https://mockpartner.com"
        featured: false
        `,
        'banner.png': 'fake-image-data',
        'thumbnail.png': 'fake-image-data',
        }
        mockFs({
            [partnerPath]: mockResults,
            
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({ width: 100, height: 100 }),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);
        expect(errors).toEqual([`'long_description' exceeds ${longDescriptionLimit} characters`]);
    });
    
    it('should return an a log to the user if the short description exceeds a character length', async () => {
        const mockResults =  {
            'info.yaml': `
        name: "name"
        badge: "mockBadge"
        short_description: "This is a really long description that exceeds the character limit so that we can indeed test the way in which the script handles descriptions that indeed do exceed expectations."
        long_description: "long desc"
        tags:
          - "mock"
          - "partner"
        url: "https://mockpartner.com"
        featured: false
        `,
        'banner.png': 'fake-image-data',
        'thumbnail.png': 'fake-image-data',
        }
        mockFs({
            [partnerPath]: mockResults,
            
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({ width: 100, height: 100 }),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);
        expect(errors).toEqual([`'short_description' exceeds ${shortDescriptionLimit} characters`]);
    });

    it('Partner must have atleast one tag', async () => {
        const mockResults =  {
            'info.yaml': `
        name: "name"
        badge: "mockBadge"
        short_description: "short desc"
        long_description: "long desc"
        tags: []
        url: "https://mockpartner.com"
        featured: false
        `,
        'banner.png': 'fake-image-data',
        'thumbnail.png': 'fake-image-data',
        }
        mockFs({
            [partnerPath]: mockResults,
            
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({ width: 100, height: 100 }),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);
        expect(errors).toEqual([`'tags' should be a non-empty array`]);
    });

    it('should not exceed the maximum number of tags', async () => {
        const mockResults =  {
        'info.yaml': `
        name: "name"
        badge: "mockBadge"
        short_description: "short desc"
        long_description: "long desc"
        tags: 
            - tag 1
            - tag 2
            - tag 3
            - tag 4
            - tag 5
            - tag 6
        url: "https://mockpartner.com"
        featured: false
        `,
        'banner.png': 'fake-image-data',
        'thumbnail.png': 'fake-image-data',
        }
        mockFs({
            [partnerPath]: mockResults,
            
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({ width: 100, height: 100 }),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);
        expect(errors).toEqual([`'tags' should not contain more than ${maxNumberOfTags} tags`]);
    });

    it('should log if provided url is not https', async () => {
        const mockResults =  {
        'info.yaml': `
        name: "name"
        badge: "mockBadge"
        short_description: "short desc"
        long_description: "long desc"
        tags: 
            - tag 1
            - tag 2
            - tag 3
        url: "http://mockpartner.com"
        featured: false
        `,
        'banner.png': 'fake-image-data',
        'thumbnail.png': 'fake-image-data',
        }
        mockFs({
            [partnerPath]: mockResults,
            
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({ width: 100, height: 100 }),
        } as any);

        const errors = await validatePartnerInfo(partnerPath);
        expect(errors).toEqual([`'url' should be a HTTPS`]);
    });

    it('should log if it couldn\'t parse the url', async () => {
        const mockResults =  {
            'info.yaml': `
            name: "name"
            badge: "mockBadge"
            short_description: "short desc"
            long_description: "long desc"
            tags: 
                - tag 1
                - tag 2
                - tag 3
            url: "https://forcefail.com"
            featured: false
            `,
            'banner.png': 'fake-image-data',
            'thumbnail.png': 'fake-image-data',
            }
        
        mockFs({
            [partnerPath]: mockResults,
            
        });

        mockedSharp.mockReturnValue({
            metadata: jest.fn().mockResolvedValue({ width: 100, height: 100 }),
        } as any);
            
        const originalURL = global.URL; // Save original URL
        //@ts-ignore
        global.URL = jest.fn(() => {
            console.log('Mocked URL constructor called');
            throw new Error("Invalid URL");
        });

        const errors = await validatePartnerInfo(partnerPath);
        console.log('Errors:', errors);
        
        expect(errors).toEqual([`'url' is not a valid URL`]);

        global.URL = originalURL;
    });
    
});
