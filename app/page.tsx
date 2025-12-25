import Hero from './components/Hero';
import RecentlyPlayedSlideshow from './components/RecentlyPlayedSlideshow';
import FeaturesSection from './components/FeaturesSection';
import RecentReviews from './components/RecentReviews';
import Footer from './components/Footer';

export default async function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div className="live-gradient-bg" />

      <div style={{ flex: 1 }}>
        <section id="hero">
          <Hero />
        </section>

        <div style={{ position: 'relative', zIndex: 1, marginTop: '-40px', pointerEvents: 'none' }}>
          <section id="recently-played" style={{ marginBottom: '80px', pointerEvents: 'auto' }}>
            <RecentlyPlayedSlideshow />
          </section>

          <section id="features" style={{ marginBottom: '80px' }}>
            <FeaturesSection />
          </section>

          <section id="reviews" style={{ marginBottom: '80px' }}>
            <RecentReviews />
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
