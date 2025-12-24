import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    const supabase = await getSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    redirect(`/profile/${user.id}`);
}
