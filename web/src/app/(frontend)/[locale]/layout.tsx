import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { ReactNode } from 'react'

import '../globals.css'
import { routing } from '@/i18n/routing'
import { serverURL } from '@/lib/env'
import { fontVariables } from '@/lib/fonts'

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const viewport: Viewport = {
  themeColor: '#C00000',
  width: 'device-width',
  initialScale: 1,
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    metadataBase: new URL(serverURL()),
    title: { default: t('siteName'), template: `%s — ${t('siteName')}` },
    description: t('description'),
    alternates: {
      canonical: `/${locale}`,
      languages: { fr: '/fr', en: '/en', 'x-default': '/fr' },
    },
    openGraph: {
      siteName: t('siteName'),
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      alternateLocale: locale === 'fr' ? ['en_US'] : ['fr_FR'],
      images: [{ url: '/brand/og-default.png', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
