import { ProfileClient } from '@/components/profile/ProfileClient';

interface PageProps {
  params: {
    username: string;
  };
}

export default function UserProfilePage({ params }: PageProps) {
  return <ProfileClient username={params.username} />;
}

