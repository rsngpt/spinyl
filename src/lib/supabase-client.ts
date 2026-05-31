import { createBrowserClient } from '@supabase/ssr';

let browserClient: any = null;

export function getBrowserClient() {
    if (typeof window === 'undefined') return null;

    if (browserClient) return browserClient;

    // Sanitize cookies & localStorage before initializing the client to prevent crashes
    try {
        const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (urlEnv) {
            const projectId = urlEnv.split('//')[1]?.split('.')[0];
            if (projectId) {
                const tokenKey = `sb-${projectId}-auth-token`;

                // 1. Sanity check LocalStorage
                const rawLocal = localStorage.getItem(tokenKey);
                if (rawLocal) {
                    try {
                        const parsed = JSON.parse(rawLocal);
                        if (typeof parsed !== 'object' || parsed === null) {
                            localStorage.removeItem(tokenKey);
                        }
                    } catch (e) {
                        localStorage.removeItem(tokenKey);
                    }
                }

                // 2. Sanity check Cookies (handles chunking)
                const cookies = document.cookie.split(';');
                let isCorrupted = false;
                const chunks: { [key: string]: string } = {};
                let hasAuthCookie = false;

                cookies.forEach(cookie => {
                    const parts = cookie.trim().split('=');
                    const name = parts[0];
                    const val = parts.slice(1).join('=');
                    if (name && name.startsWith(tokenKey)) {
                        hasAuthCookie = true;
                        chunks[name] = decodeURIComponent(val || '');
                    }
                });

                if (hasAuthCookie) {
                    // Check if it's chunked or single
                    const sortedKeys = Object.keys(chunks).sort((a, b) => {
                        const aSuffix = a.split('.').pop() || '';
                        const bSuffix = b.split('.').pop() || '';
                        const aNum = parseInt(aSuffix, 10);
                        const bNum = parseInt(bSuffix, 10);
                        if (isNaN(aNum) && isNaN(bNum)) return 0;
                        if (isNaN(aNum)) return -1;
                        if (isNaN(bNum)) return 1;
                        return aNum - bNum;
                    });

                    let combinedValue = '';
                    if (sortedKeys.length === 1 && !sortedKeys[0].includes('.')) {
                        combinedValue = chunks[sortedKeys[0]];
                    } else {
                        sortedKeys.forEach(k => {
                            if (k.includes('.')) {
                                combinedValue += chunks[k];
                            }
                        });
                    }

                    if (combinedValue) {
                        try {
                            let decoded = combinedValue;
                            if (combinedValue.startsWith('base64-')) {
                                decoded = atob(combinedValue.substring(7));
                            } else if (!combinedValue.startsWith('{') && !combinedValue.startsWith('[')) {
                                try {
                                    let base64 = combinedValue.replace(/-/g, '+').replace(/_/g, '/');
                                    while (base64.length % 4) {
                                        base64 += '=';
                                    }
                                    decoded = atob(base64);
                                } catch (err) {
                                    // ignore and try raw
                                }
                            }
                            const parsed = JSON.parse(decoded);
                            if (typeof parsed !== 'object' || parsed === null || !parsed.access_token) {
                                isCorrupted = true;
                            }
                        } catch (e) {
                            isCorrupted = true;
                        }
                    } else {
                        isCorrupted = true;
                    }
                }

                if (isCorrupted) {
                    console.warn('Detected corrupted/truncated Supabase session cookies. Cleaning up...');
                    cookies.forEach(cookie => {
                        const name = cookie.trim().split('=')[0];
                        if (name && name.startsWith(`sb-${projectId}`)) {
                            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${window.location.hostname}`;
                            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
                        }
                    });
                    localStorage.removeItem(tokenKey);
                }
            }
        }
    } catch (e) {
        console.error('Error during cookie sanitization:', e);
    }

    browserClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    return browserClient;
}
