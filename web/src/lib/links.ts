import { getPathname } from '@/i18n/navigation'
import { DETAIL_ROUTE, type Locale } from '@/i18n/routing'
import type { ButtonLink, Link as LinkGroup } from '@/payload-types'

export type ResolvedLink = {
  href: string
  label: string
  external: boolean
  newTab: boolean
  style?: 'primary' | 'outline' | 'ghost'
}

type Linkable = keyof typeof DETAIL_ROUTE

/** Adresse publique d'un contenu (slug dans la langue courante). */
export function hrefFor(
  locale: Locale,
  collection: Linkable,
  slug: string,
  homePageSlug?: string,
): string {
  if (collection === 'pages' && slug === homePageSlug) return getPathname({ locale, href: '/' })
  return getPathname({ locale, href: { pathname: DETAIL_ROUTE[collection], params: { slug } } })
}

/** Chemin interne saisi sans langue (« /secteurs ») → « /fr/secteurs ». */
function localizeCustom(locale: Locale, url: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(url)) return url
  const path = url.startsWith('/') ? url : `/${url}`
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}

/** Résout un lien de l'admin (référence ou adresse saisie). Renvoie null si incomplet. */
export function resolveLink(
  locale: Locale,
  link: LinkGroup | ButtonLink | null | undefined,
  homePageSlug?: string,
): ResolvedLink | null {
  if (!link?.label) return null
  const style = 'style' in link && link.style ? link.style : undefined
  const newTab = Boolean(link.newTab)
  if (link.type === 'reference') {
    const ref = link.reference
    if (!ref || typeof ref.value !== 'object' || !ref.value) return null
    const slug = (ref.value as { slug?: string }).slug
    if (!slug) return null
    return {
      href: hrefFor(locale, ref.relationTo, slug, homePageSlug),
      label: link.label,
      external: false,
      newTab,
      style,
    }
  }
  if (!link.url) return null
  const href = localizeCustom(locale, link.url)
  return { href, label: link.label, external: /^https?:/.test(href), newTab, style }
}
