import { ArrowRight, Check } from 'lucide-react'
import type { Metadata } from 'next'
import NextLink from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { FiguresGrid, ProjectCard, TeamGrid } from '@/components/site/cards'
import { Breadcrumb } from '@/components/site/nav'
import {
  ButtonLinks,
  Container,
  MediaImage,
  Section,
  SectionHeading,
  SectorIcon,
} from '@/components/site/primitives'
import { RichText } from '@/components/site/RichText'
import { SiteShell } from '@/components/site/SiteShell'
import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { getSector, listProjects, listSlugs, listTeam } from '@/lib/content'
import { contactLink, detailAlternates, initLocale, pageMetadata } from '@/lib/page'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const all = await Promise.all(
    routing.locales.map(async (locale) =>
      (await listSlugs('sectors', locale)).map((slug) => ({ locale, slug })),
    ),
  )
  return all.flat()
}

async function load(params: Props['params']) {
  const locale = await initLocale(params)
  const { slug } = await params
  return { locale, sector: await getSector(locale, decodeURIComponent(slug)) }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, sector } = await load(params)
  if (!sector) return {}
  return pageMetadata({
    locale,
    alternates: await detailAlternates('sectors', sector.id),
    title: sector.title,
    description: sector.tagline,
    image: sector.coverImage,
    meta: sector.meta,
  })
}

export default async function SectorPage({ params }: Props) {
  const { locale, sector } = await load(params)
  if (!sector) notFound()
  const [t, tc, alternates, team, projects, contact] = await Promise.all([
    getTranslations({ locale, namespace: 'sectors' }),
    getTranslations({ locale, namespace: 'common' }),
    detailAlternates('sectors', sector.id),
    sector.teamGroups?.length ? listTeam(locale, sector.teamGroups) : Promise.resolve([]),
    listProjects(locale, { sector: sector.id, limit: 6 }),
    contactLink(locale),
  ])
  const projectsHref = getPathname({
    locale,
    href: { pathname: '/realisations', query: { sector: sector.slug } },
  })
  const hasCover = Boolean(sector.coverImage && typeof sector.coverImage === 'object')

  return (
    <SiteShell locale={locale} alternates={alternates} currentPath={alternates[locale]}>
      <div className="bg-surface-warm">
        <Breadcrumb
          label={tc('breadcrumb')}
          items={[
            { href: getPathname({ locale, href: '/' }), label: tc('home') },
            { href: getPathname({ locale, href: '/secteurs' }), label: t('title') },
            { label: sector.title },
          ]}
        />
        <Container
          className={
            hasCover ? 'grid items-center gap-10 pt-4 pb-12 lg:grid-cols-2 lg:pb-16' : 'pt-4 pb-12'
          }
        >
          <div className="max-w-2xl">
            <span className="mb-5 flex size-14 items-center justify-center rounded-full bg-surface text-brand-red">
              <SectorIcon name={sector.icon} className="size-7" />
            </span>
            <h1 className="text-[clamp(2rem,7vw,3.25rem)] tracking-[-0.015em]">{sector.title}</h1>
            <p className="mt-5 text-[1.0625rem] text-pretty text-[#333] sm:text-lg">
              {sector.tagline}
            </p>
          </div>
          {hasCover && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-line">
              <MediaImage
                media={sector.coverImage}
                size="hero"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </Container>
      </div>

      {(sector.description || sector.keyPoints?.length) && (
        <Section>
          <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
            <div>
              {/* Titre de section pour la hiérarchie (les intertitres du texte riche sont des h3). */}
              <h2 className="sr-only">{t('overview')}</h2>
              <RichText data={sector.description} />
            </div>
            {sector.keyPoints?.length ? (
              <aside
                aria-labelledby="points-cles"
                className="self-start rounded-[var(--radius-card)] border border-line p-6"
              >
                <h2 id="points-cles" className="text-xl">
                  {t('keyPoints')}
                </h2>
                <ul className="mt-5 space-y-3">
                  {sector.keyPoints.map((k, i) => (
                    <li key={k.id ?? i} className="flex gap-3">
                      <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand-red" />
                      <span>{k.text}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}
          </div>
        </Section>
      )}

      {sector.figures?.length ? (
        <Section tone="warm">
          <SectionHeading title={t('figures')} />
          <FiguresGrid items={sector.figures} />
        </Section>
      ) : null}

      {sector.methodology?.length ? (
        <Section>
          <SectionHeading title={t('methodology')} />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sector.methodology.map((step, i) => (
              <li
                key={step.id ?? i}
                className="rounded-[var(--radius-card)] border border-line p-6"
              >
                <p className="eyebrow text-xs">{t('step', { n: i + 1 })}</p>
                <h3 className="mt-2 text-lg">{step.title}</h3>
                {step.text && <p className="mt-2 text-text-muted">{step.text}</p>}
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {team.length ? (
        <Section tone="warm">
          <SectionHeading title={t('team')} />
          <TeamGrid members={team} locale={locale} />
        </Section>
      ) : null}

      {projects.length ? (
        <Section>
          <SectionHeading title={t('projects')} />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <li key={p.id}>
                <ProjectCard project={p} locale={locale} />
              </li>
            ))}
          </ul>
          <NextLink
            href={projectsHref}
            className="mt-8 inline-flex min-h-11 items-center gap-2 font-semibold hover:underline"
          >
            {tc('seeAll')} <ArrowRight aria-hidden="true" className="size-4" />
          </NextLink>
        </Section>
      ) : null}

      <Section tone="dark">
        <div className="max-w-3xl">
          {sector.callout?.title && (
            <h2 className="text-[clamp(1.5rem,4.4vw,2.25rem)]">{sector.callout.title}</h2>
          )}
          {sector.callout?.text && (
            <p className="mt-4 text-[1.0625rem] text-[#e6e6e6]">{sector.callout.text}</p>
          )}
          <ButtonLinks dark className="mt-8" links={[contact]} />
        </div>
      </Section>
    </SiteShell>
  )
}
