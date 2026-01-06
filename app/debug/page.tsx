import { getSupabaseServerClient } from '@/src/lib/supabase-server';

export default async function DebugPage() {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    let logs = [];
    logs.push(`Server Time: ${new Date().toISOString()}`);

    if (!user) {
        logs.push('ERROR: No User logged in (Server Side)!');
        return <Pre logs={logs} />;
    }

    logs.push(`User Found: ${user.id}`);
    logs.push(`User Role: ${user.role}`);

    // 1. Check Notifications Table
    const { data: notifs, error: notifError, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

    if (notifError) {
        logs.push(`ERROR Fetching Notifications: ${JSON.stringify(notifError)}`);
    } else {
        logs.push(`Notifications Found: ${notifs?.length} (Total Count: ${count})`);
        if (notifs && notifs.length > 0) {
            logs.push(`Sample Notification: ${JSON.stringify(notifs[0], null, 2)}`);
        }
    }

    // 2. Check Follows
    const { data: follows, error: followError } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id);

    if (followError) {
        logs.push(`ERROR Fetching Follows: ${JSON.stringify(followError)}`);
    } else {
        logs.push(`Follows Found: ${follows?.length}`);
    }

    return (
        <div style={{ padding: '40px', background: '#000', color: '#0f0', minHeight: '100vh', fontFamily: 'monospace' }}>
            <h1>Server-Side Debug Console</h1>
            <div><strong>User:</strong> {user.id}</div>
            <hr style={{ borderColor: '#333' }} />
            <pre style={{ whiteSpace: 'pre-wrap' }}>
                {logs.join('\n\n')}
            </pre>
        </div>
    );
}

function Pre({ logs }: { logs: string[] }) {
    return (
        <div style={{ padding: '40px', background: '#000', color: '#f00', minHeight: '100vh', fontFamily: 'monospace' }}>
            <h1>Server-Side Debug Console (Error)</h1>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{logs.join('\n\n')}</pre>
        </div>
    );
}
