'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, MoreVertical, Music, MessageSquare, ChevronDown } from 'lucide-react';
import TrackPreview from './TrackPreview';
import ReviewSection from './ReviewSection';

interface Track {
  id: string;
  name: string;
  duration_ms: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

interface AlbumData {
  spotify_id: string;
  name: string;
  release_date: string;
  cover_image: string;
  artists: string[];
}

interface ResponsiveContentGridProps {
  tracks: Track[];
  reviews: any[];
  albumData: AlbumData;
  currentUser: any;
  genreList: string;
  releaseYear: number;
  totalTracks: number;
}

function msToTime(duration: number) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export default function ResponsiveContentGrid({
  tracks,
  reviews,
  albumData,
  currentUser,
  genreList,
  releaseYear,
  totalTracks
}: ResponsiveContentGridProps) {
  const [activeTab, setActiveTab] = useState<'tracks' | 'reviews'>('tracks');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);
  const [isApiReady, setIsApiReady] = useState(false);
  const playerControllerRef = useRef<any>(null);

  useEffect(() => {
    // Define the global callback
    (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {
      const element = document.getElementById('spotify-player-embed-target');
      if (!element) return;

      const options = {
        uri: `spotify:album:${albumData.spotify_id}`,
        width: '100%',
        height: '80'
      };

      IFrameAPI.createController(element, options, (EmbedController: any) => {
        playerControllerRef.current = EmbedController;
        setIsApiReady(true);
      });
    };

    // Load Spotify IFrame API script if not already loaded
    if (!document.querySelector('script[src="https://open.spotify.com/embed/iframe-api/v1"]')) {
      const script = document.createElement('script');
      script.src = 'https://open.spotify.com/embed/iframe-api/v1';
      script.async = true;
      document.body.appendChild(script);
    } else {
      const IFrameAPI = (window as any).SpotifyIframeApi;
      if (IFrameAPI) {
        (window as any).onSpotifyIframeApiReady(IFrameAPI);
      }
    }
  }, [albumData.spotify_id]);

  // Keep refs of playingTrackId and tracks to avoid stale closures and dynamic dependency array sizing
  const playingTrackIdRef = useRef(playingTrackId);
  const tracksRef = useRef(tracks);

  useEffect(() => {
    playingTrackIdRef.current = playingTrackId;
  }, [playingTrackId]);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);
  
  // Listen for spacebar to play/pause the player
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        // Do not intercept spacebar if the user is typing in a form input or editable field
        const active = document.activeElement;
        if (active) {
          const tagName = active.tagName.toLowerCase();
          if (
            tagName === 'input' ||
            tagName === 'textarea' ||
            active.getAttribute('contenteditable') === 'true'
          ) {
            return;
          }
        }

        if (playerControllerRef.current) {
          e.preventDefault();
          setIsPlayerVisible(true);
          
          const currentTrackId = playingTrackIdRef.current;
          const currentTracks = tracksRef.current;
          
          if (!currentTrackId && currentTracks.length > 0) {
            const firstTrackId = currentTracks[0].id;
            setPlayingTrackId(firstTrackId);
            playerControllerRef.current.loadUri(`spotify:track:${firstTrackId}`);
            setTimeout(() => {
              if (playerControllerRef.current) {
                playerControllerRef.current.play();
              }
            }, 50);
          } else {
            playerControllerRef.current.togglePlay();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Load new album if spotify_id changes
  useEffect(() => {
    if (playerControllerRef.current && isApiReady) {
      playerControllerRef.current.loadUri(`spotify:album:${albumData.spotify_id}`);
    }
  }, [albumData.spotify_id, isApiReady]);

  const handlePlayTrack = (trackId: string) => {
    setIsPlayerVisible(true);
    if (playingTrackId === trackId) {
      if (playerControllerRef.current) {
        playerControllerRef.current.togglePlay();
      }
    } else {
      setPlayingTrackId(trackId);
      if (playerControllerRef.current) {
        playerControllerRef.current.loadUri(`spotify:track:${trackId}`);
        setTimeout(() => {
          if (playerControllerRef.current) {
            playerControllerRef.current.play();
          }
        }, 50);
      }
    }
  };

  return (
    <div style={{ width: '100%', paddingBottom: isPlayerVisible ? '120px' : '32px' }}>
      {/* Android Style Top App Bar (visible on mobile only via CSS) */}
      <div className="m3-top-app-bar">
        <button className="m3-icon-btn" onClick={() => window.history.back()}>
          <ArrowLeft size={24} />
        </button>
        <h2 className="m3-top-app-bar-title">{albumData.name}</h2>
        <button className="m3-icon-btn">
          <MoreVertical size={24} />
        </button>
      </div>

      {/* Android Style Tab Bar (visible on mobile only via CSS) */}
      <div className="m3-tab-bar-mobile-only">
        <div className="m3-tab-bar">
          <button
            onClick={() => setActiveTab('tracks')}
            className={`m3-tab-item ${activeTab === 'tracks' ? 'active' : ''}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Music size={16} />
              TRACKS
            </div>
            {activeTab === 'tracks' && <div className="m3-tab-indicator" />}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`m3-tab-item ${activeTab === 'reviews' ? 'active' : ''}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <MessageSquare size={16} />
              REVIEWS ({reviews.length})
            </div>
            {activeTab === 'reviews' && <div className="m3-tab-indicator" />}
          </button>
        </div>
      </div>

      {/* Content Split: Tracklist vs Reviews */}
      <div className="content-grid">
        {/* Left Column: Tracklist */}
        <section
          className={`glass-panel-m3 tracklist-column ${activeTab === 'tracks' ? '' : 'mobile-hidden'}`}
          style={{ padding: '32px' }}
        >
          <h3
            className="font-display desktop-only"
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              paddingBottom: '16px',
              marginBottom: '16px',
              fontSize: '1.2rem',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'var(--md-sys-color-on-surface)'
            }}
          >
            Tracklist
          </h3>
          <div className="m3-scroll" style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '8px' }}>
            {tracks.map((track, index) => {
              const isCurrent = playingTrackId === track.id;
              return (
                <div
                  key={track.id}
                  className="track-list-item"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    fontSize: '0.95rem',
                    background: isCurrent ? 'rgba(255, 159, 104, 0.04)' : 'transparent',
                    transition: 'background 0.3s ease'
                  }}
                >
                  <span style={{ 
                    width: '32px', 
                    color: isCurrent ? 'var(--md-sys-color-primary)' : 'var(--text-secondary)', 
                    textAlign: 'right', 
                    marginRight: '16px', 
                    fontWeight: 600 
                  }}>
                    {index + 1}
                  </span>

                  <TrackPreview
                    previewUrl={track.preview_url}
                    spotifyUrl={track.external_urls?.spotify || '#'}
                    onPlayEmbed={() => handlePlayTrack(track.id)}
                    isActive={isCurrent}
                  />

                  <div style={{ flex: 1, paddingLeft: '12px' }}>
                    <span style={{ 
                      display: 'block', 
                      color: isCurrent ? 'var(--md-sys-color-primary)' : '#fff', 
                      fontWeight: isCurrent ? 600 : 500 
                    }}>{track.name}</span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
                    {msToTime(track.duration_ms)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Review Section */}
        <section
          className={`glass-panel-m3 reviews-column ${activeTab === 'reviews' ? '' : 'mobile-hidden'}`}
          style={{ padding: '32px' }}
        >
          <ReviewSection
            initialReviews={reviews}
            albumData={albumData}
            currentUser={currentUser}
            isMobileActive={activeTab === 'reviews'}
          />
        </section>
      </div>

      {/* Floating Spotify Player Bar */}
      <div className={`m3-spotify-player-bar ${isPlayerVisible ? 'visible' : 'hidden'}`}>
        <div className="m3-spotify-player-content">
          {/* Header info */}
          <div className="m3-spotify-player-header-info desktop-only">
            <img 
              src={albumData.cover_image} 
              alt={albumData.name} 
              className="m3-spotify-player-art"
            />
            <div style={{ minWidth: 0 }}>
              <span className="m3-player-track-title" style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {playingTrackId 
                  ? tracks.find(t => t.id === playingTrackId)?.name || 'Track Preview'
                  : 'Album Playback'}
              </span>
              <span className="m3-player-artist-name" style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {albumData.artists.join(', ')}
              </span>
            </div>
          </div>

          {/* IFrame Embed Container */}
          <div className="m3-spotify-iframe-container" style={{ position: 'relative', height: '80px' }}>
            <div id="spotify-player-embed-target" style={{ width: '100%', height: '100%' }} />
            {!isApiReady && (
              <iframe
                src={`https://open.spotify.com/embed/${playingTrackId ? 'track/' + playingTrackId : 'album/' + albumData.spotify_id}?utm_source=generator&theme=0`}
                width="100%"
                height="80"
                frameBorder="0"
                allowFullScreen={false}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ border: 'none', position: 'absolute', top: 0, left: 0 }}
              />
            )}
          </div>

          {/* Close Button */}
          <button 
            className="m3-player-close-btn"
            onClick={() => setIsPlayerVisible(false)}
            title="Hide Player"
          >
            <ChevronDown size={20} />
          </button>
        </div>
      </div>

      {/* Float Fab to restore player */}
      <button 
        className={`m3-player-restore-fab ${!isPlayerVisible ? 'visible' : 'hidden'}`}
        onClick={() => {
          setIsPlayerVisible(true);
          if (playerControllerRef.current) {
            playerControllerRef.current.play();
          }
        }}
        title="Restore Spotify Player"
      >
        <Music size={18} />
        <span className="desktop-only" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>PLAYER</span>
      </button>
    </div>
  );
}
