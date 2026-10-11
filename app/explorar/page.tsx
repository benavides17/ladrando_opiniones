import { ExploreClient } from '@/components/explore/ExploreClient';

export const metadata = {
  title: 'Explorar audios — ladrando opiniones',
  description: 'Catálogo de grabaciones y audios comunitarios en ladrando opiniones.',
};

export default function ExplorePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <ExploreClient />
    </div>
  );
}
