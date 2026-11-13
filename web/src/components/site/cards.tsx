import { ArrowRight, MapPin } from 'lucide-react'
import NextLink from 'next/link'
import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { hrefFor } from '@/lib/links'
import { PROVINCES } from '@/lib/provinces'
import { cn } from '@/lib/utils'
import type { Partner, Post, Product, Project, Sector, Team } from '@/payload-types'

import { MediaImage, SectorIcon, initials } from './primitives'

export const provinceName = (value: string, locale: Locale) =>
  PROVINCES.find((p) => p.value === value)?.[locale] ?? value

export function formatAmount(locale: Locale, value: number, currency: string) {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(locale: Locale, iso: string) {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

const cardBase =
  'group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface transition-shadow hover:shadow-[0_8px_30px_rgba(12,12,12,0.08)]'

/** Lien qui couvre toute la carte (un seul lien par carte, accessible). */
const stretched = "after:absolute after:inset-0 after:content-['']"

/* ----------------------------------------------------------------- Secteur */

export function SectorCard({ sector, locale }: { sector: Sector; locale: Locale }) {
  return (
    <article className={cn(cardBase, 'p-6')}>
      <span className="mb-5 inline-flex size-12 items-center justify-center rounded-full bg-surface-warm text-brand-red">
        <SectorIcon name={sector.icon} className="size-6" />
      </span>
      <h3 className="text-xl">
        <NextLink
          href={hrefFor(locale, 'sectors', sector.slug)}
          className={cn(stretched, 'rounded-sm group-hover:text-brand-red')}
        >
          {sector.title}
        </NextLink>
      </h3>
      <p className="mt-3 text-[0.9375rem] text-text-muted">{sector.tagline}</p>
      <ArrowRight
        aria-hidden="true"
        className="mt-auto size-5 translate-y-4 text-brand-red transition-transform group-hover:translate-x-1"
      />
    </article>
  )
}

/* ----------------------------------------------------------------- Projet */

export async function ProjectCard({ project, locale }: { project: Project; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'projects' })
  const sector = typeof project.sector === 'object' ? project.sector : null
  const count = project.beneficiaries?.count
  return (
    <article className={cardBase}>
      {project.coverImage && typeof project.coverImage === 'object' && (
        <div className="relative aspect-[16/10] bg-surface-warm">
          <MediaImage
            media={project.coverImage}
            size="card"
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow mb-2 text-xs">
          {project.featured ? t('featured') : (sector?.title ?? '')}
        </p>
        <h3 className="text-lg leading-snug">
          <NextLink
            href={hrefFor(locale, 'projects', project.slug)}
            className={cn(stretched, 'rounded-sm group-hover:text-brand-red')}
          >
            {project.title}
          </NextLink>
        </h3>
        <p className="mt-3 line-clamp-3 text-[0.9375rem] text-text-muted">{project.summary}</p>
        <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-5 text-sm">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">{t('location')}</dt>
            <MapPin aria-hidden="true" className="size-4 text-brand-grey" />
            <dd>{project.location}</dd>
          </div>
          {typeof count === 'number' && (
            <div>
              <dt className="sr-only">{t('cases', { count })}</dt>
              <dd className="font-semibold">
                {t(
                  project.beneficiaries?.unit === 'beneficiaries'
                    ? 'beneficiaries'
                    : project.beneficiaries?.unit === 'sensitized'
                      ? 'sensitized'
                      : 'cases',
                  { count },
                )}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------- Actualité */

export async function PostCard({ post, locale }: { post: Post; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'posts' })
  return (
    <article className={cardBase}>
      {post.coverImage && typeof post.coverImage === 'object' && (
        <div className="relative aspect-[16/10] bg-surface-warm">
          <MediaImage
            media={post.coverImage}
            size="card"
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow mb-2 text-xs">
          {t(`categories.${post.category}`)} ·{' '}
          <time dateTime={post.publishedAt}>{formatDate(locale, post.publishedAt)}</time>
        </p>
        <h3 className="text-lg leading-snug">
          <NextLink
            href={hrefFor(locale, 'posts', post.slug)}
            className={cn(stretched, 'rounded-sm group-hover:text-brand-red')}
          >
            {post.title}
          </NextLink>
        </h3>
        <p className="mt-3 line-clamp-3 text-[0.9375rem] text-text-muted">{post.excerpt}</p>
      </div>
    </article>
  )
}

/* ---------------------------------------------------------------- Produit */

export async function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'products' })
  const brand = typeof product.brand === 'object' ? product.brand : null
  const photo = product.photos?.[0]
  return (
    <article className={cardBase}>
      <div className="relative aspect-square bg-surface-warm">
        {photo && typeof photo === 'object' && (
          <MediaImage
            media={photo}
            size="card"
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-4"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow mb-2 text-xs">{t(`categories.${product.category}`)}</p>
        <h3 className="text-lg leading-snug">
          <NextLink
            href={hrefFor(locale, 'products', product.slug)}
            className={cn(stretched, 'rounded-sm group-hover:text-brand-red')}
          >
            {product.name}
          </NextLink>
        </h3>
        {brand && <p className="mt-1 text-sm text-text-muted">{brand.name}</p>}
        <p className="mt-auto pt-4">
          <AvailabilityBadge
            value={product.availability}
            label={t(`availability.${product.availability}`)}
          />
        </p>
      </div>
    </article>
  )
}

export function AvailabilityBadge({ value, label }: { value: string; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        value === 'available' && 'bg-[#e8f3e9] text-success',
        value === 'on-order' && 'bg-[#fbf0e0] text-warning',
        value === 'unavailable' && 'bg-surface-warm text-text-muted',
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

/* ----------------------------------------------------------------- Équipe */

export async function TeamGrid({ members, locale }: { members: Team[]; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'team' })
  if (!members.length) return null
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {members.map((m) => (
        <li key={m.id} className="rounded-[var(--radius-card)] border border-line bg-surface p-6">
          <div className="mb-4 size-20 overflow-hidden rounded-full bg-surface-warm">
            {m.photo && typeof m.photo === 'object' ? (
              <MediaImage
                media={m.photo}
                size="thumbnail"
                sizes="80px"
                className="size-full object-cover"
              />
            ) : (
              <span
                role="img"
                aria-label={t('initials', { name: m.name })}
                className="flex size-full items-center justify-center font-heading text-2xl font-extrabold text-brand-red"
              >
                {initials(m.name)}
              </span>
            )}
          </div>
          <h3 className="text-lg leading-snug">{m.name}</h3>
          <p className="mt-1 text-sm font-semibold text-brand-red">{m.role}</p>
          {m.bio && <p className="mt-3 text-sm text-text-muted">{m.bio}</p>}
          {(m.training || m.experience) && (
            <dl className="mt-3 space-y-1 text-sm">
              {m.training && (
                <div>
                  <dt className="inline font-semibold">{t('training')} : </dt>
                  <dd className="inline text-text-muted">{m.training}</dd>
                </div>
              )}
              {m.experience && (
                <div>
                  <dt className="inline font-semibold">{t('experience')} : </dt>
                  <dd className="inline text-text-muted">{m.experience}</dd>
                </div>
              )}
            </dl>
          )}
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------ Partenaires */

export async function PartnerList({ partners, locale }: { partners: Partner[]; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'partners' })
  if (!partners.length) return null
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {partners.map((p) => {
        const body = (
          <>
            {p.logo && typeof p.logo === 'object' ? (
              <MediaImage
                media={p.logo}
                size="thumbnail"
                sizes="160px"
                className="h-12 w-auto object-contain"
              />
            ) : (
              <span className="font-heading text-lg leading-snug font-extrabold">{p.name}</span>
            )}
            <span className="eyebrow mt-2 block text-[0.6875rem]">{t(`types.${p.type}`)}</span>
          </>
        )
        return (
          <li
            key={p.id}
            className="flex min-h-28 flex-col justify-center rounded-[var(--radius-card)] border border-line bg-surface px-6 py-5"
          >
            {p.url ? (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm hover:text-brand-red"
              >
                {body}
              </a>
            ) : (
              body
            )}
          </li>
        )
      })}
    </ul>
  )
}

/* --------------------------------------------------------- Chiffres clés */

export function FiguresGrid({
  items,
  dark = false,
}: {
  items: { id?: string | null; value: string; label: string }[]
  dark?: boolean
}) {
  if (!items.length) return null
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
      {items.map((f, i) => (
        <div key={f.id ?? i} className="flex flex-col border-l-2 border-brand-red pl-4">
          {/* Le libellé (dt) précède la valeur dans le code, mais la valeur s'affiche en premier. */}
          <dt
            className={cn(
              'order-2 mt-1 text-[0.9375rem]',
              dark ? 'text-[#e6e6e6]' : 'text-text-muted',
            )}
          >
            {f.label}
          </dt>
          <dd className="order-1 font-heading text-[clamp(1.75rem,5vw,2.5rem)] leading-none font-extrabold">
            {f.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/* ------------------------------------------------------------ Projet phare */

export async function FeaturedProject({
  project,
  locale,
  eyebrow,
}: {
  project: Project
  locale: Locale
  eyebrow?: string | null
}) {
  const t = await getTranslations({ locale, namespace: 'projects' })
  const count = project.beneficiaries?.count
  const funders = (project.funders ?? []).filter((f): f is Partner => typeof f === 'object')
  return (
    <section className="bg-brand-black py-14 text-white sm:py-20">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {project.coverImage && typeof project.coverImage === 'object' && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-white/10">
            <MediaImage
              media={project.coverImage}
              size="hero"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        )}
        <div>
          <p className="eyebrow mb-3 text-[0.8125rem] text-[#c4c4c4]">{eyebrow || t('featured')}</p>
          <h2 className="text-[clamp(1.75rem,5vw,2.75rem)]">{project.title}</h2>
          <p className="mt-5 text-[1.0625rem] text-[#e6e6e6]">{project.summary}</p>
          <dl className="mt-8 grid gap-5 sm:grid-cols-2">
            {typeof count === 'number' && (
              <div className="border-l-2 border-brand-red pl-4">
                <dt className="sr-only">{t('cases', { count })}</dt>
                <dd className="font-heading text-3xl font-extrabold">{count}</dd>
                <dd className="text-sm text-[#c4c4c4]">{t('casesLabel')}</dd>
              </div>
            )}
            <div className="border-l-2 border-brand-red pl-4">
              <dt className="text-sm text-[#c4c4c4]">{t('location')}</dt>
              <dd className="font-semibold">{project.location}</dd>
            </div>
            {funders.length > 0 && (
              <div className="border-l-2 border-brand-red pl-4 sm:col-span-2">
                <dt className="text-sm text-[#c4c4c4]">{t('funders')}</dt>
                <dd className="font-semibold">{funders.map((f) => f.name).join(', ')}</dd>
              </div>
            )}
          </dl>
          <NextLink
            href={hrefFor(locale, 'projects', project.slug)}
            className="mt-10 inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-brand-red bg-brand-red px-5 py-3 font-semibold text-white hover:border-brand-red-deep hover:bg-brand-red-deep"
          >
            {t('seeProject')}
            <ArrowRight aria-hidden="true" className="size-5" />
          </NextLink>
        </div>
      </div>
    </section>
  )
}
