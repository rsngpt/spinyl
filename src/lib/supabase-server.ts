import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const value = cookieStore.get(name)?.value;
          // Handle double-stringified cookies (fixes "Cannot create property 'user' on string")
          if (value && value.startsWith('"') && value.endsWith('"')) {
            console.log('[CookieDebug] Found double-quoted cookie:', name);
            try {
              const parsed = JSON.parse(value);
              if (typeof parsed === 'string') {
                console.log('[CookieDebug] Unwrapped cookie value to:', parsed.substring(0, 20) + '...');
                return parsed;
              }
            } catch {
              // Ignore parse errors, return original value
            }
          }
          if (value) console.log('[CookieDebug] Returning raw cookie:', name, value.substring(0, 20) + '...');
          return value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
