import { ChevronLeft, ChevronRight } from 'lucide-react'
import NextLink from 'next/link'

import { cn } from '@/lib/utils'

import { Container } from './primitives'

/** Fil d'Ariane (le dernier élément est la page courante). */
export function Breadcrumb({
  items,
  label,
}: {
  items: { href?: string; label: string }[]
  label: string
}) {
  return (
    <Container className="pt-6">
      <nav aria-label={label}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-muted">
          {items.map((item, i) => {
            const last = i === items.length - 1
            return (
              <li key={i} className="flex items-center gap-2">
                {item.href && !last ? (
                  <NextLink
                    href={item.href}
                    className="inline-flex min-h-11 items-center hover:text-brand-black hover:underline"
                  >
                    {item.label}
                  </NextLink>
                ) : (
                  <span
                    aria-current={last ? 'page' : undefined}
                    className={cn(last && 'font-semibold text-brand-black')}
                  >
                    {item.label}
                  </span>
                )}
                {!last && <ChevronRight aria-hidden="true" className="size-4" />}
              </li>
            )
          })}
        </ol>
      </nav>
    </Container>
  )
}

/** Filtres en simples liens (aucun JavaScript) : chaque option est une URL. */
export function FilterGroup({
  legend,
  options,
}: {
  legend: string
  options: { href: string; label: string; active: boolean }[]
}) {
  return (
    <div>
      <p className="eyebrow mb-2 text-xs">{legend}</p>
      <ul className="flex flex-wrap gap-2">
        {options.map((o) => (
          <li key={o.href}>
            <NextLink
              href={o.href}
              scroll={false}
              aria-current={o.active ? 'true' : undefined}
              className={cn(
                'inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition-colors',
                o.active
                  ? 'border-brand-black bg-brand-black text-white'
                  : 'border-line bg-surface text-brand-black hover:border-brand-black',
              )}
            >
              {o.label}
            </NextLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Pagination({
  page,
  totalPages,
  hrefFor,
  labels,
}: {
  page: number
  totalPages: number
  hrefFor: (page: number) => string
  labels: { nav: string; previous: string; next: string; pageOf: string }
}) {
  if (totalPages <= 1) return null
  const linkClass =
    'inline-flex min-h-11 items-center gap-1 rounded-full border border-line px-4 text-sm font-semibold hover:border-brand-black'
  return (
    <nav aria-label={labels.nav} className="mt-12 flex items-center justify-between gap-4">
      {page > 1 ? (
        <NextLink href={hrefFor(page - 1)} rel="prev" className={linkClass}>
          <ChevronLeft aria-hidden="true" className="size-4" />
          {labels.previous}
        </NextLink>
      ) : (
        <span />
      )}
      <p className="text-sm text-text-muted">{labels.pageOf}</p>
      {page < totalPages ? (
        <NextLink href={hrefFor(page + 1)} rel="next" className={linkClass}>
          {labels.next}
          <ChevronRight aria-hidden="true" className="size-4" />
        </NextLink>
      ) : (
        <span />
      )}
    </nav>
  )
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-surface-warm px-6 py-10 text-center text-text-muted">
      {children}
    </p>
  )
}
