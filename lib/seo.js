/**
 * SEO Metadata Generator
 * Centralized SEO utilities for consistent metadata across pages
 */

export const DEFAULT_METADATA = {
  title: 'Flowternity — Premium Sports Academy',
  description: 'Train with purpose. Book multi-sport classes, manage memberships, and access world-class facilities. Basketball, futsal, skateboarding, karate, and more.',
  keywords: 'sports academy, basketball classes, futsal, sports training, membership, online booking',
  ogImage: '/og-image.png',
  ogType: 'website',
  twitterHandle: '@flowternity',
  locale: 'en_US',
  siteName: 'Flowternity',
  url: 'https://flowternity.com',
};

export const SPORTS_METADATA = {
  basketball: {
    title: 'Basketball Classes | Flowternity Academy',
    description: 'Join elite basketball training on international courts. World-class coaching, skill progression, and competitive tournaments. Book your session today.',
    keywords: 'basketball classes, basketball training, basketball academy, court booking, basketball coaching',
    canonical: '/academy/basketball',
  },
  futsal: {
    title: 'Futsal Classes | Flowternity Academy',
    description: 'Experience fast-paced futsal training. Small-sided games, technical development, and tournaments. Perfect for all skill levels.',
    keywords: 'futsal classes, futsal training, futsal academy, futsal tournaments, indoor soccer',
    canonical: '/academy/futsal',
  },
  skateboarding: {
    title: 'Skateboarding Classes | Flowternity Academy',
    description: 'Learn skateboarding from experienced coaches. From basics to advanced tricks. Progress through 7-level athlete system.',
    keywords: 'skateboarding classes, skateboarding training, skateboarding lessons, skate academy, skateboarding coaching',
    canonical: '/academy/skateboarding',
  },
  karate: {
    title: 'Karate Classes | Flowternity Academy',
    description: 'Master traditional karate with certified instructors. Discipline, self-defense, and competitive training. All ages and levels.',
    keywords: 'karate classes, karate training, karate academy, martial arts, karate lessons',
    canonical: '/academy/karate',
  },
  skating: {
    title: 'Skating Classes | Flowternity Academy',
    description: 'Learn inline skating or ice skating with professional coaches. Balance, speed, and technique. Progressive skill levels.',
    keywords: 'skating classes, ice skating, inline skating, skating academy, skating lessons',
    canonical: '/academy/skating',
  },
};

const PAGE_METADATA = {
  home: {
    title: 'Flowternity — Premium Sports Academy',
    description: 'Train with purpose. Book multi-sport classes, manage memberships, and access world-class facilities with 24/7 app access.',
    keywords: 'sports academy, multi-sport facility, online booking, class booking, sports memberships',
    canonical: '/',
  },
  memberships: {
    title: 'Memberships | Flowternity Academy',
    description: 'Choose your membership plan. Train across multiple sports with flexible pricing. Basketball, futsal, skateboarding, and more.',
    keywords: 'memberships, sports memberships, membership plans, basketball membership, multi-sport membership',
    canonical: '/memberships',
  },
  games: {
    title: 'Classes & Tournaments | Flowternity Academy',
    description: 'Browse and book classes across all sports. Join pickup games, tournaments, and skill-building sessions. Real-time availability.',
    keywords: 'classes, tournaments, pickup games, sports events, class booking, event registration',
    canonical: '/games',
  },
  coaches: {
    title: 'Our Coaches | Flowternity Academy',
    description: 'Meet our world-class coaching team. Expert instructors across all sports dedicated to your athletic development.',
    keywords: 'coaches, instructors, sports coaches, basketball coaches, training coaches',
    canonical: '/coaches',
  },
  trial: {
    title: 'Free Trial Class | Flowternity Academy',
    description: 'Book your free trial class. No card required, no account needed. Try any sport at Flowternity Academy today.',
    keywords: 'free trial, free class, no card needed, trial class, sports trial',
    canonical: '/trial',
  },
  dashboard: {
    title: 'Your Dashboard | Flowternity Academy',
    description: 'Manage your memberships, bookings, and progress. Track your athletic journey with Flowternity.',
    keywords: 'dashboard, memberships, bookings, progress tracking',
    canonical: '/dashboard',
  },
  profile: {
    title: 'Your Profile | Flowternity Academy',
    description: 'Manage your account settings, memberships, and preferences.',
    keywords: 'profile, account, settings, preferences',
    canonical: '/profile',
  },
  auth: {
    title: 'Sign In | Flowternity Academy',
    description: 'Sign in to your Flowternity account to manage memberships and bookings.',
    keywords: 'sign in, login, authentication',
    canonical: '/auth',
  },
  checkout: {
    title: 'Checkout | Flowternity Academy',
    description: 'Complete your membership purchase securely.',
    keywords: 'checkout, payment, purchase, membership',
    canonical: '/checkout',
  },
};

/**
 * Generate metadata for a page
 * @param {string} pageKey - Page identifier (e.g., 'home', 'memberships')
 * @param {object} overrides - Custom metadata overrides
 * @returns {object} Complete metadata object
 */
export function generateMetadata(pageKey, overrides = {}) {
  const pageData = PAGE_METADATA[pageKey] || DEFAULT_METADATA;
  
  return {
    title: overrides.title || pageData.title,
    description: overrides.description || pageData.description,
    keywords: overrides.keywords || pageData.keywords,
    canonical: overrides.canonical || pageData.canonical,
    openGraph: {
      title: overrides.ogTitle || pageData.title,
      description: overrides.ogDescription || pageData.description,
      type: overrides.ogType || DEFAULT_METADATA.ogType,
      url: overrides.url || `${DEFAULT_METADATA.url}${pageData.canonical}`,
      image: overrides.ogImage || DEFAULT_METADATA.ogImage,
      siteName: DEFAULT_METADATA.siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: overrides.twitterTitle || pageData.title,
      description: overrides.twitterDescription || pageData.description,
      creator: DEFAULT_METADATA.twitterHandle,
      image: overrides.twitterImage || DEFAULT_METADATA.ogImage,
    },
    alternates: {
      canonical: overrides.url || `${DEFAULT_METADATA.url}${pageData.canonical}`,
    },
  };
}

/**
 * Generate metadata for sport pages
 * @param {string} sportId - Sport identifier (e.g., 'basketball', 'futsal')
 * @param {object} overrides - Custom metadata overrides
 * @returns {object} Complete metadata object
 */
export function generateSportMetadata(sportId, overrides = {}) {
  const sportData = SPORTS_METADATA[sportId] || DEFAULT_METADATA;
  
  return {
    title: overrides.title || sportData.title,
    description: overrides.description || sportData.description,
    keywords: overrides.keywords || sportData.keywords,
    canonical: overrides.canonical || sportData.canonical,
    openGraph: {
      title: overrides.ogTitle || sportData.title,
      description: overrides.ogDescription || sportData.description,
      type: overrides.ogType || DEFAULT_METADATA.ogType,
      url: overrides.url || `${DEFAULT_METADATA.url}${sportData.canonical}`,
      image: overrides.ogImage || DEFAULT_METADATA.ogImage,
      siteName: DEFAULT_METADATA.siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: overrides.twitterTitle || sportData.title,
      description: overrides.twitterDescription || sportData.description,
      creator: DEFAULT_METADATA.twitterHandle,
      image: overrides.twitterImage || DEFAULT_METADATA.ogImage,
    },
    alternates: {
      canonical: overrides.url || `${DEFAULT_METADATA.url}${sportData.canonical}`,
    },
  };
}

/**
 * Structured data for JSON-LD
 */
export const STRUCTURED_DATA = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Flowternity',
    url: DEFAULT_METADATA.url,
    logo: `${DEFAULT_METADATA.url}/logo.png`,
    sameAs: [
      'https://www.facebook.com/flowternity',
      'https://www.instagram.com/flowternity',
      'https://twitter.com/flowternity',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@flowternity.com',
    },
  },
  sportAcademy: {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Flowternity Academy',
    description: 'Premium multi-sport academy offering classes and coaching.',
    url: DEFAULT_METADATA.url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '[Your Street]',
      addressLocality: '[Your City]',
      postalCode: '[Your Postal Code]',
      addressCountry: 'US',
    },
    telephone: '[Your Phone]',
  },
  breadcrumb: (items) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: `${DEFAULT_METADATA.url}${item.url}`,
    })),
  }),
};
