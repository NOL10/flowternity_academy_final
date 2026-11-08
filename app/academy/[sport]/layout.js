import { generateSportMetadata } from '@/lib/seo';
import { SPORTS } from '@/lib/flowternity/config';

export async function generateMetadata({ params }) {
  const sport = SPORTS.find(s => s.id === params.sport);
  
  if (!sport) {
    return {
      title: 'Sport Not Found',
      robots: { index: false },
    };
  }

  return generateSportMetadata(params.sport);
}

export default function SportLayout({ children }) {
  return children;
}
