import React from 'react';
import { getHotTakeById, getHotTakeComments } from '../../actions/hot_takes';
import { notFound } from 'next/navigation';
import FeedHotTake from '../../components/feed/FeedHotTake';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import HotTakeComments from '../../components/feed/HotTakeComments';
import { getSupabaseServerClient } from '@/src/lib/supabase-server';

export default async function HotTakePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getHotTakeById(id);

    if (!data) {
        notFound();
    }

    const { item, comments } = data;

    // Get current user for comment posting permissions/avatar
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userProfile = null;
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        userProfile = profile;
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 16px 100px 16px' }}>
            {/* Header */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link href="/feed" style={{ display: 'flex', alignItems: 'center', color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '50%' }}>
                    <ArrowLeft size={20} />
                </Link>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Hot Take</h2>
            </div>

            {/* The Hot Take Card */}
            {/* We'll pass a flag to FeedHotTake to disable the comment link and maybe show just the count */}
            <div style={{ marginBottom: '24px' }}>
                <FeedHotTake item={item} isDetailView={true} />
            </div>

            {/* Full Comments Section */}
            <HotTakeComments
                hotTakeId={item.id}
                initialComments={comments}
                user={user}
                userProfile={userProfile}
            />
        </div>
    );
}
