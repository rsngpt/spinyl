import './globals.css';

import Navbar from './components/Navbar';
import ClientLoadingWrapper from './components/ClientLoadingWrapper';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spinyl.in';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Spinyl',
    template: '%s | Spinyl',
  },
  description: 'Spinyl is a music community for Spotify listeners to share reviews, album ratings, and hot takes.',
  keywords: [
    'music reviews',
    'Spotify',
    'album review',
    'music community',
    'vinyl',
    'music discovery',
    'Spinyl',
  ],
  authors: [{ name: 'Spinyl' }],
  creator: 'Spinyl',
  openGraph: {
    title: 'Spinyl',
    description: 'Discover music reviews, connect with listeners, and share your Spotify taste.',
    type: 'website',
    url: siteUrl,
    siteName: 'Spinyl',
    images: [
      {
        url: '/spinyl-logo-white.png',
        width: 1200,
        height: 630,
        alt: 'Spinyl logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spinyl',
    description: 'Discover music reviews, connect with listeners, and share your Spotify taste.',
    images: ['/spinyl-logo-white.png'],
  },
  icons: {
    icon: '/spinyl-logo-white.png',
    shortcut: '/spinyl-logo-white.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { getSupabaseServerClient } from '@/src/lib/supabase-server';


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <html lang="en">
      <body>
        <ClientLoadingWrapper>
          <Navbar initialUser={user} initialProfile={profile} initialSession={session} />
          {children}
        </ClientLoadingWrapper>
      </body>
    </html>
  );
}
