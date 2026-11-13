import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { buttonVariants } from '@/components/ui/button'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import type { SiteSetting } from '@/payload-types'

export const whatsappHref = (number: string, message?: string | null) =>
  `https://wa.me/${number.replace(/\D/g, '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

/** Lien carte : point exact si les coordonnées sont saisies, sinon recherche de l'adresse. */
function mapHref(s: SiteSetting) {
  if (s.mapLatitude != null && s.mapLongitude != null)
    return `https://www.openstreetmap.org/?mlat=${s.mapLatitude}&mlon=${s.mapLongitude}#map=17/${s.mapLatitude}/${s.mapLongitude}`
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(s.headOffice)}`
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Phone
  label: string
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-4">
      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-warm text-brand-red">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-text-muted">{label}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </li>
  )
}

/** Coordonnées de la fondation (bloc « Coordonnées et contact »). */
export async function ContactDetails({
  locale,
  settings,
}: {
  locale: Locale
  settings: SiteSetting
}) {
  const [t, tf, tc] = await Promise.all([
    getTranslations({ locale, namespace: 'contact' }),
    getTranslations({ locale, namespace: 'footer' }),
    getTranslations({ locale, namespace: 'common' }),
  ])
  const linkClass =
    'inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline'
  const hasPoint = settings.mapLatitude != null && settings.mapLongitude != null

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h2 className="text-xl">{t('details')}</h2>
        <ul className="mt-6 space-y-6">
          <Row icon={Phone} label={tf('phone')}>
            <a href={telHref(settings.phone)} className={linkClass}>
              {settings.phone}
            </a>
          </Row>
          <Row icon={Mail} label={tf('email')}>
            <a href={`mailto:${settings.email}`} className={cn(linkClass, 'break-all')}>
              {settings.email}
            </a>
          </Row>
          <Row icon={MapPin} label={tf('headOffice')}>
            <p className="whitespace-pre-line">{settings.headOffice}</p>
            <a
              href={mapHref(settings)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(linkClass, 'text-sm')}
            >
              {t('map')} <span className="sr-only">{tc('newTab')}</span>
            </a>
          </Row>
          {settings.branchOffice && (
            <Row icon={MapPin} label={tf('branchOffice')}>
              <p className="whitespace-pre-line">{settings.branchOffice}</p>
            </Row>
          )}
        </ul>
        <a
          href={whatsappHref(settings.whatsappNumber, settings.whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants(), 'mt-8')}
        >
          <MessageCircle aria-hidden="true" className="size-5" />
          {t('whatsapp')}
          <span className="sr-only">{tc('newTab')}</span>
        </a>
      </div>

      <div className="space-y-6">
        {hasPoint && (
          <iframe
            title={t('map')}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-[var(--radius-card)] border border-line"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${settings.mapLongitude! - 0.01}%2C${settings.mapLatitude! - 0.006}%2C${settings.mapLongitude! + 0.01}%2C${settings.mapLatitude! + 0.006}&layer=mapnik&marker=${settings.mapLatitude}%2C${settings.mapLongitude}`}
          />
        )}
        <div
          id="rappel"
          className="rounded-[var(--radius-card)] border border-dashed border-line bg-surface-warm p-6"
        >
          <h2 className="text-xl">{t('formTitle')}</h2>
          <p className="mt-3 text-text-muted">{t('formSoon')}</p>
        </div>
      </div>
    </div>
  )
}
