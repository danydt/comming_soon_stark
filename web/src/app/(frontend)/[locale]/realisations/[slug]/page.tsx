import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { formatAmount, provinceName, TeamGrid } from '@/components/site/cards'
import { Breadcrumb } from '@/components/site/nav'
import {
  ButtonLinks,
  Container,
  MediaImage,
  Section,
  SectionHeading,
} from '@/components/site/primitives'
import { RichText } from '@/components/site/RichText'
import { SiteShell } from '@/components/site/SiteShell'
import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { getProject, listSlugs } from '@/lib/content'
import { hrefFor } from '@/lib/links'
import { contactLink, detailAlternates, initLocale, pageMetadata } from '@/lib/page'
import type { Partner, Team } from '@/payload-types'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const all = await Promise.all(
    routing.locales.map(async (locale) =>
      (await listSlugs('projects', locale)).map((slug) => ({ locale, slug })),
    ),
  )
  return all.flat()
}

async function load(params: Props['params']) {
  const locale = await initLocale(params)
  const { slug } = await params
  return { locale, project: await getProject(locale, decodeURIComponent(slug)) }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, project } = await load(params)
  if (!project) return {}
  return pageMetadata({
    locale,
    alternates: await detailAlternates('projects', project.id),
    title: project.title,
    description: project.summary,
    image: project.coverImage,
    meta: project.meta,
  })
}

const objects = <T,>(list: (number | T)[] | null | undefined) =>
  (list ?? []).filter((x): x is T => typeof x === 'object' && x !== null)

export default async function ProjectPage({ params }: Props) {
  const { locale, project } = await load(params)
  if (!project) notFound()
  const [t, tc, alternates, contact] = await Promise.all([
    getTranslations({ locale, namespace: 'projects' }),
    getTranslations({ locale, namespace: 'common' }),
    detailAlternates('projects', project.id),
    contactLink(locale),
  ])
  const sector = typeof project.sector === 'object' ? project.sector : null
  const funders = objects<Partner>(project.funders)
  const partners = objects<Partner>(project.partners)
  const team = objects<Team>(project.team)
  const count = project.beneficiaries?.count
  const unit = project.beneficiaries?.unit ?? 'cases'
  const { start, end } = project.period ?? {}
  const period = start
    ? end && end !== start
      ? `${start} – ${end}`
      : end
        ? `${start}`
        : `${start} – ${t('ongoing')}`
    : null
  // Le montant n'est renvoyé par l'API que si « Afficher le montant » est coché (D22).
  const amount =
    project.amount?.display && project.amount.value != null
      ? formatAmount(locale, project.amount.value, project.amount.currency ?? 'USD')
      : null
  const hasCover = Boolean(project.coverImage && typeof project.coverImage === 'object')

  type Fact = { label: string; value: string }
  const facts = (
    [
      { label: t('location'), value: project.location },
      project.provinces?.length
        ? {
            label: t('province'),
            value: project.provinces.map((p) => provinceName(p, locale)).join(', '),
          }
        : null,
      period ? { label: t('period'), value: period } : null,
      typeof count === 'number' ? { label: t('results'), value: t(unit, { count }) } : null,
      amount ? { label: t('amount'), value: amount } : null,
      funders.length ? { label: t('funders'), value: funders.map((f) => f.name).join(', ') } : null,
      partners.length
        ? { label: t('partners'), value: partners.map((f) => f.name).join(', ') }
        : null,
    ] satisfies (Fact | null)[]
  ).filter((f): f is Fact => f !== null)

  return (
    <SiteShell locale={locale} alternates={alternates} currentPath={alternates[locale]}>
      <div className="bg-surface-warm">
        <Breadcrumb
          label={tc('breadcrumb')}
          items={[
            { href: getPathname({ locale, href: '/' }), label: tc('home') },
            { href: getPathname({ locale, href: '/realisations' }), label: t('title') },
            { label: project.title },
          ]}
        />
        <Container className="pt-4 pb-12">
          <div className="max-w-3xl">
            {sector && (
              <p className="eyebrow mb-3 text-[0.8125rem] sm:text-sm">
                <a href={hrefFor(locale, 'sectors', sector.slug)} className="hover:underline">
                  {sector.title}
                </a>
              </p>
            )}
            <h1 className="text-[clamp(1.875rem,6vw,3rem)] tracking-[-0.01em]">{project.title}</h1>
            <p className="mt-5 text-[1.0625rem] text-pretty text-[#333] sm:text-lg">
              {project.summary}
            </p>
          </div>
        </Container>
      </div>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-10">
            {hasCover && (
              <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] bg-surface-warm">
                <MediaImage
                  media={project.coverImage}
                  size="hero"
                  fill
                  priority
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
              </div>
            )}
            <RichText data={project.description} />
          </div>
          <aside className="self-start rounded-[var(--radius-card)] border border-line p-6">
            <dl className="space-y-4">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-sm font-semibold text-text-muted">{f.label}</dt>
                  <dd className="mt-0.5">{f.value}</dd>
                </div>
              ))}
            </dl>
            <ButtonLinks className="mt-8" links={[contact]} />
          </aside>
        </div>
      </Section>

      {team.length > 0 && (
        <Section tone="warm">
          <SectionHeading title={t('team')} />
          <TeamGrid members={team} locale={locale} />
        </Section>
      )}

      {project.gallery?.length ? (
        <Section>
          <SectionHeading title={t('gallery')} />
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {project.gallery.map((g, i) => (
              <li key={g.id ?? i}>
                <figure>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-surface-warm">
                    <MediaImage
                      media={g.image}
                      size="card"
                      fill
                      sizes="(min-width: 768px) 33vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  {g.caption && (
                    <figcaption className="mt-2 text-sm text-text-muted">{g.caption}</figcaption>
                  )}
                </figure>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </SiteShell>
  )
}
