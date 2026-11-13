import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { ProjectCard, provinceName } from '@/components/site/cards'
import { EmptyState, FilterGroup } from '@/components/site/nav'
import { PageHeader } from '@/components/site/PageHeader'
import { Container } from '@/components/site/primitives'
import { SiteShell } from '@/components/site/SiteShell'
import { getPathname } from '@/i18n/navigation'
import { listProjects, listSectors } from '@/lib/content'
import { initLocale, pageMetadata, staticAlternates } from '@/lib/page'
import { PROVINCES } from '@/lib/provinces'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ sector?: string; province?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await initLocale(params)
  const t = await getTranslations({ locale, namespace: 'projects' })
  return pageMetadata({
    locale,
    alternates: staticAlternates('/realisations'),
    title: t('title'),
    description: t('intro'),
  })
}

export default async function ProjectsPage({ params, searchParams }: Props) {
  const locale = await initLocale(params)
  const sp = await searchParams
  const [t, tc, sectors, all] = await Promise.all([
    getTranslations({ locale, namespace: 'projects' }),
    getTranslations({ locale, namespace: 'common' }),
    listSectors(locale),
    listProjects(locale, {}),
  ])

  // Filtres : seules les valeurs connues sont prises en compte.
  const sector = sectors.find((s) => s.slug === sp.sector)
  const usedProvinces = PROVINCES.filter((p) =>
    all.some((proj) => proj.provinces?.includes(p.value)),
  )
  const province = usedProvinces.find((p) => p.value === sp.province)?.value
  const projects = all.filter(
    (p) =>
      (!sector || (typeof p.sector === 'object' ? p.sector?.id : p.sector) === sector.id) &&
      (!province || p.provinces?.includes(province)),
  )

  const href = (q: { sector?: string; province?: string }) => {
    const query = Object.fromEntries(Object.entries(q).filter(([, v]) => v)) as Record<
      string,
      string
    >
    return getPathname({ locale, href: { pathname: '/realisations', query } })
  }
  const usedSectors = sectors.filter((s) =>
    all.some((p) => (typeof p.sector === 'object' ? p.sector?.id : p.sector) === s.id),
  )

  const alternates = staticAlternates('/realisations')
  return (
    <SiteShell locale={locale} alternates={alternates} currentPath={alternates[locale]}>
      <PageHeader title={t('title')} intro={t('intro')} />
      <Container className="py-12 sm:py-16">
        {all.length > 0 && (
          <div role="group" aria-label={tc('filters')} className="mb-10 space-y-6">
            {usedSectors.length > 1 && (
              <FilterGroup
                legend={t('sector')}
                options={[
                  { href: href({ province }), label: tc('all'), active: !sector },
                  ...usedSectors.map((s) => ({
                    href: href({ sector: s.slug, province }),
                    label: s.title,
                    active: s.id === sector?.id,
                  })),
                ]}
              />
            )}
            {usedProvinces.length > 1 && (
              <FilterGroup
                legend={t('province')}
                options={[
                  { href: href({ sector: sector?.slug }), label: tc('all'), active: !province },
                  ...usedProvinces.map((p) => ({
                    href: href({ sector: sector?.slug, province: p.value }),
                    label: provinceName(p.value, locale),
                    active: p.value === province,
                  })),
                ]}
              />
            )}
          </div>
        )}

        <p className="sr-only" aria-live="polite">
          {t('count', { count: projects.length })}
        </p>
        {projects.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <li key={p.id}>
                <ProjectCard project={p} locale={locale} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>{all.length ? tc('noResults') : t('empty')}</EmptyState>
        )}
      </Container>
    </SiteShell>
  )
}
