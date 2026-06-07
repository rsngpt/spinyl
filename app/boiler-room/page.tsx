'use client';

import dynamic from 'next/dynamic';

const BoilerRoomClient = dynamic(
  () => import('./components/BoilerRoomClient'),
  { ssr: false }
);

export default function BoilerRoomPage() {
    return <BoilerRoomClient />;
}
