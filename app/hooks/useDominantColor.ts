import { useState, useEffect } from 'react';

export function useDominantColor(imageUrl: string | null) {
    const [color, setColor] = useState<string>('#111'); // Default dark
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!imageUrl) return;

        setLoading(true);
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                canvas.width = 1;
                canvas.height = 1;

                // Draw image resized to 1x1 to get average color
                ctx.drawImage(img, 0, 0, 1, 1);
                const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

                setColor(`rgb(${r},${g},${b})`);
            } catch (e) {
                console.warn('Failed to extract color', e);
                // Fallback / keep default
            } finally {
                setLoading(false);
            }
        };

        img.onerror = () => {
            setLoading(false);
            console.warn('Failed to load image for color extraction');
        };

    }, [imageUrl]);

    return { color, loading };
}
