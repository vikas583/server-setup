export function replaceBlobUrl(shortCode: string, originalUrl: string): string {

    const baseUrl = `${process.env.BLOB_BASE_URL}/${process.env.AZURE_CONTAINER_NAME}/${shortCode}`

    if (originalUrl.startsWith(baseUrl)) {
        const blobPath = originalUrl.slice(baseUrl.length + 1); // Extract everything after the base URL
        return `${process.env.BACKEND_URL}/documents/view?blobPath=${(blobPath)}`;
    }

    // Return the original URL if it doesn't match the expected base URL
    return originalUrl;
}
