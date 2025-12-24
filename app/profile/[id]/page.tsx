import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import { notFound } from 'next/navigation';
import FollowButton from '@/app/components/FollowButton';
import LikeButton from '@/app/components/LikeButton';
import ProfileContent from '@/app/components/ProfileContent';
import Link from 'next/link';
import ProfileEditModal from '@/app/components/ProfileEditModal';
import { Metadata } from 'next';

// Generate Metadata
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const { id } = await params;
    const supabase = await getSupabaseServerClient();
    const { data: profile } = await supabase.from('profiles').select('username, full_name').eq('id', id).single();

    return {
        title: profile ? `${profile.full_name || profile.username || 'User'} | Spinyl` : 'Profile | Spinyl',
    };
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
    const { id } = await params; // Await params in Next.js 15+ convention if strictly needed, though mostly direct access works in 14. Let's await.
    const supabase = await getSupabaseServerClient();

    // 1. Fetch User Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (!profile) {
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

        // This is inefficient (N+1), but simple for now. 
        // Can optimize later with a join view or rpc query.
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
                profiles!follows_follower_id_fkey ( id, username, avatar_url )
            `)
            .eq('following_id', id); // I am the 'following', they are the 'follower'

        // Fetch Following (People I follow)
        const { data: rawFollowing, error: followingError } = await supabase
            .from('follows')
            .select(`
                following_id,
                profiles!follows_following_id_fkey ( id, username, avatar_url )
            `)
            .eq('follower_id', id); // I am the 'follower', they are the 'following'


        if (followersError) console.error('Followers Error (Stringified):', JSON.stringify(followersError, null, 2));
        if (followingError) console.error('Following Error (Stringified):', JSON.stringify(followingError, null, 2));


        // Helper to check if I follow these users back (Reciprocity check for buttons inside list)
        // Since I AM the current user, I know I follow everyone in 'followingList'.
        // For 'followersList', I need to check if I also follow them.

        // Optimize: Get set of IDs I follow
        const myFollowingIds = new Set(rawFollowing?.map((f: any) => f.following_id));

        followersList = rawFollowers?.map((f: any) => ({
            user_data: f.profiles,
            is_followed_by_current_user: myFollowingIds.has(f.follower_id)
        })) || [];

        followingList = rawFollowing?.map((f: any) => ({
            user_data: f.profiles,
            is_followed_by_current_user: true // I naturally follow people in my following list
        })) || [];
    }

    // Display Name Logic
    const displayName = profile.full_name || profile.username || 'Music Lover';
    const avatarUrl = profile.avatar_url;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom, #121212 0%, #000000 100%)',
            color: '#fff',
            paddingTop: '100px',
            paddingBottom: '40px'
        }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>

                {/* Profile Header */}
                <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', marginBottom: '60px' }}>
                    {/* Avatar */}
                    <div style={{
                        width: '180px', height: '180px',
                        borderRadius: '50%', overflow: 'hidden',
                        border: '4px solid #1ed760',
                        boxShadow: '0 8px 40px rgba(30, 215, 96, 0.3)',
                        flexShrink: 0
                    }}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
                                {displayName[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, paddingTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>{displayName}</h1>
                            {!isOwnProfile && currentUser && (
                                <FollowButton targetUserId={id} initialIsFollowing={isFollowing} />
                            )}
                            {isOwnProfile && (
                                <ProfileEditModal currentUsername={profile.username || ''} />
                            )}
                        </div>

                        {/* Stats Row */}
                        <div style={{ display: 'flex', gap: '40px', fontSize: '1.1rem', marginBottom: '24px' }}>
                            <div><span style={{ fontWeight: 700 }}>{reviewsCount || 0}</span> reviews</div>
                            <div style={{ cursor: 'pointer' }}><span style={{ fontWeight: 700 }}>{followersCount || 0}</span> followers</div>
                            <div style={{ cursor: 'pointer' }}><span style={{ fontWeight: 700 }}>{followingCount || 0}</span> following</div>
                        </div>

                        <div style={{ color: '#aaa', fontSize: '1rem', lineHeight: '1.5' }}>
                            <p>Spinyl User • Music Enthusiast</p>
                            {/* Bio could go here if added to DB */}
                        </div>
                    </div>
                </div>

                {/* Content (Reviews / Followers / Following) */}
                <ProfileContent
                    reviews={reviewsWithLikes}
                    followersList={followersList}
                    followingList={followingList}
                    isOwnProfile={isOwnProfile}
                    currentUserId={currentUser?.id}
                />
            </div>
        </div>
    );
}
