'use client'

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
  type ReactNode,
} from 'react'
import type { ZodType } from 'zod'

import { issueFormToken, type FormState } from '@/lib/forms/actions'
import { fieldErrors, type FieldErrors } from '@/lib/forms/schemas'

import type messagesFr from '../../../messages/fr.json'

/** Textes `forms.*` de next-intl, transmis tels quels par le composant serveur. */
export type FormMessages = (typeof messagesFr)['forms']

type Action = (prev: FormState, formData: FormData) => Promise<FormState>

/**
 * Logique commune des formulaires : validation zod dans le navigateur (mêmes règles que le
 * serveur), jeton anti-spam demandé au montage, envoi via Server Action, erreurs par champ,
 * focus sur le premier champ en erreur ou sur le message de succès.
 */
export function useRequestForm(
  action: Action,
  schema: ZodType,
  messages: FormMessages,
  formRef: RefObject<HTMLFormElement | null>,
) {
  const [state, formAction, pending] = useActionState(action, { status: 'idle' })
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null)
  const [token, setToken] = useState('')
  // `lastState` : dernière réponse du serveur prise en compte ; `view` : ce qui est affiché
  // (« Envoyer une autre demande » revient à l'état initial sans attendre une nouvelle réponse).
  const [lastState, setLastState] = useState<FormState>(state)
  const [view, setView] = useState<FormState>(state)

  useEffect(() => {
    let alive = true
    issueFormToken()
      .then((t) => alive && setToken(t))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  if (state !== lastState) {
    setLastState(state)
    setView(state)
    setClientErrors(null)
  }

  const errors: FieldErrors = clientErrors ?? (view.status === 'error' ? (view.errors ?? {}) : {})

  // Focus sur le premier champ en erreur après un envoi refusé (navigateur ou serveur).
  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [clientErrors, view, formRef])

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    formData.set('sourcePage', window.location.pathname + window.location.search)
    const values = Object.fromEntries(
      [...formData.entries()].filter(([, v]) => typeof v === 'string'),
    )
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      setClientErrors(fieldErrors(parsed.error))
      return
    }
    setClientErrors(null)
    startTransition(() => formAction(formData))
  }

  const errorText = (field: string) => {
    const code = errors[field]
    return code ? (messages.errors[code as keyof FormMessages['errors']] ?? code) : undefined
  }

  const generalCode =
    clientErrors && Object.keys(clientErrors).length
      ? 'invalid'
      : view.status === 'error'
        ? view.code
        : null

  return {
    onSubmit,
    pending,
    token,
    succeeded: view.status === 'success',
    errorText,
    generalError: generalCode ? messages.errors[generalCode] : null,
    reset: () => {
      setView({ status: 'idle' })
      setClientErrors(null)
      issueFormToken()
        .then(setToken)
        .catch(() => {})
    },
  }
}

export function GeneralError({ message }: { message: string | null }) {
  return (
    <div role="alert" aria-live="assertive">
      {message && (
        <p className="rounded-[10px] border-2 border-brand-red bg-[#FDF2F2] px-4 py-3 font-semibold text-brand-red-deep">
          {message}
        </p>
      )}
    </div>
  )
}

export function SuccessPanel({
  title,
  text,
  again,
  onAgain,
}: {
  title: string
  text: string
  again: string
  onAgain: () => void
}) {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => ref.current?.focus(), [])
  return (
    <div role="status" className="rounded-[var(--radius-card)] border-2 border-success p-6">
      <h2 ref={ref} tabIndex={-1} className="text-xl text-success outline-none">
        {title}
      </h2>
      <p className="mt-2">{text}</p>
      <button
        type="button"
        onClick={onAgain}
        className="mt-5 inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
      >
        {again}
      </button>
    </div>
  )
}

export function SubmitButton({
  pending,
  label,
  sending,
}: {
  pending: boolean
  label: string
  sending: string
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border-2 border-brand-red bg-brand-red px-6 py-3 font-semibold text-white transition-colors hover:border-brand-red-deep hover:bg-brand-red-deep disabled:opacity-60"
    >
      {pending ? sending : label}
    </button>
  )
}

export function FormIntro({ children }: { children: ReactNode }) {
  return <p className="text-sm text-text-muted">{children}</p>
}
