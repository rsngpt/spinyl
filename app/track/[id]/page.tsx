import { notFound } from 'next/navigation';
import Link from 'next/link';
import { spotifyFetch } from '@/src/lib/spotify';
import { ArrowLeft, Disc, Calendar, Clock, Music } from 'lucide-react';
import TrackPreview from '../../components/TrackPreview';

export const dynamic = 'force-dynamic';

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

async function getTrackDetails(id: string) {
    try {
        const track = await spotifyFetch(`tracks/${id}?market=US`);
        return track;
    } catch (error) {
        console.error('Error fetching track:', error);
        return null;
    }
}

function msToTime(duration: number) {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export default async function TrackPage(props: PageProps) {
    const params = await props.params;
    const track = await getTrackDetails(params.id);

    if (!track) {
        notFound();
    }

    const album = track.album;
    const releaseYear = new Date(album.release_date).getFullYear();
    const artistNames = track.artists.map((a: any) => a.name).join(', ');

    return (
        <main style={{ minHeight: '100vh', paddingBottom: '80px', background: '#000000', color: '#fff' }}>

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
                    {/* Back Button */}
                    <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
                        <Link href={`/album/${album.id}`} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'rgba(255,255,255,0.8)',
                            textDecoration: 'none',
                            padding: '8px 16px',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '20px',
                            backdropFilter: 'blur(4px)',
                            fontWeight: 500,
                            fontSize: '0.9rem'
                        }}>
                            <ArrowLeft size={16} />
                            Back to Album
                        </Link>
                    </div>

                    <img
                        src={album.images?.[0]?.url}
                        alt={track.name}
                        className="album-cover-image"
                        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                    />

                    <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <span style={{
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            marginBottom: '8px'
                        }}>
                            Song
                        </span>
                        <h1 style={{
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: 800,
                            margin: '0 0 16px',
                            lineHeight: 1.1,
                            textShadow: '0 4px 12px rgba(0,0,0,0.5)'
                        }}>
                            {track.name}
                        </h1>
                        <p style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 8px', color: 'rgba(255,255,255,0.9)' }}>
                            {artistNames}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500, marginTop: '16px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Disc size={16} /> {album.name}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={16} /> {releaseYear}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={16} /> {msToTime(track.duration_ms)}
                            </span>
                            {track.explicit && (
                                <span style={{
                                    border: '1px solid rgba(255,255,255,0.6)',
                                    padding: '2px 4px',
                                    borderRadius: '3px',
                                    fontSize: '0.7rem',
                                    lineHeight: '1',
                                    height: 'fit-content',
                                    alignSelf: 'center'
                                }}>
                                    E
                                </span>
                            )}
                        </div>

                        <div style={{ marginTop: '24px' }}>
                            <TrackPreview
                                previewUrl={track.preview_url}
                                spotifyUrl={track.external_urls?.spotify || '#'}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="content-grid" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                <section>
                    <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px', fontSize: '1.5rem', fontWeight: 700 }}>
                        From the Album
                    </h3>

                    <Link href={`/album/${album.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{
                            display: 'flex',
                            gap: '24px',
                            background: '#181818',
                            padding: '24px',
                            borderRadius: '16px',
                            transition: 'background 0.2s',
                            cursor: 'pointer'
                        }} className="album-card-hover">
                            <img
                                src={album.images?.[0]?.url}
                                alt={album.name}
                                style={{ width: '120px', height: '120px', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <h4 style={{ fontSize: '1.5rem', margin: '0 0 8px', color: '#fff' }}>{album.name}</h4>
                                <p style={{ margin: '0 0 4px', color: '#b3b3b3', fontSize: '1rem' }}>{artistNames}</p>
                                <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>{album.total_tracks} tracks • {releaseYear}</p>
                            </div>
                        </div>
                    </Link>
                </section>
            </div>

            <style>{`
        .album-card-hover:hover {
            background: #242424 !important;
        }
       `}</style>

        </main>
    );
}
