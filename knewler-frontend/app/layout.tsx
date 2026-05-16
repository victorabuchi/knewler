import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Knewler — From knowing to mastering',
  description: 'Multi-tenant eLearning platform. Universities, companies and sports clubs launch their own branded training environment in minutes.',
  icons: {
    icon: '/knewler-favicon.svg',
    shortcut: '/knewler-favicon.svg',
    apple: '/knewler-favicon.svg',
  },
  openGraph: {
    title: 'Knewler — From knowing to mastering',
    description: 'Launch your institution\'s eLearning environment in minutes.',
    url: 'https://knewler.com',
    siteName: 'Knewler',
    images: [
      {
        url: '/knewler-logo.svg',
        width: 320,
        height: 80,
        alt: 'Knewler',
      },
    ],
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
