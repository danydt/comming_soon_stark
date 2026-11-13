import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import type { Province } from '@/lib/provinces'
import { cn } from '@/lib/utils'

import { provinceName } from './cards'
import { DRC_PROVINCES, DRC_VIEWBOX } from './drc-map-data'

/**
 * Carte des 26 provinces de la RDC (SVG statique, aucun JavaScript).
 * Les provinces d'intervention sont en rouge ; leur liste est aussi donnée en texte.
 */
export async function DrcMap({ locale, active }: { locale: Locale; active: readonly Province[] }) {
  const t = await getTranslations({ locale, namespace: 'about' })
  const on = new Set(active)
  const names = active.map((p) => provinceName(p, locale))
  const titleId = 'carte-rdc-titre'

  return (
    <figure className="grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]">
      <svg
        viewBox={DRC_VIEWBOX}
        role="img"
        aria-labelledby={titleId}
        className="h-auto w-full max-w-[640px]"
      >
        <title id={titleId}>{`${t('mapTitle')} : ${names.join(', ')}`}</title>
        {DRC_PROVINCES.map((p) => (
          <path
            key={p.id}
            d={p.d}
            data-province={p.id}
            data-active={on.has(p.id) || undefined}
            className={cn(
              'stroke-white [stroke-width:1.5] [stroke-linejoin:round]',
              on.has(p.id) ? 'fill-brand-red' : 'fill-[#D9D5CF]',
            )}
          >
            <title>{provinceName(p.id, locale)}</title>
          </path>
        ))}
      </svg>
      <figcaption className="space-y-5">
        <ul className="flex flex-wrap gap-2" aria-label={t('mapLegendActive')}>
          {names.map((n) => (
            <li
              key={n}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold"
            >
              <span aria-hidden="true" className="size-2.5 rounded-full bg-brand-red" />
              {n}
            </li>
          ))}
        </ul>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-muted">
          <li className="flex items-center gap-2">
            <span className="size-3.5 rounded-sm bg-brand-red" aria-hidden="true" />
            {t('mapLegendActive')}
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3.5 rounded-sm bg-[#D9D5CF]" aria-hidden="true" />
            {t('mapLegendOther')}
          </li>
        </ul>
        <p className="text-xs text-text-muted">{t('mapSource')}</p>
      </figcaption>
    </figure>
  )
}
