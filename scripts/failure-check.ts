import { getPartnerDirectories } from "./generate-partners";
import { validatePartnerInfo } from "./validate-partners";

getPartnerDirectories().forEach((partnerPath) => {
    try {
        const errorMessages = validatePartnerInfo(partnerPath);
        if(errorMessages.length > 0) {
            process.exit(1);
        }
    } catch (error) {
        process.exit(1);
    }
});