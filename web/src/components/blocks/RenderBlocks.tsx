import { getTranslations } from 'next-intl/server'

import {
  FeaturedProject,
  FiguresGrid,
  PartnerList,
  PostCard,
  ProjectCard,
  SectorCard,
  TeamGrid,
} from '@/components/site/cards'
import {
  ButtonLinks,
  Container,
  MediaImage,
  Section,
  SectionHeading,
} from '@/components/site/primitives'
import { ContactForm } from '@/components/forms/ContactForm'
import { formContext } from '@/components/forms/context'
import { DonationForm } from '@/components/forms/DonationForm'
import { ContactDetails } from '@/components/site/ContactDetails'
import { DrcMap } from '@/components/site/DrcMap'
import { RichText } from '@/components/site/RichText'
import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import {
  getSettings,
  listPartners,
  listPosts,
  listProducts,
  listProjects,
  listSectors,
  listTeam,
} from '@/lib/content'
import { resolveLink, type ResolvedLink } from '@/lib/links'
import { cn } from '@/lib/utils'
import type { Page, Project, Sector } from '@/payload-types'

type Block = NonNullable<Page['layout']>[number]
type Ctx = { locale: Locale; home?: string; first: boolean }

const links = (ctx: Ctx, items: { link: Parameters<typeof resolveLink>[1] }[] | null | undefined) =>
  (items ?? [])
    .map((i) => resolveLink(ctx.locale, i.link, ctx.home))
    .filter((l): l is ResolvedLink => l !== null)

const idOf = (v: number | { id: number } | null | undefined) =>
  v == null ? undefined : typeof v === 'object' ? v.id : v

/** Affiche les blocs d'une page dans l'ordre choisi dans l'admin. */
export async function RenderBlocks({
  blocks,
  locale,
  home,
}: {
  blocks: Page['layout']
  locale: Locale
  home?: string
}) {
  if (!blocks?.length) return null
  return (
    <>
      {blocks.map((block, i) => (
        <BlockSwitch key={block.id ?? i} block={block} ctx={{ locale, home, first: i === 0 }} />
      ))}
    </>
  )
}

async function BlockSwitch({ block, ctx }: { block: Block; ctx: Ctx }) {
  switch (block.blockType) {
    case 'hero':
      return <Hero block={block} ctx={ctx} />
    case 'content':
      return (
        <Section>
          <div className="max-w-3xl">
            <SectionHeading eyebrow={block.eyebrow} title={block.heading} />
            <RichText data={block.content} />
          </div>
        </Section>
      )
    case 'keyFigures':
      return (
        <Section tone="warm">
          <SectionHeading eyebrow={block.eyebrow} title={block.heading} intro={block.intro} />
          <FiguresGrid items={block.items ?? []} />
          {block.source && <p className="mt-8 text-sm text-text-muted">{block.source}</p>}
        </Section>
      )
    case 'sectorsGrid':
      return <SectorsGrid block={block} ctx={ctx} />
    case 'projectsGrid':
      return <ProjectsGrid block={block} ctx={ctx} />
    case 'featuredProject':
      return <Featured block={block} ctx={ctx} />
    case 'team': {
      const members = await listTeam(ctx.locale, block.groups ?? [])
      if (!members.length) return null
      return (
        <Section>
          <SectionHeading eyebrow={block.eyebrow} title={block.heading} intro={block.intro} />
          <TeamGrid members={members} locale={ctx.locale} />
        </Section>
      )
    }
    case 'partners': {
      const partners = await listPartners(ctx.locale, block.types ?? [])
      if (!partners.length) return null
      return (
        <Section tone="warm">
          <SectionHeading eyebrow={block.eyebrow} title={block.heading} intro={block.intro} />
          <PartnerList partners={partners} locale={ctx.locale} />
        </Section>
      )
    }
    case 'gallery':
      return (
        <Section>
          <SectionHeading eyebrow={block.eyebrow} title={block.heading} />
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {(block.images ?? []).map((img, i) => (
              <li key={img.id ?? i}>
                <figure>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-surface-warm">
                    <MediaImage
                      media={img.image}
                      size="card"
                      fill
                      sizes="(min-width: 768px) 33vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  {img.caption && (
                    <figcaption className="mt-2 text-sm text-text-muted">{img.caption}</figcaption>
                  )}
                </figure>
              </li>
            ))}
          </ul>
        </Section>
      )
    case 'cta': {
      const dark = block.tone === 'dark'
      return (
        <Section tone={dark ? 'dark' : 'warm'}>
          <div className="max-w-3xl">
            {block.heading && (
              <h2 className="text-[clamp(1.5rem,4.4vw,2.25rem)]">{block.heading}</h2>
            )}
            {block.text && (
              <p className={cn('mt-4 text-[1.0625rem]', dark ? 'text-[#e6e6e6]' : 'text-[#333]')}>
                {block.text}
              </p>
            )}
            <ButtonLinks links={links(ctx, block.links)} dark={dark} className="mt-8" />
          </div>
        </Section>
      )
    }
    case 'faq':
      return (
        <Section>
          <SectionHeading eyebrow={block.eyebrow} title={block.heading} />
          <div className="max-w-3xl divide-y divide-line border-y border-line">
            {(block.items ?? []).map((item, i) => (
              <details key={item.id ?? i} className="group py-2">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {item.question}
                  <span
                    aria-hidden="true"
                    className="text-brand-red transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="pb-4">
                  <RichText data={item.answer} />
                </div>
              </details>
            ))}
          </div>
        </Section>
      )
    case 'latestPosts':
      return <LatestPosts block={block} ctx={ctx} />
    case 'contactInfo': {
      const [settings, form, products] = await Promise.all([
        getSettings(ctx.locale),
        formContext(ctx.locale),
        listProducts(ctx.locale),
      ])
      return (
        <Section>
          <SectionHeading eyebrow={block.eyebrow} title={block.heading} intro={block.intro} />
          <ContactDetails
            locale={ctx.locale}
            settings={settings}
            form={
              <ContactForm
                {...form}
                products={products.map((p) => ({ slug: p.slug ?? '', name: p.name }))}
              />
            }
          />
        </Section>
      )
    }
    case 'donationForm': {
      const form = await formContext(ctx.locale)
      return (
        <Section id="formulaire">
          <div className="mx-auto max-w-3xl">
            {(block.heading || block.intro) && (
              <SectionHeading eyebrow={block.eyebrow} title={block.heading} intro={block.intro} />
            )}
            <div className="rounded-[var(--radius-card)] border border-line p-6 sm:p-8">
              <DonationForm {...form} />
            </div>
          </div>
        </Section>
      )
    }
    case 'interventionMap': {
      const settings = await getSettings(ctx.locale)
      const zones = settings.interventionZones ?? []
      if (!zones.length) return null
      const t = await getTranslations({ locale: ctx.locale, namespace: 'about' })
      return (
        <Section tone="warm">
          <SectionHeading
            eyebrow={block.eyebrow}
            title={block.heading ?? t('mapTitle')}
            intro={block.intro ?? t('mapIntro')}
          />
          <DrcMap locale={ctx.locale} active={zones} />
        </Section>
      )
    }
    default:
      return null
  }
}

type BlockOf<T extends Block['blockType']> = Extract<Block, { blockType: T }>

function Hero({ block, ctx }: { block: BlockOf<'hero'>; ctx: Ctx }) {
  const hasImage = block.image && typeof block.image === 'object'
  const Title = ctx.first ? 'h1' : 'h2'
  return (
    <section className="relative overflow-hidden bg-surface-warm">
      <Container
        className={cn(
          'grid items-center gap-10 py-12 sm:py-16',
          hasImage && 'lg:grid-cols-[1.05fr_1fr] lg:py-20',
        )}
      >
        <div className="max-w-2xl">
          {block.eyebrow && (
            <p className="eyebrow mb-4 text-[0.8125rem] sm:text-sm">{block.eyebrow}</p>
          )}
          <Title className="text-[clamp(2rem,7vw,3.5rem)] tracking-[-0.015em]">{block.title}</Title>
          {block.text && (
            <p className="mt-6 text-[1.0625rem] text-pretty text-[#333] sm:text-lg">{block.text}</p>
          )}
          <ButtonLinks links={links(ctx, block.links)} className="mt-8" />
        </div>
        {hasImage && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-line">
            <MediaImage
              media={block.image}
              size="hero"
              fill
              priority={ctx.first}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        )}
      </Container>
    </section>
  )
}

async function SectorsGrid({ block, ctx }: { block: BlockOf<'sectorsGrid'>; ctx: Ctx }) {
  const all = await listSectors(ctx.locale)
  const chosen = (block.sectors ?? []).map(idOf).filter((v): v is number => v !== undefined)
  const sectors: Sector[] = chosen.length
    ? chosen.map((id) => all.find((s) => s.id === id)).filter((s): s is Sector => Boolean(s))
    : all
  if (!sectors.length) return null
  return (
    <Section>
      <SectionHeading eyebrow={block.eyebrow} title={block.heading} intro={block.intro} />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sectors.map((s) => (
          <li key={s.id}>
            <SectorCard sector={s} locale={ctx.locale} />
          </li>
        ))}
      </ul>
    </Section>
  )
}

async function ProjectsGrid({ block, ctx }: { block: BlockOf<'projectsGrid'>; ctx: Ctx }) {
  const ids = (block.projects ?? []).map(idOf).filter((v): v is number => v !== undefined)
  const projects: Project[] = await listProjects(ctx.locale, {
    ids: ids.length ? ids : undefined,
    sector: ids.length ? undefined : idOf(block.sector),
    limit: block.limit ?? 6,
  })
  if (!projects.length) return null
  return (
    <Section>
      <SectionHeading eyebrow={block.eyebrow} title={block.heading} intro={block.intro} />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <li key={p.id}>
            <ProjectCard project={p} locale={ctx.locale} />
          </li>
        ))}
      </ul>
      <ButtonLinks links={links(ctx, block.links)} className="mt-10" />
    </Section>
  )
}

async function Featured({ block, ctx }: { block: BlockOf<'featuredProject'>; ctx: Ctx }) {
  const id = idOf(block.project)
  const [project] = await listProjects(
    ctx.locale,
    id ? { ids: [id], limit: 1 } : { featured: true, limit: 1 },
  )
  if (!project) return null
  return <FeaturedProject project={project} locale={ctx.locale} eyebrow={block.eyebrow} />
}

async function LatestPosts({ block, ctx }: { block: BlockOf<'latestPosts'>; ctx: Ctx }) {
  const { docs } = await listPosts(ctx.locale, 1, block.limit ?? 3)
  if (!docs.length) return null
  const t = await getTranslations({ locale: ctx.locale, namespace: 'posts' })
  const tc = await getTranslations({ locale: ctx.locale, namespace: 'common' })
  return (
    <Section>
      <SectionHeading eyebrow={block.eyebrow} title={block.heading ?? t('latest')} />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((p) => (
          <li key={p.id}>
            <PostCard post={p} locale={ctx.locale} />
          </li>
        ))}
      </ul>
      <ButtonLinks
        className="mt-10"
        links={[
          {
            href: getPathname({ locale: ctx.locale, href: '/actualites' }),
            label: tc('seeAll'),
            external: false,
            newTab: false,
            style: 'outline',
          },
        ]}
      />
    </Section>
  )
}
