import { getTranslations } from 'next-intl/server'

import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

import { ButtonLinks, Section } from './primitives'

export async function NotFoundContent({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'notFound' })
  return (
    <Section>
      <div className="max-w-2xl py-8">
        <p className="eyebrow mb-3">404</p>
        <h1 className="text-[clamp(1.875rem,6vw,3rem)]">{t('title')}</h1>
        <p className="mt-4 text-[1.0625rem] text-[#333]">{t('text')}</p>
        <ButtonLinks
          className="mt-8"
          links={[
            {
              href: getPathname({ locale, href: '/' }),
              label: t('back'),
              external: false,
              newTab: false,
              style: 'primary',
            },
          ]}
        />
      </div>
    </Section>
  )
}
