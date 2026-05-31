import './globals.css';

import Navbar from './components/Navbar';
import ClientLoadingWrapper from './components/ClientLoadingWrapper';

export const metadata = {
  title: 'Spinyl',
  description: 'Music reviews powered by Spotify',
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
