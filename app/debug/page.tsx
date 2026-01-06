'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

export default function DebugPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [user, setUser] = useState<any>(null);

    const log = (msg: string, data?: any) => {
        setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1]} - ${msg} ${data ? JSON.stringify(data) : ''}`]);
    };

    useEffect(() => {
        const run = async () => {
            log('Starting Debug...');

            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            log('Supabase Client created.');
            log('URL: ' + process.env.NEXT_PUBLIC_SUPABASE_URL);

            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (!user) {
                log('ERROR: No User logged in!');
                return;
            }

            log('User Found:', user.id);

            // 1. Check Notifications Table
            const { data: notifs, error: notifError, count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact' })
                .eq('user_id', user.id);

            if (notifError) {
                log('ERROR Fetching Notifications:', notifError);
            } else {
                log(`Notifications Found: ${notifs?.length} (Total Count: ${count})`);
                if (notifs && notifs.length > 0) {
                    log('Sample Notification:', notifs[0]);
                } else {
                    // Try fetching ANY notification to check RLS
                    const { count: totalNotifs } = await supabase.from('notifications').select('*', { count: 'exact', head: true });
                    log(`Global Notifications Count (Head check): ${totalNotifs}`);
                }
            }

            // 2. Check Follows
            const { data: follows, error: followError } = await supabase
                .from('follows')
                .select('*')
                .eq('follower_id', user.id);

            if (followError) {
                log('ERROR Fetching Follows:', followError);
            } else {
                log(`Follows Found: ${follows?.length}`);
            }

            log('Debug Complete.');
        };

        run();
    }, []);

    return (
        <div style={{ padding: '40px', background: '#000', color: '#0f0', minHeight: '100vh', fontFamily: 'monospace' }}>
            <h1>Debug Console</h1>
            <div>
                <strong>User:</strong> {user ? user.id : 'Not Logged In'}
            </div>
            <hr style={{ borderColor: '#333' }} />
            <pre style={{ whiteSpace: 'pre-wrap' }}>
                {logs.join('\n')}
            </pre>
        </div>
    );
}
