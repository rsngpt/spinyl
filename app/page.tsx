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

      <Footer />
    </main>
  );
}
