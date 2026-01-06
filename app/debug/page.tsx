import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import ClientHealthCheck from './ClientHealthCheck';

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
    const start = performance.now();
    const supabase = await getSupabaseServerClient();

    // SERVER CHECK 1: AUTH
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const user = session?.user;

    // SERVER CHECK 2: ENV VARS
    const envStatus = {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY // Optional but good to know
    };

    // SERVER CHECK 3: DATABASE & RLS
    // We try to fetch user's own notifications to verify RLS
    let dbStatus = 'pending';
    let dbLatency = 0;
    let dbError = null;
    let notifCount = 0;

    if (user) {
        const dbStart = performance.now();
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        const dbEnd = performance.now();
        dbLatency = Math.round(dbEnd - dbStart);

        if (error) {
            dbStatus = 'fail';
            dbError = error;
        } else {
            dbStatus = 'pass';
            notifCount = count || 0;
        }
    } else {
        dbStatus = 'skipped (no user)';
    }

    const totalLatency = Math.round(performance.now() - start);

    return (
        <div style={{ padding: '40px', background: '#09090b', color: '#e4e4e7', minHeight: '100vh', fontFamily: 'monospace' }}>
            <h1 style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '20px' }}>System Health Dashboard</h1>

            <div style={{ display: 'grid', gap: '20px', maxWidth: '800px' }}>

                {/* 1. SERVER ENVIRONMENT */}
                <Section title="Server Environment">
                    <StatusRow label="NEXT_PUBLIC_SUPABASE_URL" pass={envStatus.url} />
                    <StatusRow label="NEXT_PUBLIC_SUPABASE_ANON_KEY" pass={envStatus.key} />
                    <StatusRow label="Server Latency" value={`${totalLatency}ms`} pass={totalLatency < 500} />
                </Section>

                {/* 2. AUTHENTICATION (SERVER) */}
                <Section title="Server Authentication">
                    <StatusRow label="Session Found" pass={!!session} value={session ? 'YES' : 'NO'} />
                    <StatusRow label="User ID" pass={!!user} value={user?.id || 'N/A'} />
                    <StatusRow label="Role" pass={!!user} value={user?.role || 'N/A'} />
                    {sessionError && <div style={{ color: '#f87171' }}>Error: {sessionError.message}</div>}
                </Section>

                {/* 3. DATABASE CONNECTION (RLS) */}
                <Section title="Database & RLS (Server-Side)">
                    <StatusRow label="Connection Status" pass={dbStatus === 'pass'} value={dbStatus.toUpperCase()} />
                    {dbStatus === 'pass' && (
                        <>
                            <StatusRow label="Read Latency" pass={dbLatency < 500} value={`${dbLatency}ms`} />
                            <StatusRow label="Notifications Accessible" pass={true} value={`${notifCount} found`} />
                        </>
                    )}
                    {dbError && <div style={{ color: '#f87171' }}>DB Error: {JSON.stringify(dbError)}</div>}
                </Section>

                {/* 4. CLIENT CONNECTIVITY */}
                <ClientHealthCheck initialSession={session} />

            </div>
        </div>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div style={{ border: '1px solid #333', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                {title}
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
                {children}
            </div>
        </div>
    );
}

function StatusRow({ label, pass, value }: { label: string, pass: boolean, value?: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#a1a1aa' }}>{label}:</span>
            <span style={{
                fontWeight: 'bold',
                color: pass ? '#4ade80' : '#f87171'
            }}>
                {value || (pass ? 'OK' : 'MISSING')}
            </span>
        </div>
    );
}
