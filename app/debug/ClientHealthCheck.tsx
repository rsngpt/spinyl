'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export default function ClientHealthCheck({ initialSession }: { initialSession: any }) {
    const [status, setStatus] = useState<'loading' | 'pass' | 'fail'>('loading');
    const [latency, setLatency] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const checkConnection = async () => {
            if (!initialSession?.access_token) {
                setStatus('fail');
                setErrorMsg('No Initial Session provided to client');
                return;
            }

            const start = performance.now();
            try {
                // Use the Direct Client pattern (Memory Only)
                const directClient = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    {
                        global: {
                            headers: {
                                Authorization: `Bearer ${initialSession.access_token}`
                            }
                        },
                        auth: {
                            persistSession: false
                        }
                    }
                );

                const { count, error } = await directClient
                    .from('notifications')
                    .select('*', { count: 'exact', head: true });

                if (error) throw error;

                const end = performance.now();
                setLatency(Math.round(end - start));
                setStatus('pass');
            } catch (err: any) {
                console.error('Client Health Check Failed:', err);
                setStatus('fail');
                setErrorMsg(err.message || 'Unknown error');
            }
        };

        checkConnection();
    }, [initialSession]);

    return (
        <div style={{
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)'
        }}>
            <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#fff' }}>Client-Side Connectivity</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                <div style={{ color: '#aaa' }}>Direct Client Mode:</div>
                <div>✅ Enabled</div>

                <div style={{ color: '#aaa' }}>Session Token:</div>
                <div style={{ color: initialSession ? '#4ade80' : '#f87171' }}>
                    {initialSession ? 'Present' : 'Missing'}
                </div>

                <div style={{ color: '#aaa' }}>Status:</div>
                <div style={{ fontWeight: 'bold', color: status === 'pass' ? '#4ade80' : status === 'fail' ? '#f87171' : '#fbbf24' }}>
                    {status.toUpperCase()}
                </div>

                {latency && (
                    <>
                        <div style={{ color: '#aaa' }}>Latency:</div>
                        <div>{latency}ms</div>
                    </>
                )}

                {errorMsg && (
                    <>
                        <div style={{ color: '#aaa' }}>Error:</div>
                        <div style={{ color: '#f87171' }}>{errorMsg}</div>
                    </>
                )}
            </div>
        </div>
    );
}
