import { defineRouting } from 'next-intl/routing'

/**
 * Adresses localisées (D24). Les clés sont les chemins internes (dossiers de `app/`, en français) ;
 * next-intl réécrit /en/sectors/health → /en/secteurs/health et génère les liens dans chaque langue.
 * `/[slug]` : pages construites dans l'admin (À propos, Contact, pages légales…).
 */
export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  // Toujours /fr/... ou /en/... (la racine / redirige selon le cookie puis Accept-Language).
  localePrefix: 'always',
  localeDetection: true,
  localeCookie: { name: 'NEXT_LOCALE', maxAge: 60 * 60 * 24 * 365 },
  pathnames: {
    '/': '/',
    '/[slug]': '/[slug]',
    '/secteurs': { fr: '/secteurs', en: '/sectors' },
    '/secteurs/[slug]': { fr: '/secteurs/[slug]', en: '/sectors/[slug]' },
    '/realisations': { fr: '/realisations', en: '/projects' },
    '/realisations/[slug]': { fr: '/realisations/[slug]', en: '/projects/[slug]' },
    '/produits': { fr: '/produits', en: '/products' },
    '/produits/[slug]': { fr: '/produits/[slug]', en: '/products/[slug]' },
    '/actualites': { fr: '/actualites', en: '/news' },
    '/actualites/[slug]': { fr: '/actualites/[slug]', en: '/news/[slug]' },
  },
})

export type Locale = (typeof routing.locales)[number]
export type AppPathname = keyof typeof routing.pathnames

export function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value)
}

/** Collection Payload → route de détail (null : page à blocs, servie par `/[slug]`). */
export const DETAIL_ROUTE = {
  pages: '/[slug]',
  sectors: '/secteurs/[slug]',
  projects: '/realisations/[slug]',
  products: '/produits/[slug]',
  posts: '/actualites/[slug]',
} as const satisfies Record<string, AppPathname>
