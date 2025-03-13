export const validateAlphabetic = (value?:string) => {
    const regex = /^[A-Za-z]+$/;
    if (!value) return true;
    return regex.test(value) || "Only alphabetic characters are allowed";
};
export const validateAlphaNumbers = (value?:string) => {
    const regex = /^[a-zA-Z0-9 ]+$/;
    if (!value) return true;
    return regex.test(value) || "Only contain letters and numbers";
};
export const validateAlphabeticWithSpace = (value?:string) => {
    const regex = /^[A-Za-z ]+$/;
    if (!value) return true;
    return regex.test(value) || "Only alphabetic characters are allowed";
};