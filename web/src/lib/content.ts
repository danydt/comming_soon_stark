import 'server-only'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import type {
  Brand,
  Footer,
  Header,
  Page,
  Partner,
  Post,
  Product,
  Project,
  Sector,
  SiteSetting,
  Team,
} from '@/payload-types'
import type { Locale } from '@/i18n/routing'

import { tags } from './revalidate'

/**
 * Lecture du contenu pour le site public (D24) :
 * - API locale de Payload avec les règles d'accès publiques (`overrideAccess: false`, pas d'utilisateur) :
 *   seul le contenu publié est lu, et les montants non autorisés sont retirés ;
 * - résultats mis en cache (`unstable_cache`) avec les étiquettes invalidées par les hooks Payload (D20).
 *   En dev, pas de cache persistant (le seed ne revalide rien) : simple dédoublonnage par requête.
 */
const payload = () => getPayload({ config })

const PUBLIC = { overrideAccess: false, draft: false } as const
const DEPTH = 1

function cached<F extends (...args: never[]) => Promise<unknown>>(
  name: string,
  fn: F,
  tagsFor: (...args: Parameters<F>) => string[],
): F {
  if (process.env.NODE_ENV === 'development') return cache(fn) as unknown as F
  return ((...args: Parameters<F>) =>
    unstable_cache(() => fn(...args), [name, JSON.stringify(args)], {
      tags: tagsFor(...args),
    })()) as F
}

/* ---------------------------------------------------------------- Globals */

export const getSettings = cached(
  'settings',
  async (locale: Locale) =>
    (await payload()).findGlobal({
      slug: 'site-settings',
      locale,
      depth: 1,
      ...PUBLIC,
    }) as Promise<SiteSetting>,
  (locale) => [tags.global('site-settings', locale), tags.collection('pages', locale)],
)

export const getHeader = cached(
  'header',
  async (locale: Locale) =>
    (await payload()).findGlobal({
      slug: 'header',
      locale,
      depth: 1,
      ...PUBLIC,
    }) as Promise<Header>,
  (locale) => [tags.global('header', locale), ...linkTargets(locale)],
)

export const getFooter = cached(
  'footer',
  async (locale: Locale) =>
    (await payload()).findGlobal({
      slug: 'footer',
      locale,
      depth: 1,
      ...PUBLIC,
    }) as Promise<Footer>,
  (locale) => [tags.global('footer', locale), ...linkTargets(locale)],
)

/** Les liens « contenu du site » dépendent des slugs de ces collections. */
const linkTargets = (locale: Locale) =>
  ['pages', 'sectors', 'projects', 'products', 'posts'].map((c) => tags.collection(c, locale))

/* -------------------------------------------------------- Requêtes génériques */

type Collection =
  'pages' | 'sectors' | 'projects' | 'products' | 'brands' | 'posts' | 'team' | 'partners'

async function findOne<T>(collection: Collection, locale: Locale, slug: string): Promise<T | null> {
  const res = await (
    await payload()
  ).find({
    collection,
    locale,
    depth: DEPTH,
    limit: 1,
    pagination: false,
    where: { slug: { equals: slug } },
    ...PUBLIC,
  })
  return (res.docs[0] as T | undefined) ?? null
}

type ListOptions = { where?: Where; sort?: string; limit?: number; page?: number; depth?: number }

async function findMany<T>(collection: Collection, locale: Locale, opts: ListOptions = {}) {
  const res = await (
    await payload()
  ).find({
    collection,
    locale,
    depth: opts.depth ?? DEPTH,
    where: opts.where,
    sort: opts.sort,
    limit: opts.limit ?? 100,
    page: opts.page ?? 1,
    ...PUBLIC,
  })
  return { ...res, docs: res.docs as T[] }
}

const docTag = (collection: Collection, locale: Locale, slug: string) => [
  tags.collection(collection, locale),
  tags.doc(collection, locale, slug),
]

/** Slugs publiés d'une collection, pour `generateStaticParams`. */
export const listSlugs = cached(
  'slugs',
  async (collection: Collection, locale: Locale) =>
    (await findMany<{ slug: string }>(collection, locale, { depth: 0, limit: 1000 })).docs.map(
      (d) => d.slug,
    ),
  (collection, locale) => [tags.collection(collection, locale)],
)

/**
 * Slugs d'un document dans chaque langue (sélecteur de langue → page équivalente).
 * Lu sans repli de langue : un slug absent en anglais retombe sur le slug français.
 */
export const getSlugs = cached(
  'alt-slugs',
  async (collection: Collection, id: number | string) => {
    const doc = (await (
      await payload()
    ).findByID({
      collection,
      id,
      locale: 'all',
      depth: 0,
      ...PUBLIC,
    })) as unknown as { slug?: Partial<Record<Locale, string>> }
    const fr = doc.slug?.fr ?? ''
    return { fr, en: doc.slug?.en || fr } satisfies Record<Locale, string>
  },
  (collection) => [tags.collection(collection, 'fr'), tags.collection(collection, 'en')],
)

/* ------------------------------------------------------------------ Pages */

export const getPage = cached(
  'page',
  (locale: Locale, slug: string) => findOne<Page>('pages', locale, slug),
  (locale, slug) => [...docTag('pages', locale, slug), ...relatedForBlocks(locale)],
)

/** Les blocs affichent des secteurs, projets, équipe, partenaires et actualités. */
const relatedForBlocks = (locale: Locale) =>
  ['sectors', 'projects', 'team', 'partners', 'posts', 'media'].map((c) =>
    tags.collection(c, locale),
  )

/* --------------------------------------------------------------- Secteurs */

export const listSectors = cached(
  'sectors',
  async (locale: Locale) => (await findMany<Sector>('sectors', locale, { sort: 'order' })).docs,
  (locale) => [tags.collection('sectors', locale)],
)

export const getSector = cached(
  'sector',
  (locale: Locale, slug: string) => findOne<Sector>('sectors', locale, slug),
  (locale, slug) => docTag('sectors', locale, slug),
)

/* ----------------------------------------------------------- Réalisations */

export type ProjectFilters = {
  sector?: number | string
  province?: string
  featured?: boolean
  ids?: (number | string)[]
  limit?: number
}

export const listProjects = cached(
  'projects',
  async (locale: Locale, f: ProjectFilters = {}) => {
    const and: Where[] = []
    if (f.sector) and.push({ sector: { equals: f.sector } })
    if (f.province) and.push({ provinces: { in: [f.province] } })
    if (f.featured) and.push({ featured: { equals: true } })
    if (f.ids?.length) and.push({ id: { in: f.ids } })
    return (
      await findMany<Project>('projects', locale, {
        where: and.length ? { and } : undefined,
        sort: '-featured,-updatedAt',
        limit: f.limit ?? 100,
      })
    ).docs
  },
  (locale) => [tags.collection('projects', locale), tags.collection('sectors', locale)],
)

export const getProject = cached(
  'project',
  (locale: Locale, slug: string) => findOne<Project>('projects', locale, slug),
  (locale, slug) => [
    ...docTag('projects', locale, slug),
    tags.collection('partners', locale),
    tags.collection('team', locale),
    tags.collection('sectors', locale),
  ],
)

/* -------------------------------------------------------------- Catalogue */

export type ProductFilters = { category?: string; brand?: number | string }

export const listProducts = cached(
  'products',
  async (locale: Locale, f: ProductFilters = {}) => {
    const and: Where[] = []
    if (f.category) and.push({ category: { equals: f.category } })
    if (f.brand) and.push({ brand: { equals: f.brand } })
    return (
      await findMany<Product>('products', locale, {
        where: and.length ? { and } : undefined,
        sort: 'name',
      })
    ).docs
  },
  (locale) => [tags.collection('products', locale), tags.collection('brands', locale)],
)

export const getProduct = cached(
  'product',
  (locale: Locale, slug: string) => findOne<Product>('products', locale, slug),
  (locale, slug) => [...docTag('products', locale, slug), tags.collection('brands', locale)],
)

export const listBrands = cached(
  'brands',
  async (locale: Locale) => (await findMany<Brand>('brands', locale, { sort: 'name' })).docs,
  (locale) => [tags.collection('brands', locale)],
)

/* ------------------------------------------------------------- Actualités */

export const POSTS_PER_PAGE = 9

export const listPosts = cached(
  'posts',
  async (locale: Locale, page = 1, limit = POSTS_PER_PAGE) => {
    const res = await findMany<Post>('posts', locale, { sort: '-publishedAt', limit, page })
    return { docs: res.docs, page: res.page ?? 1, totalPages: res.totalPages }
  },
  (locale) => [tags.collection('posts', locale)],
)

export const getPost = cached(
  'post',
  (locale: Locale, slug: string) => findOne<Post>('posts', locale, slug),
  (locale, slug) => docTag('posts', locale, slug),
)

/* ---------------------------------------------------- Équipe, partenaires */

export const listTeam = cached(
  'team',
  async (locale: Locale, groups: string[] = []) =>
    (
      await findMany<Team>('team', locale, {
        where: groups.length ? { group: { in: groups } } : undefined,
        sort: 'order',
      })
    ).docs,
  (locale) => [tags.collection('team', locale)],
)

export const listPartners = cached(
  'partners',
  async (locale: Locale, types: string[] = []) =>
    (
      await findMany<Partner>('partners', locale, {
        where: types.length ? { type: { in: types } } : undefined,
        sort: 'order',
      })
    ).docs,
  (locale) => [tags.collection('partners', locale)],
)
