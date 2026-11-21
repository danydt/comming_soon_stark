'use client'

import { useId, type ReactNode } from 'react'

/**
 * Champs de formulaire accessibles : libellé visible, astérisque pour les champs obligatoires
 * (expliqué en tête de formulaire), aide et erreur reliées par `aria-describedby`,
 * `aria-invalid` en cas d'erreur. Cibles d'au moins 44 px.
 * Sans `cn`/tailwind-merge : les classes sont composées à la main (poids du JS client, D30).
 */

export type FieldLabels = { optional: string }

const control =
  'block w-full rounded-[10px] border bg-surface px-4 text-base text-brand-black placeholder:text-text-muted focus-visible:border-brand-black'
const border = (invalid: boolean) =>
  invalid ? 'border-brand-red' : 'border-[#BDB8B1] hover:border-brand-black'

type Common = {
  name: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  labels: FieldLabels
  className?: string
}

function Frame({
  id,
  label,
  required,
  hint,
  error,
  labels,
  className,
  children,
}: Omit<Common, 'name'> & { id: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-semibold">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-brand-red">
            {' '}
            *
          </span>
        ) : (
          <span className="font-normal text-text-muted"> ({labels.optional})</span>
        )}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-semibold text-brand-red">
          {error}
        </p>
      )}
    </div>
  )
}

const describedBy = (id: string, hint?: string, error?: string) =>
  [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined

export function TextField({
  type = 'text',
  autoComplete,
  inputMode,
  defaultValue,
  ...props
}: Common & {
  type?: 'text' | 'email' | 'tel'
  autoComplete?: string
  inputMode?: 'text' | 'tel' | 'email' | 'decimal'
  defaultValue?: string
}) {
  const id = useId()
  return (
    <Frame id={id} {...props}>
      <input
        id={id}
        name={props.name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        defaultValue={defaultValue}
        required={props.required}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={describedBy(id, props.hint, props.error)}
        className={`${control} ${border(Boolean(props.error))} min-h-12`}
      />
    </Frame>
  )
}

export function SelectField({
  options,
  placeholder,
  value,
  onChange,
  defaultValue,
  ...props
}: Common & {
  options: { value: string; label: string }[]
  placeholder: string
  value?: string
  onChange?: (value: string) => void
  defaultValue?: string
}) {
  const id = useId()
  const controlled = value !== undefined
  return (
    <Frame id={id} {...props}>
      <select
        id={id}
        name={props.name}
        required={props.required}
        {...(controlled
          ? { value, onChange: (e) => onChange?.(e.target.value) }
          : { defaultValue: defaultValue ?? '' })}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={describedBy(id, props.hint, props.error)}
        className={`${control} ${border(Boolean(props.error))} min-h-12 appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='20'%20height='20'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%230C0C0C'%20stroke-width='2'%3E%3Cpath%20d='m6%209%206%206%206-6'/%3E%3C/svg%3E")] bg-[length:20px] bg-[right_14px_center] bg-no-repeat pr-11`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Frame>
  )
}

export function TextareaField({
  maxLength,
  counter,
  value,
  onChange,
  ...props
}: Common & {
  maxLength: number
  /** Texte « {count} caractères restants ». */
  counter: string
  value: string
  onChange: (value: string) => void
}) {
  const id = useId()
  const left = maxLength - value.length
  return (
    <Frame id={id} {...props}>
      <textarea
        id={id}
        name={props.name}
        rows={5}
        maxLength={maxLength}
        required={props.required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={[describedBy(id, props.hint, props.error), `${id}-count`]
          .filter(Boolean)
          .join(' ')}
        className={`${control} ${border(Boolean(props.error))} py-3`}
      />
      <p id={`${id}-count`} className="mt-1 text-right text-sm text-text-muted" aria-live="polite">
        {left <= 100 ? counter.replace('{count}', String(left)) : null}
      </p>
    </Frame>
  )
}

export function ConsentField({
  label,
  privacy,
  error,
}: {
  label: string
  privacy?: { href: string; label: string }
  error?: string
}) {
  const id = useId()
  return (
    <div>
      <div className="flex gap-3">
        <input
          id={id}
          name="consent"
          type="checkbox"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-6 shrink-0 accent-brand-red"
        />
        <label htmlFor={id} className="leading-snug">
          {label}
          <span aria-hidden="true" className="text-brand-red">
            {' '}
            *
          </span>
        </label>
      </div>
      {privacy && (
        <a
          href={privacy.href}
          className="mt-1 ml-9 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4"
        >
          {privacy.label}
        </a>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 ml-9 text-sm font-semibold text-brand-red">
          {error}
        </p>
      )}
    </div>
  )
}

/** Champ piège : invisible et hors du parcours clavier, rempli seulement par les robots. */
export function Honeypot({ name, label }: { name: string; label: string }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        {label}
        <input type="text" name={name} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  )
}
