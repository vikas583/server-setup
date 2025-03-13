
export function stringAvatar(name: string){
    let updatedName = name?.trim().replace(/\s+/g, ' ')?.toUpperCase()
    return {
        children: `${updatedName?.split(' ')[0][0]}${updatedName?.split(' ')[1][0]}`,
    };
};

export function formatString(input:string) {
    return input
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
export function truncateString(input: string, maxLength: number = 30): string {    
    if (input?.length <= maxLength) {
        return input;
    }
    return input.substring(0, maxLength - 3) + '...';
}
export function replaceUnderscoresWithSpaces(input: string): string {
    return input
        .replace(/_/g, " ")
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}