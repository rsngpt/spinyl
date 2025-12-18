import { notFound } from 'next/navigation';

type Review = {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
};

type AlbumPageProps = {
  params: {
    spotify_id: string;
  };
};

async function getAlbumData(spotifyId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/album/${spotifyId}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch album');
  }

  return res.json();
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const data = await getAlbumData(params.spotify_id);

  if (!data?.spotify) {
    notFound();
  }

  const { spotify, reviews } = data;

  return (
    <main style={{ padding: '24px' }}>
      {/* Album Header */}
      <section style={{ display: 'flex', gap: '24px' }}>
        <img
          src={spotify.cover}
          alt={spotify.name}
          width={240}
          height={240}
          style={{ borderRadius: '8px' }}
        />

        <div>
          <h1>{spotify.name}</h1>
          <p>{spotify.artists.join(', ')}</p>
          <p>{spotify.tracks.length} tracks</p>
        </div>
      </section>

      {/* Tracklist */}
      <section style={{ marginTop: '32px' }}>
        <h2>Tracklist</h2>
        <ol>
          {spotify.tracks.map((track: any) => (
            <li key={track.id}>{track.name}</li>
          ))}
        </ol>
      </section>

      {/* Reviews */}
      <section style={{ marginTop: '32px' }}>
        <h2>Community Reviews</h2>

        {reviews.length === 0 && <p>No reviews yet.</p>}

        {reviews.map((review: Review) => (
          <div
            key={review.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '12px',
            }}
          >
            <strong>⭐ {review.rating}</strong>
            <p>{review.review_text}</p>
            <small>
              {new Date(review.created_at).toLocaleDateString()}
            </small>
          </div>
        ))}
      </section>
    </main>
  );
}
