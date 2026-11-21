import { describe, expect, it } from 'vitest'

import { getPathname } from '@/i18n/navigation'

describe('adresses localisées (getPathname)', () => {
  it('accueil', () => {
    expect(getPathname({ locale: 'fr', href: '/' })).toBe('/fr')
    expect(getPathname({ locale: 'en', href: '/' })).toBe('/en')
  })

  it('listes traduites', () => {
    expect(getPathname({ locale: 'fr', href: '/secteurs' })).toBe('/fr/secteurs')
    expect(getPathname({ locale: 'en', href: '/secteurs' })).toBe('/en/sectors')
    expect(getPathname({ locale: 'en', href: '/realisations' })).toBe('/en/projects')
    expect(getPathname({ locale: 'en', href: '/actualites' })).toBe('/en/news')
  })

  it('détail avec slug et filtres', () => {
    expect(
      getPathname({
        locale: 'en',
        href: { pathname: '/secteurs/[slug]', params: { slug: 'health' } },
      }),
    ).toBe('/en/sectors/health')
    expect(
      getPathname({ locale: 'fr', href: { pathname: '/[slug]', params: { slug: 'a-propos' } } }),
    ).toBe('/fr/a-propos')
    expect(
      getPathname({
        locale: 'fr',
        href: { pathname: '/realisations', query: { sector: 'sante', province: 'kwilu' } },
      }),
    ).toBe('/fr/realisations?sector=sante&province=kwilu')
  })

  it('paramètre manquant : erreur explicite', () => {
    expect(() => getPathname({ locale: 'fr', href: '/secteurs/[slug]' })).toThrow(/slug/)
  })
})
