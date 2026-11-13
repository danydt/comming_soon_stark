import { Mail, MapPin, Phone } from 'lucide-react'
import Image from 'next/image'
import NextLink from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

import { getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getFooter, getHeader, getSettings } from '@/lib/content'
import { resolveLink, type ResolvedLink } from '@/lib/links'
import { cn } from '@/lib/utils'

import { LocaleSwitcher, type Alternates } from './LocaleSwitcher'
import { MobileMenu, type NavItem } from './MobileMenu'
import { Container, SmartLink } from './primitives'

/** Slug de la page d'accueil (pour que ses liens pointent vers /fr et non /fr/accueil). */
export async function homeSlug(locale: Locale): Promise<string | undefined> {
  const settings = await getSettings(locale)
  const home = settings.homePage
  return typeof home === 'object' && home ? home.slug : undefined
}

const isCurrent = (href: string, current: string) =>
  current === href || (href.split('/').length > 2 && current.startsWith(`${href}/`))

/**
 * Coquille commune à toutes les pages : lien d'évitement, en-tête, contenu, pied de page.
 * Chaque page fournit ses `alternates` (adresse équivalente dans chaque langue) et son adresse
 * courante, pour le sélecteur de langue et la mise en évidence du menu.
 */
export async function SiteShell({
  locale,
  alternates,
  currentPath,
  children,
}: {
  locale: Locale
  alternates: Alternates
  currentPath: string
  children: ReactNode
}) {
  const [t, header, footer, settings, home] = await Promise.all([
    getTranslations({ locale, namespace: 'common' }),
    getHeader(locale),
    getFooter(locale),
    getSettings(locale),
    homeSlug(locale),
  ])
  const tf = await getTranslations({ locale, namespace: 'footer' })

  const nav: NavItem[] = (header.items ?? [])
    .map((i) => resolveLink(locale, i.link, home))
    .filter((l): l is ResolvedLink => l !== null)
    .map((l) => ({ href: l.href, label: l.label, current: isCurrent(l.href, currentPath) }))

  const homeHref = getPathname({ locale, href: '/' })
  const switcher = (
    <LocaleSwitcher locale={locale} alternates={alternates} label={t('languageLabel')} />
  )

  const social = [
    // lucide 1.x ne fournit plus les logos de marques : monogrammes texte, sans dépendance.
    { url: settings.facebookUrl, label: 'Facebook', mark: 'f' },
    { url: settings.linkedinUrl, label: 'LinkedIn', mark: 'in' },
    { url: settings.xUrl, label: 'X', mark: 'X' },
  ].filter((s): s is typeof s & { url: string } => Boolean(s.url))

  const year = new Date().getFullYear()

  return (
    <>
      <a
        href="#contenu"
        className="absolute -top-24 left-4 z-[60] rounded-[10px] bg-brand-black px-4 py-2.5 text-white focus:top-2"
      >
        {t('skipToContent')}
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
        <Container className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <NextLink href={homeHref} aria-label={t('homeLink')} className="shrink-0 rounded-md">
            <Image
              src="/brand/logo-mark.svg"
              alt=""
              width={36}
              height={44}
              priority
              className="h-10 w-auto lg:hidden"
            />
            <Image
              src="/brand/logo-full.svg"
              alt=""
              width={120}
              height={113}
              priority
              className="hidden h-14 w-auto lg:block"
            />
          </NextLink>

          <nav aria-label={t('mainNav')} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <NextLink
                    href={item.href}
                    aria-current={item.current ? 'page' : undefined}
                    className={cn(
                      'inline-flex min-h-11 items-center rounded-md px-3 text-[0.9375rem] font-semibold',
                      item.current
                        ? 'text-brand-red underline decoration-2 underline-offset-[6px]'
                        : 'text-brand-black hover:text-brand-red',
                    )}
                  >
                    {item.label}
                  </NextLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <div className="hidden lg:block">{switcher}</div>
            <MobileMenu
              items={nav}
              switcher={switcher}
              labels={{
                open: t('openMenu'),
                close: t('closeMenu'),
                nav: t('mainNav'),
                menu: t('menu'),
              }}
            />
          </div>
        </Container>
      </header>

      <main id="contenu" tabIndex={-1} className="outline-none">
        {children}
      </main>

      <footer className="bg-brand-black pt-14 pb-10 text-sm text-[#e6e6e6]">
        <Container>
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <Image
                src="/brand/logo-full-white.svg"
                alt={settings.name}
                width={140}
                height={132}
                className="h-auto w-[120px]"
              />
              {footer.about && <p className="mt-5 max-w-sm text-[#c4c4c4]">{footer.about}</p>}
              <ul className="mt-6 space-y-3">
                <li className="flex gap-3">
                  <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-grey" />
                  <span>
                    <span className="font-semibold text-white">{tf('headOffice')} : </span>
                    {settings.headOffice}
                  </span>
                </li>
                {settings.branchOffice && (
                  <li className="flex gap-3">
                    <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-grey" />
                    <span>
                      <span className="font-semibold text-white">{tf('branchOffice')} : </span>
                      {settings.branchOffice}
                    </span>
                  </li>
                )}
                <li className="flex items-center gap-3">
                  <Phone aria-hidden="true" className="size-5 shrink-0 text-brand-grey" />
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, '')}`}
                    className="inline-flex min-h-11 items-center hover:text-white hover:underline"
                  >
                    <span className="sr-only">{tf('phone')} : </span>
                    {settings.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail aria-hidden="true" className="size-5 shrink-0 text-brand-grey" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="inline-flex min-h-11 items-center break-all hover:text-white hover:underline"
                  >
                    <span className="sr-only">{tf('email')} : </span>
                    {settings.email}
                  </a>
                </li>
              </ul>
            </div>

            {(footer.columns ?? []).map((col) => (
              <div key={col.id ?? col.title}>
                <h2 className="eyebrow mb-4 text-xs text-[#c4c4c4]">{col.title}</h2>
                <ul className="space-y-1">
                  {(col.items ?? [])
                    .map((i) => resolveLink(locale, i.link, home))
                    .filter((l): l is ResolvedLink => l !== null)
                    .map((l) => (
                      <li key={l.href}>
                        <SmartLink
                          link={l}
                          newTabLabel={t('newTab')}
                          className="inline-flex min-h-11 items-center hover:text-white hover:underline"
                        >
                          {l.label}
                        </SmartLink>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-6 border-t border-white/15 pt-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1 text-[#c4c4c4]">
              {settings.legalStatus && <p>{settings.legalStatus}</p>}
              <p>{tf('copyright', { year })}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {(footer.legalLinks ?? [])
                .map((i) => resolveLink(locale, i.link, home))
                .filter((l): l is ResolvedLink => l !== null)
                .map((l) => (
                  <SmartLink
                    key={l.href}
                    link={l}
                    className="inline-flex min-h-11 items-center px-1 text-[#c4c4c4] hover:text-white hover:underline"
                  >
                    {l.label}
                  </SmartLink>
                ))}
              {social.length > 0 && (
                <ul aria-label={tf('follow')} className="ml-2 flex gap-1">
                  {social.map(({ url, label, mark }) => (
                    <li key={label}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${label} ${t('newTab')}`}
                        className="inline-flex size-11 items-center justify-center rounded-md hover:bg-white/10"
                      >
                        <span
                          aria-hidden="true"
                          className="inline-flex size-8 items-center justify-center rounded-full border border-white/40 font-semibold"
                        >
                          {mark}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Container>
      </footer>
    </>
  )
}
