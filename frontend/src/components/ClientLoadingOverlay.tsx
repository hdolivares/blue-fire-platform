'use client';

import dynamic from 'next/dynamic';

const LoadingOverlay = dynamic(() => import('./LoadingOverlay').then(mod => ({ default: mod.LoadingOverlay })), {
  ssr: false,
});

export default function ClientLoadingOverlay() {
  return <LoadingOverlay />;
} 