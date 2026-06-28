import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

import ResponsiveContentGrid from '../../components/ResponsiveContentGrid';
import CinematicHero from '../../components/CinematicHero';
import { spotifyFetch } from '@/src/lib/spotify';
import { getSupabaseServerClient } from '@/src/lib/supabase-server';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spinyl.in';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{
    spotify_id: string;
  }>;
};

interface AlbumCacheData {
  youtubeId: string | null;
}

// Server-side helper to fetch and cache YouTube Video ID
async function getCachedAlbumExtras(spotifyId: string, albumName: string, artistNames: string): Promise<AlbumCacheData> {
  const cacheDir = path.join(process.cwd(), 'app', 'album', 'cache');
  const cacheFile = path.join(cacheDir, `${spotifyId}.json`);

  // Try reading from cache first
  try {
    if (fs.existsSync(cacheFile)) {
      const raw = fs.readFileSync(cacheFile, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading cache file:', e);
  }

  let youtubeId: string | null = null;

  // Fetch YouTube video ID
  try {
    const query = `${albumName} ${artistNames} official trailer`;
    console.log(`[YouTube Search] Searching for: ${query}`);
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const res = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });
    const html = res.data;
    const regex = /\/watch\?v=([a-zA-Z0-9_-]{11})/g;
    let match;
    const ids: string[] = [];
    while ((match = regex.exec(html)) !== null) {
      ids.push(match[1]);
    }
    youtubeId = ids[0] || null;
  } catch (e) {
    console.error('[YouTube Search] Failed:', e);
  }

  // Write to cache file
  try {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    const dataToCache: AlbumCacheData = { youtubeId };
    fs.writeFileSync(cacheFile, JSON.stringify(dataToCache, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing to cache file:', e);
  }

  return { youtubeId };
}

async function getAlbumDetails(id: string) {
  try {
    const album = await spotifyFetch(`albums/${id}?market=US`);
    return album;
  } catch (error) {
    console.error('Error fetching album:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { spotify_id: string } }): Promise<Metadata> {
  const album = await getAlbumDetails(params.spotify_id);

  if (!album) {
    return {
      title: 'Album | Spinyl',
      description: 'Discover album reviews and Spotify music insights on Spinyl.',
    };
  }

  const artistNames = album.artists?.map((a: any) => a.name).join(', ') || 'Various Artists';
  const title = `${album.name} by ${artistNames}`;
  const description = `Read reviews, ratings, and discussion for ${album.name} by ${artistNames} on Spinyl.`;
  const imageUrl = album.images?.[0]?.url || '/spinyl-logo-white.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/album/${params.spotify_id}`,
      siteName: 'Spinyl',
      type: 'music.album',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${album.name} cover image`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

async function getAlbumReviews(spotifyId: string) {
  const supabase = await getSupabaseServerClient();

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

export default async function AlbumPage(props: PageProps) {
  const params = await props.params;

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

  const genreList = album.genres && album.genres.length > 0
    ? album.genres.map((g: string) => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')
    : 'Pop / Multiple';

  // Fetch YouTube video ID from cache or YouTube search
  const extras = await getCachedAlbumExtras(params.spotify_id, album.name, artistNames);

  const averageRating = reviews.length > 0
    ? parseFloat((reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1))
    : 0.0;

  const albumData = {
    spotify_id: album.id,
    name: album.name,
    release_date: album.release_date,
    cover_image: album.images?.[0]?.url,
    artists: album.artists.map((a: any) => a.name),
  };

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px', background: 'var(--md-sys-color-background)', color: 'var(--md-sys-color-on-background)', fontFamily: 'var(--font-body)' }}>
      {/* Premium Cinematic Hero Header */}
      <CinematicHero
        album={album}
        youtubeId={extras.youtubeId}
        averageRating={averageRating}
        reviewsCount={reviews.length}
        genreList={genreList}
        releaseYear={releaseYear}
        user={user}
      />

      {/* Tracks & Reviews Grid */}
      <div id="review-section-target">
        <ResponsiveContentGrid
          tracks={album.tracks.items}
          reviews={reviews}
          albumData={albumData}
          currentUser={user}
          genreList={genreList}
          releaseYear={releaseYear}
          totalTracks={album.total_tracks}
        />
      </div>
    </main>
  );
}


