import 'server-only'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import type { Alternates } from '@/components/site/LocaleSwitcher'
import { getPathname } from '@/i18n/navigation'
import { DETAIL_ROUTE, routing, type AppPathname, type Locale } from '@/i18n/routing'
import type { Media } from '@/payload-types'

import { getSettings, getSlugs } from './content'
import { hrefFor, type ResolvedLink } from './links'

/** Valide la langue de l'URL et l'active pour le rendu statique. */
export async function initLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  return locale
}

/** Adresse d'une page de liste dans chaque langue (/fr/realisations, /en/projects). */
export function staticAlternates(href: Exclude<AppPathname, `${string}[slug]`>): Alternates {
  return Object.fromEntries(
    routing.locales.map((l) => [l, getPathname({ locale: l, href })]),
  ) as Alternates
}

/** Adresse d'un contenu dans chaque langue, avec son slug traduit. */
export async function detailAlternates(
  collection: keyof typeof DETAIL_ROUTE,
  id: number,
): Promise<Alternates> {
  const slugs = await getSlugs(collection, id)
  return Object.fromEntries(
    routing.locales.map((l) => [
      l,
      getPathname({
        locale: l,
        href: { pathname: DETAIL_ROUTE[collection], params: { slug: slugs[l] } },
      }),
    ]),
  ) as Alternates
}

type Seo = { title?: string | null; description?: string | null; image?: number | Media | null }

const ogImage = (image: Seo['image']) =>
  image && typeof image === 'object' && image.url
    ? [{ url: image.sizes?.hero?.url ?? image.url, alt: image.alt ?? '' }]
    : [{ url: '/brand/og-default.png', width: 1200, height: 630 }]

/** Métadonnées d'une page : titre, description, canonique, hreflang et Open Graph. */
export async function pageMetadata({
  locale,
  alternates,
  title,
  description,
  image,
  meta,
  isHome = false,
}: {
  locale: Locale
  alternates: Alternates
  title?: string
  description?: string | null
  image?: Seo['image']
  meta?: Seo | null
  isHome?: boolean
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' })
  const finalTitle = meta?.title || title
  const finalDescription = meta?.description || description || t('description')
  return {
    title: isHome ? { absolute: finalTitle || t('siteName') } : finalTitle,
    description: finalDescription,
    alternates: {
      canonical: alternates[locale],
      languages: { ...alternates, 'x-default': alternates[routing.defaultLocale] },
    },
    openGraph: {
      type: 'website',
      siteName: t('siteName'),
      title: finalTitle || t('siteName'),
      description: finalDescription,
      url: alternates[locale],
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      alternateLocale: locale === 'fr' ? ['en_US'] : ['fr_FR'],
      images: ogImage(meta?.image || image),
    },
  }
}

/** Bouton « Nous contacter » vers la page Contact choisie dans les réglages. */
export async function contactLink(
  locale: Locale,
  opts: { label?: string; query?: Record<string, string>; style?: ResolvedLink['style'] } = {},
): Promise<ResolvedLink> {
  const [settings, t] = await Promise.all([
    getSettings(locale),
    getTranslations({ locale, namespace: 'common' }),
  ])
  const page = settings.contactPage
  const base = page && typeof page === 'object' ? hrefFor(locale, 'pages', page.slug) : `/${locale}`
  const query = opts.query ? `?${new URLSearchParams(opts.query).toString()}` : ''
  return {
    href: `${base}${query}`,
    label: opts.label ?? t('contactUs'),
    external: false,
    newTab: false,
    style: opts.style ?? 'primary',
  }
}
