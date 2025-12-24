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
                        border: isVerified ? '4px solid #3D91FF' : '4px solid #1ed760',
                        boxShadow: isVerified ? '0 8px 40px rgba(61, 145, 255, 0.3)' : '0 8px 40px rgba(30, 215, 96, 0.3)',
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>{displayName}</h1>
                                {isVerified && (
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#3D91FF" />
                                        <path d="M7 12L10 15L17 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
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
                            <p>
                                <span style={{ color: '#1ed760', fontWeight: 500 }}>@{profile.username || 'User'}</span>
                                <span style={{ margin: '0 8px' }}>•</span>
                                <span>{profile.bio || 'No bio.'}</span>
                            </p>
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
