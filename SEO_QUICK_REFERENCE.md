# SEO Quick Reference Guide

## Adding SEO to a New Page

### Option 1: Using `generateMetadata` Helper

```js
// app/new-page/page.js
import { generateMetadata } from '@/lib/seo';

export const metadata = generateMetadata('page_key', {
  // Optional overrides
  title: 'Custom Title',
  description: 'Custom description',
  keywords: 'custom, keywords',
});

export default function NewPage() {
  return <div>Your page</div>;
}
```

### Option 2: Manual Metadata (Full Control)

```js
export const metadata = {
  title: 'Custom Page | Flowternity',
  description: 'Page description for search results',
  keywords: 'relevant, keywords, here',
  openGraph: {
    title: 'Custom Page',
    description: 'OG description',
    url: 'https://flowternity.com/page',
    image: 'https://flowternity.com/og-image.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom Page',
    description: 'Twitter description',
  },
};
```

## Adding Structured Data to Components

```js
// app/games/[id]/page.js
import { EventSchema, BreadcrumbSchema } from '@/components/structured-data';

export default function GameDetail({ game }) {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Games', url: '/games' },
    { name: game.title, url: `/games/${game.id}` },
  ];

  return (
    <>
      <EventSchema event={{
        title: game.title,
        description: game.description,
        startTime: game.date,
        location: game.location,
        price: game.fee,
      }} />
      <BreadcrumbSchema items={breadcrumbs} />
      {/* Page content */}
    </>
  );
}
```

## Keyword Guidelines

### Title Tags
- **Length:** 50-60 characters
- **Format:** `[Primary Keyword] | Flowternity`
- **Example:** `Basketball Classes | Flowternity Academy`

### Meta Descriptions
- **Length:** 150-160 characters
- **Include:** Main keyword, call-to-action
- **Example:** `Join elite basketball training on international courts. Book your session today.`

### Keywords
- Include 3-5 relevant terms
- Mix broad + long-tail keywords
- Avoid keyword stuffing

## Sitemap Management

The sitemap auto-generates at `/sitemap.xml`

To add a new route:
1. Edit `app/sitemap.js`
2. Add route to `staticRoutes` array:

```js
{
  url: '/new-section',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.8,
}
```

## Robots.txt Management

Edit `public/robots.txt` to:
- Block new admin pages: `Disallow: /admin/new-section/`
- Allow public pages: `Allow: /new-section/`
- Control crawl speed: `Crawl-delay: 1`

## Common SEO Tasks

### 1. Monitor Search Rankings

Use these free tools:
- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)

### 2. Check Page Performance

```bash
# Lighthouse CLI
npm install -g lighthouse
lighthouse https://flowternity.com/memberships
```

### 3. Validate Structured Data

Visit [Google Rich Results Test](https://search.google.com/test/rich-results)
- Paste URL or HTML
- Check for errors

### 4. Test Social Sharing

Visit [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- See how page appears on social media
- Force refresh cache if needed

## Metadata Priority Levels

```
Layout (Global) ← Page (Specific) ← Manual Override
```

Page metadata overrides layout metadata.
Manual overrides beat generated metadata.

## Common Issues & Fixes

### Issue: Duplicate Meta Tags
**Cause:** Metadata defined in both `layout.js` and `page.js`
**Fix:** Define in `layout.js` only, override in `page.js` if needed

### Issue: Missing Canonical URL
**Cause:** No `alternates.canonical` in metadata
**Fix:** Add to metadata: 
```js
alternates: {
  canonical: 'https://flowternity.com/page-path',
}
```

### Issue: Social Preview Not Updating
**Cause:** Cached by social platform
**Fix:** Use debugger tool to clear cache
- Facebook: [Sharing Debugger](https://developers.facebook.com/tools/debug/)
- Twitter: [Card Validator](https://cards-dev.twitter.com/validator)

### Issue: Schema Not Appearing in Search
**Cause:** Google cache lag (can take weeks)
**Fix:** 
1. Validate with Rich Results Test
2. Request indexing in Search Console
3. Wait for re-crawl (typically 7-14 days)

## Sport Pages Template

All 5 sport pages follow this pattern:

```
/academy/[sport]/layout.js
  ↓ (generateMetadata)
  → Sport-specific metadata

/academy/[sport]/page.js
  ↓ (uses layout metadata)
  → Hero section with sport name
  → Intro section
  → Upcoming games
  → Tournaments
  → Progression levels
  → Final CTA
```

To add a new sport:
1. Update `SPORTS` in `lib/flowternity/config.js`
2. Add to `SPORTS_METADATA` in `lib/seo.js`
3. Add to `staticRoutes` in `app/sitemap.js`
4. Academy page auto-renders at `/academy/[new-sport]`

## Environment Variables

Required in `.env.local`:

```env
# Base URL for canonical tags and sitemap
NEXT_PUBLIC_BASE_URL=https://flowternity.com
```

## Search Console Setup

1. **Add Property**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Add `https://flowternity.com`

2. **Verify Ownership**
   - Add DNS record, or
   - Upload verification file, or
   - Add meta tag to `app/layout.js`

3. **Submit Sitemap**
   - Sitemaps > New sitemap
   - Submit: `https://flowternity.com/sitemap.xml`

4. **Monitor Performance**
   - Track queries, clicks, impressions
   - Monitor mobile usability
   - Check coverage (indexed pages)

## Analytics Setup

Add to `app/layout.js`:

```js
// Google Analytics 4
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script dangerouslySetInnerHTML={{__html: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
`}} />
```

## Monthly SEO Checklist

- [ ] Monitor Search Console for errors
- [ ] Check Core Web Vitals in PageSpeed Insights
- [ ] Review top search queries and CTR
- [ ] Check for crawl errors
- [ ] Verify mobile usability
- [ ] Test social sharing (Facebook, Twitter)
- [ ] Update content on evergreen pages
- [ ] Monitor site speed/performance

## Quarterly SEO Review

- [ ] Audit meta titles & descriptions
- [ ] Check for duplicate content
- [ ] Review keyword rankings
- [ ] Update outdated content
- [ ] Test schema markup validity
- [ ] Review internal linking
- [ ] Analyze competitor keywords
- [ ] Plan new content

---

**Last Updated:** July 23, 2026
**Status:** ✅ Ready for production
