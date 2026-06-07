import { createBrowserClient } from '@supabase/ssr';

let browserClient: any = null;

export function getBrowserClient() {
    if (typeof window === 'undefined') return null;

    if (browserClient) return browserClient;

    // Rely on @supabase/ssr's internal cookie management. Manual decoding was clearing valid sessions.

    browserClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                // Bypass navigator.locks to prevent deadlocks in React 19/Strict Mode
                lock: async (name, acquireTimeout, fn) => fn(),
            }
        }
    );

    return browserClient;
}
