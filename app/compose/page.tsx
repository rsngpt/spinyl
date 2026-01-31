import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import ComposeForm from './ComposeForm';
import { redirect } from 'next/navigation';

export default async function ComposePage() {
    const supabase = await getSupabaseServerClient();

    // Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/');
    }

    // Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

    return (
        <ComposeForm
            userAvatar={profile?.avatar_url || null}
            username={profile?.username || null}
        />
    );
}
