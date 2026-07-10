import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppShell } from '@/components/layout/app-shell'
import { ThemeProvider } from 'next-themes'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maintainerai.dev'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MaintainerAI — AI-powered operating system for GitHub maintainers',
    template: '%s · MaintainerAI',
  },
  description:
    'Open-source AI platform for GitHub repository management. Triage issues, review pull requests, measure health, and automate maintainer workflows.',
  applicationName: 'MaintainerAI',
  authors: [{ name: 'MaintainerAI Contributors' }],
  keywords: [
    'MaintainerAI',
    'GitHub',
    'open source',
    'maintainer',
    'automation',
    'AI',
    'repository health',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'MaintainerAI',
    title: 'MaintainerAI — AI-powered operating system for GitHub maintainers',
    description:
      'Triage issues, review PRs, measure repository health, and automate maintainer workflows—open source and self-hostable.',
    images: [
      {
        url: '/placeholder.svg',
        width: 1200,
        height: 630,
        alt: 'MaintainerAI dashboard preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MaintainerAI — AI-powered operating system for GitHub maintainers',
    description:
      'Open-source AI platform for GitHub maintainers. Self-hostable, GitHub-native, MIT licensed.',
    images: ['/placeholder.svg'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
