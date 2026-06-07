import React from 'react';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import SettingsContent from '../components/SettingsContent';

export const dynamic = 'force-dynamic';

export default async function SettingsPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
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

    const resolvedParams = await searchParams;
    const tab = resolvedParams.tab;

    return (
        <main style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: '#000000' }}>
            <div style={{ flex: 1, zIndex: 1 }}>
                <SettingsContent user={user} initialProfile={profile} initialTab={tab} />
            </div>
        </main>
    );
}
