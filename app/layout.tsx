import './globals.css';

export const metadata = {
  title: 'Spinyl',
  description: 'Music reviews powered by Spotify',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
