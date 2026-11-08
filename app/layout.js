import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'
import SiteFooter from '@/components/site-footer'
import WhatsAppFloat from '@/components/whatsapp-float'
import { OrganizationSchema, SportAcademySchema, LocalBusinessSchema } from '@/components/structured-data'

export const metadata = {
  title: 'Flowternity — Premium Sports Academy',
  description: 'Train with purpose. Book multi-sport classes, manage memberships, and access world-class facilities. Basketball, futsal, skateboarding, karate, and more.',
  keywords: 'sports academy, basketball, futsal, skateboarding, karate, skating, classes, memberships, training',
  authors: [{ name: 'Flowternity' }],
  creator: 'Flowternity',
  publisher: 'Flowternity',
  formatDetection: {
    email: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/favicon/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/favicon/site.webmanifest',
  openGraph: {
    title: 'Flowternity — Premium Sports Academy',
    description: 'Train with purpose. Book multi-sport classes and memberships at our world-class facility.',
    url: 'https://flowternity.com',
    siteName: 'Flowternity',
    images: [
      {
        url: 'https://flowternity.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Flowternity Academy',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flowternity — Premium Sports Academy',
    description: 'Train with purpose. Book multi-sport classes and memberships.',
    creator: '@flowternity',
    images: ['https://flowternity.com/og-image.png'],
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
        {/* Structured Data */}
        <OrganizationSchema />
        <SportAcademySchema />
        <LocalBusinessSchema />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://images.stockcake.com" />
        
        {/* Canonical URL (dynamic per page) */}
        <meta property="og:url" content="https://flowternity.com" />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
        <SiteFooter />
        <Toaster position="top-center" richColors />
        <WhatsAppFloat />
      </body>
    </html>
  )
}
