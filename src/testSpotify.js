import { spotifyFetch } from './lib/spotify.js';

async function test() {
  const data = await spotifyFetch(
    'search?q=arijit%20singh&type=artist&limit=1'
  );
  console.log(JSON.stringify(data, null, 2));
}

test();
