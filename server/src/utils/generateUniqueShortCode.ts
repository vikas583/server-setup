import { Account } from '../entity/account'
import { dbConnection } from '../utils/dbConnection'

const generateRandomCode = () => {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    let letterPart = '';
    let digitPart = '';

    for (let i = 0; i < 3; i++) {
        letterPart += letters[Math.floor(Math.random() * letters.length)];
    }
    for (let i = 0; i < 3; i++) {
        digitPart += digits[Math.floor(Math.random() * digits.length)];
    }

    return `${letterPart}${digitPart}`;
}

export async function generateUniqueShortCode(): Promise<string> {


    const dataSource = await dbConnection()
    const accountRepository = dataSource.getRepository(Account);
    let shortCode = '';
    let isUnique = false;


    while (!isUnique) {
        shortCode = generateRandomCode();
        const existingCompany = await accountRepository.findOne({ where: { shortCode } });
        if (!existingCompany) {
            isUnique = true;
        }
    }

    return shortCode;
}
