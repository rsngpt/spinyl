import React from 'react';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import SettingsContent from '../components/SettingsContent';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch Profile Details
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return (
        <main style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div className="live-gradient-bg" />
            <div style={{ flex: 1, zIndex: 1 }}>
                <SettingsContent user={user} initialProfile={profile} />
            </div>
        </main>
    );
}
