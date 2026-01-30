'use server';

export async function getBase64Image(url: string) {
    if (!url) return { success: false, message: 'No URL provided' };

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/jpeg';

        return {
            success: true,
            data: `data:${mimeType};base64,${base64}`
        };
    } catch (error) {
        console.error('Error in getBase64Image:', error);
        return { success: false, message: 'Failed to convert image' };
    }
}
