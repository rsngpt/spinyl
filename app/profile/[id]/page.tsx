import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import { notFound } from 'next/navigation';
import ProfileContent from '@/app/components/ProfileContent';
import Link from 'next/link';
import { Metadata } from 'next';
import ProfileHeader from '@/app/components/ProfileHeader';
import LogoutButton from '@/app/components/LogoutButton';

// Generate Metadata
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    const { data: profile } = await supabase.from('profiles').select('username, full_name').eq('id', id).single();

    return {
        title: profile ? `${profile.full_name || profile.username || 'User'} | Spinyl` : 'Profile | Spinyl',
    };
}

export default async function ProfilePage({ 
    params, 
    searchParams 
}: { 
    params: { id: string }; 
    searchParams: { tab?: string }; 
}) {
    const { id } = await params;
    const { tab } = await searchParams;
    const supabase = await getSupabaseServerClient();

    // 1. Fetch User Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (!profile) {
        // Recovery Logic:
        // If the profile is missing, but the ID matches the currently logged-in user (from the session),
        // we should send them to onboarding to recreate it (Zombie Account fix).
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id === id) {
            const { redirect } = await import('next/navigation');
            redirect('/onboarding');
        }

        return notFound();
    }

    // 2. Fetch Stats (Parallel)
    const [
        { count: followersCount },
        { count: followingCount },
        { count: reviewsCount },
        { data: reviews },
        { data: { user: currentUser } }
    ] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', id),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', id),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', id),
        supabase.from('reviews').select(`
            id, rating, review_text, created_at,
            albums (spotify_id, name, cover_image, artists)
        `).eq('user_id', id).order('created_at', { ascending: false }),
        supabase.auth.getUser()
    ]);

    // Fetch Like Counts and Status for Reviews
    const reviewsWithLikes = await Promise.all(reviews?.map(async (review: any) => {
        const { count } = await supabase
            .from('review_likes')
            .select('*', { count: 'exact', head: true })
            .eq('review_id', review.id);

        let isLiked = false;
        if (currentUser) {
            const { data } = await supabase
                .from('review_likes')
                .select('*')
                .eq('review_id', review.id)
                .eq('user_id', currentUser.id)
                .single();
            isLiked = !!data;
        }

        return {
            ...review,
            likes_count: count || 0,
            is_liked_by_user: isLiked
        };
    }) || []);

    // 3. Check if Current User Follows This Profile
    let isFollowing = false;
    if (currentUser) {
        const { data: followCheck } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', currentUser.id)
            .eq('following_id', id)
            .single();
        isFollowing = !!followCheck;
    }

    const isOwnProfile = currentUser?.id === id;

    // 4. Fetch Followers/Following Lists (Only if Own Profile)
    let followersList = null;
    let followingList = null;

    if (isOwnProfile) {
        // Fetch Followers (People who follow me)
        const { data: rawFollowers, error: followersError } = await supabase
            .from('follows')
            .select(`
                follower_id,
                profiles!follows_follower_id_fkey ( id, username, avatar_url, is_verified )
            `)
            .eq('following_id', id);

        // Fetch Following (People I follow)
        const { data: rawFollowing, error: followingError } = await supabase
            .from('follows')
            .select(`
                following_id,
                profiles!follows_following_id_fkey ( id, username, avatar_url, is_verified )
            `)
            .eq('follower_id', id);

        if (followersError) console.error('Followers Error:', followersError);
        if (followingError) console.error('Following Error:', followingError);

        const myFollowingIds = new Set(rawFollowing?.map((f: any) => f.following_id));

        followersList = rawFollowers?.map((f: any) => ({
            user_data: f.profiles,
            is_followed_by_current_user: myFollowingIds.has(f.follower_id)
        })) || [];

        followingList = rawFollowing?.map((f: any) => ({
            user_data: f.profiles,
            is_followed_by_current_user: true
        })) || [];
    }

    // Display Name Logic
    const displayName = profile.full_name || profile.username || 'Music Lover';
    const avatarUrl = profile.avatar_url;
    const isVerified = profile.is_verified;

    return (
        <div className="profile-page-wrapper">
            <div className="profile-page-container">
                {/* Left Column: Profile Info */}
                <aside className="profile-sidebar">
                    <ProfileHeader
                        profile={profile}
                        stats={{
                            reviewsCount,
                            followersCount,
                            followingCount
                        }}
                        isOwnProfile={isOwnProfile}
                        currentUser={currentUser}
                        targetUserId={id}
                        isFollowing={isFollowing}
                    />

                </aside>

                {/* Right Column: Content */}
                <main style={{ flex: 1, minWidth: 0, width: '100%' }}>
                    <ProfileContent
                        reviews={reviewsWithLikes}
                        followersList={followersList}
                        followingList={followingList}
                        isOwnProfile={isOwnProfile}
                        currentUserId={currentUser?.id}
                        initialTab={tab}
                    />
                </main>
            </div>

            {/* Logout Button (Fixed Position Root Level) */}
            {isOwnProfile && <LogoutButton />}
        </div>
    );
}
