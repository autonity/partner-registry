export interface Partner {
    name: string;
    shortDescription: string;
    longDescription: string;
    tags: string[];
    url: string;
}

export interface YamlPartner { 
    name: string;
    short_description: string;
    long_description: string;
    tags: string[];
    url: string;
}

/**
 * Converts a YamlPartner object into a Partner object.
 *
 * @param {YamlPartner} yamlPartner - The YamlPartner object to convert.
 * @returns {Partner} - The converted Partner object with additional fields.
 */
export const convertYamlPartnerToPartner = (yamlPartner: YamlPartner): Partner => {
    return {
        name: yamlPartner.name,
        shortDescription: yamlPartner.short_description,
        longDescription: yamlPartner.long_description,
        tags: yamlPartner.tags,
        url: yamlPartner.url,
    };
}
