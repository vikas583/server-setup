import { randomBytes } from 'crypto';

export function generateAccountKey(): string {
    const [seconds, nanoseconds] = process.hrtime();
    const randomPart = randomBytes(16).toString('hex');
    return `${seconds}-${nanoseconds}-${randomPart}`;
}
