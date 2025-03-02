import { UserAccountView } from './types';

interface AdminInfo {
    id: number;
    name: string;
    email: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            admin?: AdminInfo;
            userId?: number;
            user?: UserAccountView
        }
    }
}
