export const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /or\s+.*?(?:--|=)/i,
    /select.*?from/i,
    /union\s+select/i,
    /--/,
    /'.*?'/,
    /;/
];

export const validateAgainstSuspiciousPatterns = (input: string): boolean => {
    return suspiciousPatterns.some(pattern => pattern.test(input));
}; 