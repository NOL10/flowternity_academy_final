/**
 * JSON-LD Structured Data Component
 * Renders JSON-LD for SEO schema markup
 */

export function StructuredData({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Flowternity',
    url: 'https://flowternity.com',
    logo: 'https://flowternity.com/logo.png',
    description: 'Premium multi-sport academy offering classes, coaching, and memberships.',
    sameAs: [
      'https://www.facebook.com/flowternity',
      'https://www.instagram.com/flowternity',
      'https://twitter.com/flowternity',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@flowternity.com',
      availableLanguage: 'en',
    },
  };

  return <StructuredData data={schema} />;
}

export function SportAcademySchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Flowternity Academy',
    description: 'Premier multi-sport training facility offering classes in basketball, futsal, skateboarding, karate, and skating.',
    url: 'https://flowternity.com',
    image: 'https://flowternity.com/og-image.png',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      description: 'Flexible membership plans for all sports and skill levels',
    },
  };

  return <StructuredData data={schema} />;
}

export function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Flowternity Academy',
    '@type': 'SportsActivityLocation',
    url: 'https://flowternity.com',
    telephone: '[Your Phone Number]',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '[Your Street Address]',
      addressLocality: '[Your City]',
      postalCode: '[Your Postal Code]',
      addressCountry: 'US',
    },
    image: 'https://flowternity.com/og-image.png',
    description: 'Premium sports academy with multiple facilities and world-class coaching.',
  };

  return <StructuredData data={schema} />;
}

export function BreadcrumbSchema({ items }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://flowternity.com${item.url}`,
    })),
  };

  return <StructuredData data={schema} />;
}

export function EventSchema({ event }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: event.startTime,
    endDate: event.endTime,
    location: {
      '@type': 'Place',
      name: event.location || 'Flowternity Academy',
    },
    organizer: {
      '@type': 'Organization',
      name: 'Flowternity',
      url: 'https://flowternity.com',
    },
    offers: {
      '@type': 'Offer',
      url: event.url || 'https://flowternity.com/games',
      priceCurrency: 'USD',
      price: event.price || '0',
      availability: 'https://schema.org/PreOrder',
    },
  };

  return <StructuredData data={schema} />;
}

export function CoachSchema({ coach }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: coach.name,
    jobTitle: coach.role,
    description: coach.bio,
    image: coach.image,
    url: coach.url || 'https://flowternity.com/coaches',
  };

  return <StructuredData data={schema} />;
}

export function CourseSchema({ course }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'Flowternity Academy',
      url: 'https://flowternity.com',
    },
    offers: {
      '@type': 'Offer',
      url: course.url || 'https://flowternity.com/memberships',
      priceCurrency: 'USD',
      price: course.price,
      pricingMode: 'subscription',
    },
  };

  return <StructuredData data={schema} />;
}
