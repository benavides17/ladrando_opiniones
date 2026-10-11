import { AudioDetailPageClient } from '@/components/audio/AudioDetailPageClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default function AudioDetailPage({ params }: PageProps) {
  return <AudioDetailPageClient id={params.id} />;
}

