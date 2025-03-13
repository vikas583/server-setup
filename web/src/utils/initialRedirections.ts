import { UserInitialSteps } from "../types";

const initialRedirection = (nextStep: UserInitialSteps) => {
    if (nextStep === UserInitialSteps.SETUP_MFA) {
        return '/mfa-setup';
    } else if (nextStep === UserInitialSteps.UPDATE_USER_INITIALS) {
        return '/initial-setup';
    } else if (nextStep === UserInitialSteps.UPDATE_BILLING_DETAILS) {
        return '/billing-setup';
    } else if (nextStep === UserInitialSteps.SETUP_PASSWORD) {
        return '/set-password';
    } else if (nextStep === UserInitialSteps.SETUP_DONE) {
        return '/thankyou';
    } else if (nextStep === UserInitialSteps.OPEN_DASHBOARD) {
        return '/dashboard';
    } else {
        return '/mfa-verification';
    }
};

export default initialRedirection;