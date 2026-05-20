import { notFound } from 'next/navigation';

import ResponsiveContentGrid from '../../components/ResponsiveContentGrid';
import { spotifyFetch } from '@/src/lib/spotify';
import { getSupabaseServerClient } from '@/src/lib/supabase-server';

export const dynamic = 'force-dynamic';

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
    .select('*, profiles(username, avatar_url, is_verified)')
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
    <main style={{ minHeight: '100vh', paddingBottom: '80px', background: 'var(--md-sys-color-background)', color: 'var(--md-sys-color-on-background)', fontFamily: 'var(--font-body)' }}>


      {/* Hero / Header Section (Desktop Only) */}
      <div className="desktop-only" style={{ position: 'relative', overflow: 'hidden' }}>
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
            filter: 'blur(80px) brightness(0.3)',
            zIndex: 0,
            transform: 'scale(1.15)'
          }}
        />

        <div className="album-hero-container">
          <img
            src={album.images?.[0]?.url}
            alt={album.name}
            className="album-cover-image"
          />

          <div style={{ flex: 1, minWidth: '300px' }}>
            <h1 className="font-display" style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              margin: '0 0 16px',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              textShadow: '0 4px 20px rgba(0,0,0,0.6)'
            }}>
              {album.name}
            </h1>
            <p className="font-display" style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 8px', color: 'rgba(255,255,255,0.95)' }}>
              {artistNames}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '24px' }}>
              <span className="m3-badge">
                📅 {releaseYear}
              </span>
              <span className="m3-badge">
                🎵 {genreList}
              </span>
              {reviews.length > 0 && (
                <span className="m3-badge-accent">
                  ⭐ {(reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)}/10
                </span>
              )}
              <span className="m3-badge">
                💬 {reviews.length} Reviews
              </span>
              <span className="m3-badge">
                💿 {album.total_tracks} tracks
              </span>
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContentGrid
        tracks={album.tracks.items}
        reviews={reviews}
        albumData={albumData}
        currentUser={user}
        genreList={genreList}
        releaseYear={releaseYear}
        totalTracks={album.total_tracks}
      />
    </main>
  );
}
