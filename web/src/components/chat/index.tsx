import 'server-only'

import { MessageCircle } from 'lucide-react'
import type { ReactNode } from 'react'

import { whatsappHref } from '@/components/site/ContactDetails'
import type { Locale } from '@/i18n/routing'
import { readEnv } from '@/lib/env'
import type { SiteSetting } from '@/payload-types'

/**
 * « Discuter avec nous » : bouton flottant, en bas à droite de toutes les pages.
 * Le fournisseur est choisi par la variable `CHAT_PROVIDER` (défaut : `whatsapp`).
 * Pour brancher Crisp ou Tawk.to plus tard : écrire un `ChatProvider` qui rend son lanceur
 * (et charge son script, par exemple avec `next/script` en `lazyOnload`), puis l'ajouter à
 * `PROVIDERS`. Le reste du site n'a pas à changer.
 */

export type ChatContext = {
  locale: Locale
  settings: SiteSetting
  labels: { chat: string; chatLabel: string }
}

export interface ChatProvider {
  id: string
  /** Lanceur affiché sur toutes les pages (null si le fournisseur n'est pas configuré). */
  Launcher: (ctx: ChatContext) => ReactNode
}

/**
 * Positionnement commun : au-dessus de la barre « Faire un don » sur mobile (elle mesure
 * 72 px, plus la zone de sécurité de l'écran), en bas à droite sur ordinateur.
 */
export const LAUNCHER_POSITION =
  'fixed right-4 bottom-[calc(84px+env(safe-area-inset-bottom))] z-30 lg:right-6 lg:bottom-6'

const whatsapp: ChatProvider = {
  id: 'whatsapp',
  Launcher: ({ settings, labels }) => {
    if (!settings.whatsappNumber) return null
    return (
      <a
        href={whatsappHref(settings.whatsappNumber, settings.whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={labels.chatLabel}
        data-chat="whatsapp"
        className={`${LAUNCHER_POSITION} inline-flex size-14 items-center justify-center gap-2 rounded-full bg-[#25D366] font-semibold text-brand-black shadow-[0_6px_20px_rgb(0_0_0/0.22)] transition-transform hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100 lg:h-14 lg:w-auto lg:px-5`}
      >
        <MessageCircle aria-hidden="true" className="size-7 lg:size-6" />
        <span aria-hidden="true" className="hidden lg:inline">
          {labels.chat}
        </span>
      </a>
    )
  },
}

const PROVIDERS: Record<string, ChatProvider> = { whatsapp }

export function chatProvider(): ChatProvider {
  const id = readEnv('CHAT_PROVIDER') ?? 'whatsapp'
  const provider = PROVIDERS[id]
  if (!provider) {
    console.warn(`CHAT_PROVIDER « ${id} » inconnu : repli sur WhatsApp.`)
    return whatsapp
  }
  return provider
}

export function ChatLauncher(ctx: ChatContext) {
  const { Launcher } = chatProvider()
  return <Launcher {...ctx} />
}
