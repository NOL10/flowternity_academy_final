# Flowternity Academy SEO Setup

## Overview
Comprehensive SEO implementation for the Flowternity Academy sports platform, optimized for search engines and social media.

## Files Created

### 1. **lib/seo.js**
Central SEO utilities and metadata definitions.
- `DEFAULT_METADATA` - Global site metadata
- `SPORTS_METADATA` - Sport-specific metadata for all 5 sports
- `generateMetadata()` - Create metadata for any page
- `generateSportMetadata()` - Create metadata for sport detail pages
- `STRUCTURED_DATA` - JSON-LD schema definitions

### 2. **components/structured-data.js**
Reusable React components for JSON-LD schema markup.
- `StructuredData` - Generic schema renderer
- `OrganizationSchema` - Organization schema
- `SportAcademySchema` - Educational organization schema
- `LocalBusinessSchema` - Local business schema
- `BreadcrumbSchema` - Breadcrumb navigation schema
- `EventSchema` - Event/class schema
- `CoachSchema` - Coach/person schema
- `CourseSchema` - Course/membership schema

### 3. **app/sitemap.js**
Dynamic sitemap generation for search engines.
- Lists all static routes with priority and change frequency
- Includes all sport pages and main sections
- Automatically generated at `/sitemap.xml`

### 4. **public/robots.txt**
Search engine crawler directives.
- Allows all public pages
- Disallows admin, API, and checkout pages
- Specifies crawl delay and sitemap location

### 5. **app/layout.js** (Updated)
Root layout with enhanced metadata.
- Full OpenGraph tags for social sharing
- Twitter Card metadata
- Structured data schemas embedded
- Robot directives (index, follow, googleBot settings)
- Format detection and viewport settings

## SEO Implementation Details

### Metadata Hierarchy

```
Page-Level Metadata (generateMetadata)
    ↓
Global Metadata (app/layout.js)
    ↓
OpenGraph Tags (social sharing)
    ↓
Structured Data (JSON-LD)
```

### Implemented Pages with SEO

#### Global
- ✅ Root layout - Global metadata, OpenGraph, robots directives
- ✅ Home page (`/`) - Breadcrumb schema, optimized for search

#### Sports (All Pages)
- ✅ `/academy/basketball` - Sport-specific metadata + schema
- ✅ `/academy/futsal` - Sport-specific metadata + schema
- ✅ `/academy/skateboarding` - Sport-specific metadata + schema
- ✅ `/academy/karate` - Sport-specific metadata + schema
- ✅ `/academy/skating` - Sport-specific metadata + schema

#### Other Pages (Metadata Ready)
- `/memberships` - Generated metadata with keywords
- `/games` - Generated metadata for classes/tournaments
- `/coaches` - Generated metadata for team page
- `/trial` - Generated metadata for free trial
- `/dashboard` - No-index for user account pages
- `/profile` - No-index for user account pages

### JSON-LD Schemas Implemented

1. **Organization Schema**
   - Company info, logo, contacts, social links
   - Used in root layout for global visibility

2. **Sport Academy Schema**
   - Educational organization details
   - Courses/memberships offered
   - Used on academy pages

3. **Local Business Schema**
   - Physical location details
   - Address, phone, hours
   - Used on academy pages

4. **Breadcrumb Schema**
   - Navigation path for users
   - Used on all detail pages for better SERP display

5. **Event Schema**
   - Game/class details
   - Date, time, location, registration info
   - Used on game detail pages

6. **Course Schema**
   - Membership/program details
   - Pricing, provider info
   - Used on memberships page

7. **Coach Schema**
   - Staff/instructor details
   - Name, role, bio, image
   - Used on coaches page

## OpenGraph & Social Sharing

All pages include:
- `og:title` - Page title for social preview
- `og:description` - Preview text
- `og:image` - 1200x630px image for social cards
- `og:url` - Canonical URL
- `og:type` - Content type (website, article, etc.)
- `og:siteName` - Brand name

Twitter Card metadata:
- `twitter:card` - Large image format
- `twitter:creator` - Brand handle (@flowternity)
- `twitter:title`, `twitter:description`, `twitter:image`

## Sitemap Structure

```
/
/memberships
/games
/coaches
/trial
/about
/contact
/academy/basketball
/academy/futsal
/academy/skateboarding
/academy/karate
/academy/skating
```

**Priority Levels:**
- Home: 1.0
- Main sections (memberships, games): 0.9
- Sport pages: 0.85
- Other pages: 0.7-0.8

**Change Frequency:**
- Games page: Daily (updated frequently)
- Sport pages & memberships: Weekly
- About, coaches: Monthly

## Robots.txt Configuration

```
User-agent: *
Allow: / (all public pages)
Disallow:
  - /admin/
  - /api/
  - /checkout/
  - /*.json$ (JSON files)
  - /*?*sort= (parametrized sorting)
  - /*?*filter= (parametrized filtering)
  - /*?*page= (pagination parameters)

Crawl-delay: 1
Sitemap: https://flowternity.com/sitemap.xml
```

## Best Practices Implemented

### 1. **Keyword Optimization**
- Unique keywords for each page
- Sport-specific keywords for academy pages
- Long-tail keywords (e.g., "basketball classes near me")
- Internal linking structure optimized for keywords

### 2. **Meta Tags**
- `title` - 50-60 characters for optimal SERP display
- `description` - 150-160 characters with call-to-action
- `keywords` - Relevant search terms for each page
- `canonical` - Prevent duplicate content issues

### 3. **Structured Data**
- JSON-LD format (recommended by Google)
- Breadcrumbs for better navigation
- Organization schema for brand visibility
- Event schema for searchable classes/tournaments

### 4. **Mobile SEO**
- Responsive design maintained
- Mobile-friendly fonts and buttons
- Touch-friendly interactive elements
- Viewport meta tag configured

### 5. **Performance**
- Image preconnect to external domains
- DNS prefetch for external resources
- Sitemap generation is static and lightweight
- No render-blocking resources

### 6. **Social SEO**
- OpenGraph tags for all pages
- Twitter Card implementation
- Consistent branding across social previews
- Rich media support (images)

## Next Steps for SEO Improvement

1. **Analytics Setup**
   - Add Google Analytics 4 (GA4) script
   - Add Google Search Console verification
   - Monitor search rankings and CTR

2. **Additional Schema Markup**
   - AggregateOffer for price comparisons
   - Review/Rating schema for testimonials
   - Video schema for promotional videos

3. **Content Optimization**
   - Expand page descriptions with keywords
   - Add FAQ schema markup
   - Create SEO blog posts for keywords

4. **Technical SEO**
   - Setup XML sitemap auto-submission
   - Implement AMP (Accelerated Mobile Pages) if needed
   - Core Web Vitals optimization
   - Image optimization and lazy loading

5. **Link Building**
   - Internal linking strategy
   - Backlink opportunities
   - Local SEO setup (Google Business Profile)

## Usage Examples

### Using generateMetadata for a new page

```js
import { generateMetadata } from '@/lib/seo';

export const metadata = generateMetadata('memberships', {
  title: 'Custom Title',
  description: 'Custom description',
});

export default function MembershipsPage() {
  // Page component
}
```

### Using Sport-Specific Metadata

```js
import { generateSportMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  return generateSportMetadata(params.sport);
}
```

### Adding Structured Data to a Component

```js
import { EventSchema, BreadcrumbSchema } from '@/components/structured-data';

export default function GameDetail({ game }) {
  return (
    <>
      <EventSchema event={game} />
      <BreadcrumbSchema items={breadcrumbs} />
      {/* Page content */}
    </>
  );
}
```

## Environment Variables

Set `NEXT_PUBLIC_BASE_URL` in `.env.local` for proper canonical URLs:

```env
NEXT_PUBLIC_BASE_URL=https://flowternity.com
```

Default fallback: `https://flowternity.com`

## Testing SEO

### Google Tools
1. **Google Search Console** - https://search.google.com/search-console
   - Submit sitemap
   - Monitor coverage
   - Check mobile usability

2. **Google PageSpeed Insights** - https://pagespeed.web.dev
   - Check performance
   - Mobile/desktop scores

3. **Google Rich Results Test** - https://search.google.com/test/rich-results
   - Validate structured data
   - Preview rich snippets

### Third-Party Tools
1. **Lighthouse** - Built-in Chrome DevTools
2. **SEMrush/Ahrefs** - Rank tracking and analysis
3. **Screaming Frog** - Site crawling and audits

## Monitoring & Maintenance

### Regular Tasks
- Monitor sitemap coverage in Search Console
- Check for crawl errors monthly
- Review Core Web Vitals performance
- Update metadata as content changes
- Monitor search rankings for target keywords

### Annual Review
- Audit page titles and descriptions
- Check for duplicate content issues
- Review structured data validity
- Update schema markup if needed
- Refresh content for evergreen pages

---

**Last Updated:** July 23, 2026
**Next Review:** August 23, 2026
