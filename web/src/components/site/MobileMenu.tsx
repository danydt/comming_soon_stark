'use client'

import { Menu, X } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

const noop = () => () => {}

export type NavItem = { href: string; label: string; current: boolean }

/**
 * Menu mobile accessible : bouton aria-expanded, panneau modal (aria-modal),
 * focus piégé dans le panneau, fermeture par Échap ou par le bouton, focus rendu au bouton.
 * Le défilement de la page est bloqué pendant l'ouverture.
 * Le panneau est rendu dans <body> (portail) : l'en-tête a un `backdrop-filter`, qui ferait
 * du header le bloc de référence d'un `position: fixed` et réduirait le panneau à sa hauteur.
 */
export function MobileMenu({
  items,
  labels,
  switcher,
}: {
  items: NavItem[]
  labels: { open: string; close: string; nav: string; menu: string }
  switcher: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  // Vrai côté navigateur, faux au rendu serveur (le portail a besoin de document.body).
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )

  const close = useCallback(() => {
    setOpen(false)
    buttonRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      ).filter((el) => el.offsetParent !== null)
    focusables()[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key !== 'Tab') return
      const list = focusables()
      if (!list.length) return
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [open, close])

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={labels.open}
        onClick={() => setOpen(true)}
        className="inline-flex size-11 items-center justify-center rounded-md text-brand-black hover:bg-surface-warm"
      >
        <Menu aria-hidden="true" className="size-6" />
      </button>

      {mounted &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label={labels.menu}
            hidden={!open}
            // Classes écrites sans `cn` : tailwind-merge alourdirait le JavaScript client.
            className={`fixed inset-0 z-50 overflow-y-auto bg-surface lg:hidden${open ? '' : 'hidden'}`}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-2">
              {switcher}
              <button
                type="button"
                onClick={close}
                aria-label={labels.close}
                className="inline-flex size-11 items-center justify-center rounded-md hover:bg-surface-warm"
              >
                <X aria-hidden="true" className="size-6" />
              </button>
            </div>
            <nav aria-label={labels.nav} className="px-4 py-4">
              <ul className="flex flex-col">
                {items.map((item) => (
                  <li key={item.href} className="border-b border-line last:border-b-0">
                    <a
                      href={item.href}
                      aria-current={item.current ? 'page' : undefined}
                      onClick={() => setOpen(false)}
                      className={`flex min-h-14 items-center font-heading text-xl font-extrabold ${
                        item.current ? 'text-brand-red' : 'text-brand-black'
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>,
          document.body,
        )}
    </div>
  )
}
