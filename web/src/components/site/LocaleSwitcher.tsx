'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Fragment } from 'react'

import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'

/**
 * Sélecteur FR | EN — même rendu que la page de lancement validée (D10) :
 * langue active en rouge, soulignée ; cibles de 44 px. Renvoie vers la page équivalente.
 * (Les slugs localisés des contenus Payload seront branchés en phase 3.)
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale()
  const pathname = usePathname()
  const t = useTranslations('common')

  return (
    <nav
      aria-label={t('languageLabel')}
      className={cn('flex items-center gap-0.5 text-text-muted', className)}
    >
      {routing.locales.map((code, i) => {
        const active = code === locale
        return (
          <Fragment key={code}>
            {i > 0 && <span aria-hidden="true">|</span>}
            <Link
              href={pathname}
              locale={code}
              lang={code}
              hrefLang={code}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-sm font-semibold tracking-[0.08em] uppercase',
                active
                  ? 'text-brand-red underline decoration-2 underline-offset-[6px]'
                  : 'text-text-muted hover:text-brand-black',
              )}
            >
              {code.toUpperCase()}
            </Link>
          </Fragment>
        )
      })}
    </nav>
  )
}
