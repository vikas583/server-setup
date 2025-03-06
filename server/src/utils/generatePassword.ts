export function generatePassword(length = 12): string {

    const numbers = '0123456789';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';

    const allChars = numbers + lowercase + uppercase + specialChars;

    let password = '';

    // Ensure the password has at least one character from each category
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Fill the rest of the password length with random characters
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password to randomize character positions
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    return password;
}
