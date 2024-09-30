import { getPartnerDirectories } from "./generate-partners";
import { validatePartnerInfo } from "./validate-partners";

getPartnerDirectories().forEach((partnerPath) => {
    validatePartnerInfo(partnerPath).then((errorMessages) => {
        if(errorMessages.length > 0) {
            process.exit(1);
        }
    }).catch(() => {
        process.exit(1);
    }
    );
});