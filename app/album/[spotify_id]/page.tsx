import { notFound } from 'next/navigation';

import ReviewSection from '../../components/ReviewSection';
import TrackPreview from '../../components/TrackPreview';
import { spotifyFetch } from '@/src/lib/spotify';
import { getSupabaseServerClient } from '@/src/lib/supabase-server';

type PageProps = {
  params: Promise<{
    spotify_id: string;
  }>;
};

async function getAlbumDetails(id: string) {
  try {
    // Adding market=US sometimes helps retrieve preview_urls that are otherwise null
    const album = await spotifyFetch(`albums/${id}?market=US`);
    return album;
  } catch (error) {
    console.error('Error fetching album:', error);
    return null;
  }
}

async function getAlbumReviews(spotifyId: string) {
  const supabase = await getSupabaseServerClient();

  // First get our internal album ID
  const { data: albumRow } = await supabase
    .from('albums')
    .select('id')
    .eq('spotify_id', spotifyId)
    .single();

  if (!albumRow) return [];

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*, profiles(username, avatar_url)')
    .eq('album_id', albumRow.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
  } else {
    console.log(`Fetched ${reviews?.length} reviews for album ${albumRow.id}`);
  }

  return reviews || [];
}

function msToTime(duration: number) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export default async function AlbumPage(props: PageProps) {
  const params = await props.params;

  // Fetch both concurrently
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [album, reviews] = await Promise.all([
    getAlbumDetails(params.spotify_id),
    getAlbumReviews(params.spotify_id)
  ]);

  if (!album) {
    notFound();
  }

  const releaseYear = new Date(album.release_date).getFullYear();
  const artistNames = album.artists.map((a: any) => a.name).join(', ');

  // Use album genres if available, otherwise default to something generic or hidden
  // Note: Spotify Albums often don't have genres, artists do. For now we use what's on the album object.
  const genreList = album.genres && album.genres.length > 0
    ? album.genres.map((g: string) => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')
    : 'Pop / Multiple'; // Fallback as requested by "Can add more data here.. Like genre"

  // Prepare data for ReviewSection
  const albumData = {
    spotify_id: album.id,
    name: album.name,
    release_date: album.release_date,
    cover_image: album.images?.[0]?.url,
    artists: album.artists.map((a: any) => a.name),
  };

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px', background: '#121212', color: '#fff' }}>


      {/* Hero / Header Section */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Blurry Background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${album.images?.[0]?.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(60px) brightness(0.4)',
            zIndex: 0,
            transform: 'scale(1.1)'
          }}
        />

        <div className="album-hero-container">
          <img
            src={album.images?.[0]?.url}
            alt={album.name}
            className="album-cover-image"
          />

          <div style={{ flex: 1, minWidth: '300px' }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              margin: '0 0 16px',
              lineHeight: 1.1,
              textShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}>
              {album.name}
            </h1>
            <p style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 8px', color: 'rgba(255,255,255,0.9)' }}>
              {artistNames}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500, marginTop: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                📅 {releaseYear}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                🎵 {genreList}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                💬 {reviews.length} Reviews
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                💿 {album.total_tracks} tracks
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Split: Tracklist vs Reviews */}
      <div className="content-grid">
        {/* Left Column: Tracklist */}
        <section>
          <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '16px', fontSize: '1.1rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Tracklist
          </h3>
          <div>
            {album.tracks.items.map((track: any, index: number) => (
              <div
                key={track.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 8px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontSize: '0.95rem',
                }}
              >
                <span style={{ width: '32px', color: 'var(--text-secondary)', textAlign: 'right', marginRight: '16px' }}>
                  {index + 1}
                </span>

                <TrackPreview
                  previewUrl={track.preview_url}
                  spotifyUrl={track.external_urls?.spotify || '#'}
                />

                <div style={{ flex: 1 }}>
                  <span style={{ display: 'block', color: '#fff' }}>{track.name}</span>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {msToTime(track.duration_ms)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Review Section */}
        <section>
          <ReviewSection initialReviews={reviews} albumData={albumData} currentUser={user} />
        </section>
      </div>
    </main>
  );
}
