import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { LocaleSwitcher } from '@/components/site/LocaleSwitcher'

type Props = { params: Promise<{ locale: string }> }

/** Accueil provisoire (phase 1) : vérifie la charte, les polices, le logo et le switch FR | EN. */
export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('home')
  const tc = await getTranslations('common')
  const tf = await getTranslations('footer')

  return (
    <>
      <a
        href="#contenu"
        className="absolute -top-24 left-4 z-10 rounded-[10px] bg-brand-black px-4 py-2.5 text-white focus:top-2"
      >
        {tc('skipToContent')}
      </a>
      <header className="flex justify-end px-4 pt-2 sm:px-8">
        <LocaleSwitcher />
      </header>

      <main id="contenu" className="mx-auto max-w-3xl px-4 pt-2 pb-16 text-center sm:px-8">
        <Image
          src="/brand/logo-full.svg"
          alt="StarkHold — Go further together"
          width={200}
          height={200}
          priority
          className="mx-auto mb-7 h-auto w-[min(168px,46vw)] sm:w-[200px]"
        />
        <p className="eyebrow mb-3 text-[0.8125rem] tracking-[0.18em] sm:text-sm sm:tracking-[0.3em]">
          {t('eyebrow')}
        </p>
        <h1 className="text-[clamp(1.875rem,7.4vw,3.25rem)] tracking-[-0.01em]">{t('title')}</h1>
        <p className="mx-auto mt-8 max-w-[600px] text-[1.0625rem] text-pretty text-[#333]">
          {t('intro')}
        </p>
        <p className="mt-6 font-semibold text-text-muted">{t('wip')}</p>
      </main>

      <footer className="bg-brand-black px-4 pt-9 pb-10 text-center text-sm text-[#e6e6e6]">
        <p className="font-heading text-[1.0625rem] font-extrabold text-white">{tf('legalName')}</p>
        <p className="eyebrow mt-1.5 mb-4 text-xs text-[#c4c4c4]">{tc('tagline')}</p>
        <address className="mx-auto max-w-[640px] not-italic">{tf('address')}</address>
        <p className="mt-3 text-[#c4c4c4]">
          {tf('legalForm')} · {tf('copyright', { year: 2026 })}
        </p>
      </footer>
    </>
  )
}
