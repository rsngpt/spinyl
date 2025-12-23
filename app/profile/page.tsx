import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProfilePage() {
    const supabase = await getSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    // Fetch reviews with album details
    const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
            id,
            rating,
            review_text,
            created_at,
            albums (
                spotify_id,
                name,
                cover_image,
                artists,
                release_date
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching profile reviews:', error);
    }

    // User Metadata from Spotify
    const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'Music Lover';

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom, #121212 0%, #000000 100%)',
            color: '#fff',
            paddingTop: '80px', // Navbar space
            paddingBottom: '40px'
        }}>
            {/* Header Section */}
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '40px 24px',
                textAlign: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    margin: '0 auto 24px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '4px solid #1ed760',
                    boxShadow: '0 8px 32px rgba(30, 215, 96, 0.2)'
                }}>
                    {avatar ? (
                        <img src={avatar} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '100%', height: '100%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                            {fullName[0]}
                        </div>
                    )}
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>{fullName}</h1>
                <p style={{ color: '#aaa', fontSize: '1rem', marginBottom: '8px' }}>
                    Spinyl User
                </p>
                <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.9rem' }}>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>{reviews?.length || 0}</span> Reviews
                </div>
            </div>

            {/* Content Section */}
            <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 24px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', borderLeft: '4px solid #1ed760', paddingLeft: '12px' }}>Recent Reviews</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {reviews && reviews.length > 0 ? (
                        reviews.map((review: any) => (
                            <Link
                                href={`/album/${review.albums.spotify_id}`}
                                key={review.id}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div style={{
                                    display: 'flex',
                                    gap: '20px',
                                    background: '#181818',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    transition: 'transform 0.2s, background 0.2s',
                                    cursor: 'pointer'
                                }}
                                    className="review-card-hover" // I'll add this class to globals or inline hover logic if possible
                                >
                                    <div style={{ flexShrink: 0, width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden' }}>
                                        <img
                                            src={review.albums.cover_image}
                                            alt={review.albums.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>{review.albums.name}</h3>
                                                <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '0.9rem' }}>
                                                    {Array.isArray(review.albums.artists)
                                                        ? review.albums.artists.join(', ')
                                                        : review.albums.artists}
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '2px', color: '#FFD700', fontSize: '1.1rem' }}>
                                                {'★'.repeat(review.rating)}
                                                <span style={{ color: '#333' }}>{'★'.repeat(5 - review.rating)}</span>
                                            </div>
                                        </div>

                                        <p style={{
                                            margin: '12px 0 0',
                                            color: '#ddd',
                                            lineHeight: '1.6',
                                            fontSize: '1rem',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {review.review_text}
                                        </p>

                                        <div style={{ marginTop: 'auto', paddingTop: '12px', textAlign: 'right', fontSize: '0.8rem', color: '#666' }}>
                                            Reviewed on {new Date(review.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
                            <p style={{ fontSize: '1.2rem' }}>No reviews yet.</p>
                            <Link href="/" style={{ color: '#1ed760', textDecoration: 'underline' }}>Explore albums</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
