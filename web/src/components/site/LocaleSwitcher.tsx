import { Fragment } from 'react'

import { routing, type Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

export type Alternates = Record<Locale, string>

/**
 * Sélecteur FR | EN — même rendu que la page de lancement validée (D10, D17) :
 * langue active en rouge et soulignée, cibles de 44 px, liens vers la page équivalente
 * (avec son slug dans l'autre langue, D24). Lien classique : la requête passe par le proxy
 * next-intl, qui mémorise le choix dans le cookie NEXT_LOCALE.
 */
export function LocaleSwitcher({
  locale,
  alternates,
  label,
  className,
  invert = false,
}: {
  locale: Locale
  alternates: Alternates
  label: string
  className?: string
  invert?: boolean
}) {
  return (
    <nav aria-label={label} className={cn('flex items-center gap-0.5 text-text-muted', className)}>
      {routing.locales.map((code, i) => {
        const active = code === locale
        return (
          <Fragment key={code}>
            {i > 0 && (
              <span aria-hidden="true" className={invert ? 'text-[#8a8a8a]' : undefined}>
                |
              </span>
            )}
            <a
              href={alternates[code]}
              lang={code}
              hrefLang={code}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-sm font-semibold tracking-[0.08em] uppercase',
                active
                  ? 'text-brand-red underline decoration-2 underline-offset-[6px]'
                  : invert
                    ? 'text-[#e6e6e6] hover:text-white'
                    : 'text-text-muted hover:text-brand-black',
              )}
            >
              {code.toUpperCase()}
            </a>
          </Fragment>
        )
      })}
    </nav>
  )
}
