import Hero from './components/Hero';
import RecentlyPlayedSlideshow from './components/RecentlyPlayedSlideshow';
import FeaturesSection from './components/FeaturesSection';
import RecentReviews from './components/RecentReviews';
import Footer from './components/Footer';
import DashboardHome from './components/DashboardHome';
import { getSupabaseServerClient } from '@/src/lib/supabase-server';
import { spotifyFetch } from '@/src/lib/spotify';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // 1. Fetch Profile Details
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single();

    // 2. Fetch Top Reviewed/Trending Albums from Supabase
    const { data: trendingRaw } = await supabase
      .from('albums')
      .select(`
        spotify_id,
        name,
        cover_image,
        reviews ( rating )
      `);

    // Calculate local review averages
    const trending = (trendingRaw || [])
      .map((album: any) => {
        const ratings = album.reviews?.map((r: any) => r.rating) || [];
        if (ratings.length === 0) return null;

        const avg = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
        return {
          id: album.spotify_id,
          name: album.name,
          cover_image: album.cover_image,
          artist: 'Trending Locally',
          avg_rating: Number(avg.toFixed(1)),
        };
      })
      .filter((a): a is any => a !== null)
      .sort((a, b) => b.avg_rating - a.avg_rating)
      .slice(0, 10);

    // 3. Fetch Spotify New Releases
    let newReleases: any[] = [];
    try {
      const data = await spotifyFetch('browse/new-releases?limit=10');
      if (data?.albums?.items) {
        newReleases = data.albums.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          cover_image: item.images?.[0]?.url || null,
          artist: item.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
          avg_rating: null,
        }));
      }
    } catch (err) {
      console.error('Error fetching new releases on homepage:', err);
    }

    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', paddingTop: '80px' }}>
        <div className="live-gradient-bg" />
        <div style={{ flex: 1, zIndex: 1 }}>
          <DashboardHome
            userProfile={{
              username: profile?.username || null,
              avatar_url: profile?.avatar_url || null
            }}
            initialTrending={trending}
            initialNewReleases={newReleases}
          />
        </div>
        <Footer />
      </main>
    );
  }

  // Not logged in: Render welcome home landing page
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div className="live-gradient-bg" />

      <div style={{ flex: 1 }}>
        <section id="hero">
          <Hero />
        </section>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <section id="recently-played" className="section-spacing">
            <RecentlyPlayedSlideshow />
          </section>

          <section id="features" className="section-spacing">
            <FeaturesSection />
          </section>

          <section id="reviews" className="section-spacing">
            <RecentReviews />
          </section>
        </div>
      </div>
    </main>
  );
}
