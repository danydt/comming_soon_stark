import {
  Beef,
  Fish,
  GraduationCap,
  HandHeart,
  HardHat,
  HeartPulse,
  Landmark,
  Leaf,
  type LucideIcon,
  Package,
  Sprout,
} from 'lucide-react'
import Image from 'next/image'
import NextLink from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

import { buttonVariants } from '@/components/ui/button'
import type { ResolvedLink } from '@/lib/links'
import { cn } from '@/lib/utils'
import type { Media } from '@/payload-types'

/* ---------------------------------------------------------------- Mise en page */

export function Container({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8', className)} {...props} />
  )
}

type Tone = 'white' | 'warm' | 'dark'

export function Section({
  tone = 'white',
  className,
  children,
  ...props
}: ComponentProps<'section'> & { tone?: Tone }) {
  return (
    <section
      className={cn(
        'py-14 sm:py-20',
        tone === 'warm' && 'bg-surface-warm',
        tone === 'dark' && 'bg-brand-black text-white',
        className,
      )}
      {...props}
    >
      <Container>{children}</Container>
    </section>
  )
}

/** En-tête de section : sur-titre (Josefin, capitales), titre, introduction. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  as: Tag = 'h2',
  dark = false,
  className,
  id,
}: {
  eyebrow?: string | null
  title?: string | null
  intro?: string | null
  as?: 'h1' | 'h2'
  dark?: boolean
  className?: string
  id?: string
}) {
  if (!eyebrow && !title && !intro) return null
  return (
    <div className={cn('mb-8 max-w-3xl sm:mb-10', className)}>
      {eyebrow && (
        <p className={cn('eyebrow mb-3 text-[0.8125rem] sm:text-sm', dark && 'text-[#c4c4c4]')}>
          {eyebrow}
        </p>
      )}
      {title && (
        <Tag
          id={id}
          className={cn(
            Tag === 'h1' ? 'text-[clamp(1.875rem,6vw,3rem)]' : 'text-[clamp(1.5rem,4.4vw,2.25rem)]',
            'tracking-[-0.01em]',
          )}
        >
          {title}
        </Tag>
      )}
      {intro && (
        <p
          className={cn(
            'mt-4 text-[1.0625rem] text-pretty',
            dark ? 'text-[#e6e6e6]' : 'text-[#333]',
          )}
        >
          {intro}
        </p>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- Liens */

export function SmartLink({
  link,
  className,
  children,
  newTabLabel,
}: {
  link: Pick<ResolvedLink, 'href' | 'external' | 'newTab'>
  className?: string
  children: ReactNode
  newTabLabel?: string
}) {
  if (link.external || link.newTab || /^(mailto:|tel:)/.test(link.href)) {
    return (
      <a
        href={link.href}
        className={className}
        {...(link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...(link.external && !link.newTab ? { rel: 'noopener' } : {})}
      >
        {children}
        {link.newTab && newTabLabel && <span className="sr-only"> {newTabLabel}</span>}
      </a>
    )
  }
  return (
    <NextLink href={link.href} className={className}>
      {children}
    </NextLink>
  )
}

export function ButtonLinks({
  links,
  dark = false,
  className,
}: {
  links: ResolvedLink[]
  dark?: boolean
  className?: string
}) {
  if (!links.length) return null
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {links.map((l) => (
        <SmartLink
          key={l.href + l.label}
          link={l}
          className={cn(
            buttonVariants({ variant: l.style ?? 'primary' }),
            dark &&
              l.style === 'outline' &&
              'border-white/70 bg-transparent text-white hover:border-white',
            dark && l.style === 'ghost' && 'text-white hover:bg-white/10',
          )}
        >
          {l.label}
        </SmartLink>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------- Médias */

type SizeName = 'thumbnail' | 'card' | 'hero'

/** Image de la médiathèque. Utilise la taille générée la plus adaptée ; next/image produit AVIF/WebP. */
export function MediaImage({
  media,
  size = 'card',
  sizes,
  priority = false,
  className,
  fill = false,
}: {
  media: number | Media | null | undefined
  size?: SizeName
  sizes: string
  priority?: boolean
  className?: string
  fill?: boolean
}) {
  if (!media || typeof media !== 'object' || !media.url) return null
  const variant = media.sizes?.[size]
  const src = variant?.url ?? media.url
  const width = variant?.width ?? media.width ?? 1200
  const height = variant?.height ?? media.height ?? 900
  const focal =
    media.focalX != null && media.focalY != null ? `${media.focalX}% ${media.focalY}%` : undefined
  const common = {
    src,
    alt: media.alt ?? '',
    sizes,
    // Next 16 : `priority` est obsolète ; image principale chargée tout de suite, en priorité.
    ...(priority ? { loading: 'eager' as const, fetchPriority: 'high' as const } : {}),
    className,
    style: focal ? { objectPosition: focal } : undefined,
  }
  return fill ? (
    <Image {...common} alt={common.alt} fill />
  ) : (
    <Image {...common} alt={common.alt} width={width} height={height} />
  )
}

/* ---------------------------------------------------------------- Icônes des secteurs */

const ICONS: Record<string, LucideIcon> = {
  'heart-pulse': HeartPulse,
  sprout: Sprout,
  beef: Beef,
  fish: Fish,
  package: Package,
  'hard-hat': HardHat,
  'hand-heart': HandHeart,
  leaf: Leaf,
  landmark: Landmark,
  'graduation-cap': GraduationCap,
}

export function SectorIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && ICONS[name]) || Sprout
  return <Icon aria-hidden="true" className={className} strokeWidth={1.75} />
}

/** Initiales (membre de l'équipe sans photo). */
export function initials(name: string): string {
  const words = name
    .replace(/^(Dr|M\.|Mme|Mr|Mrs|Ms)\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase()
}
