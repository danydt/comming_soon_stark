import { routing, type AppPathname, type Locale } from './routing'

/**
 * Adresse publique localisée d'une route interne : `/secteurs/[slug]` + `en` + `health`
 * → `/en/sectors/health`. Même résultat que `getPathname` de next-intl (`localePrefix: 'always'`),
 * mais sans `createNavigation` : celui-ci expose un composant `Link` client qui embarquait
 * `intl-messageformat` dans le JavaScript de chaque page (~10 Ko gzip), alors que tous nos
 * liens sont calculés côté serveur.
 */
type Href =
  | AppPathname
  | {
      pathname: AppPathname
      params?: Record<string, string>
      query?: Record<string, string>
    }

export function getPathname({ locale, href }: { locale: Locale; href: Href }): string {
  const { pathname, params, query } = typeof href === 'string' ? { pathname: href } : href
  const entry: string | Record<Locale, string> = routing.pathnames[pathname]
  const template = typeof entry === 'string' ? entry : entry[locale]
  const path = template.replace(/\[([^\]]+)\]/g, (_, key: string) => {
    const value = params?.[key]
    if (value === undefined) throw new Error(`Paramètre « ${key} » manquant pour ${pathname}`)
    return encodeURIComponent(value)
  })
  const search = query && Object.keys(query).length ? `?${new URLSearchParams(query)}` : ''
  return `/${locale}${path === '/' ? '' : path}${search}`
}
