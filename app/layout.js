import { Geist } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { PostProvider } from '@/context/PostContext'
import { Toaster } from '@/components/ui/sonner'

const geist = Geist({ subsets: ['latin'] })

export const metadata = {
  title:       'PostSaathi — Schedule Smarter',
  description: 'Schedule and publish LinkedIn posts with AI-powered captions. Save time, grow your audience.',
  keywords:    'social media scheduler, LinkedIn scheduler, AI captions, PostSaathi, schedule posts',

  // ── Open Graph ─────────────────────────────────────────
  openGraph: {
    title:       'PostSaathi — Schedule Smarter',
    description: 'Schedule and publish LinkedIn posts with AI-powered captions.',
    url:         'https://postsaathi.vercel.app',
    siteName:    'PostSaathi',
    images: [
      {
        url:    'https://postsaathi.vercel.app/og-image.png',
        width:  1200,
        height: 630,
        alt:    'PostSaathi — Social Media Scheduler',
      },
    ],
    type:   'website',
    locale: 'en_US',
  },

  // ── Twitter Card ───────────────────────────────────────
  twitter: {
    card:        'summary_large_image',
    title:       'PostSaathi — Schedule Smarter',
    description: 'Schedule and publish LinkedIn posts with AI-powered captions.',
    images:      ['https://postsaathi.vercel.app/og-image.png'],
  },

  // ── Icons ──────────────────────────────────────────────
  icons: {
    icon:        '/icon.png',
    apple:       '/apple-icon.png',
    shortcut:    '/favicon.ico',
  },

  // ── Other ──────────────────────────────────────────────
  metadataBase:     new URL('https://postsaathi.vercel.app'),
  applicationName:  'PostSaathi',
  authors:          [{ name: 'PostSaathi' }],
  creator:          'PostSaathi',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className}>
        <AuthProvider>
          <PostProvider>
            {children}
            <Toaster richColors position="top-right" />
          </PostProvider>
        </AuthProvider>
      </body>
    </html>
  )
}