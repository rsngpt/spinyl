import Hero from './components/Hero';
import RecentlyPlayedSlideshow from './components/RecentlyPlayedSlideshow';
import FeaturesSection from './components/FeaturesSection';
import RecentReviews from './components/RecentReviews';

export default async function Home() {
  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px', position: 'relative' }}>
      <div className="live-gradient-bg" />
      <section id="hero">
        <Hero />
      </section>

      <div style={{ position: 'relative', zIndex: 1, marginTop: '-40px' }}>
        <section id="recently-played">
          <RecentlyPlayedSlideshow />
        </section>

        <section id="features">
          <FeaturesSection />
        </section>

        <section id="reviews">
          <RecentReviews />
        </section>
      </div>
    </main>
  );
}
