import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'
import SiteFooter from '@/components/site-footer'

export const metadata = {
  title: 'Flowternity — Premium Sports Academy',
  description: 'Train with purpose. Book classes, manage memberships, and access world-class multi-sport facilities.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
        <SiteFooter />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
