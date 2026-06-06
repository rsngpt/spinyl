import React from 'react';
import ShelfWizard from '../components/shelf/ShelfWizard';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/src/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function Shelf() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch Vibe Server-Side to prevent loading states
  const { data: profile } = await supabase
    .from('profiles')
    .select('vibe')
    .eq('id', user.id)
    .single();

  const initialVibe = profile?.vibe as any;

  return (
    <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <div className="shelf-container">
        <div className="wizard-header">
          <h1 className="wizard-title">
            Discover
          </h1>
          <p className="wizard-subtitle">
            Find your next obsession. Mix genres and artists to curate a personalized playlist just for you.
          </p>
        </div>

        <ShelfWizard initialVibe={initialVibe} />
      </div>
    </main>
  );
}
