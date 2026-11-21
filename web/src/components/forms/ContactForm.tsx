'use client'

import { useRef, useState, useSyncExternalStore } from 'react'

import type { Locale } from '@/i18n/routing'
import { submitContact } from '@/lib/forms/actions'
import { HONEYPOT_FIELD } from '@/lib/forms/constants'
import { CONTACT_SUBJECTS } from '@/lib/forms/options'
import { contactSchema, MESSAGE_MAX } from '@/lib/forms/schemas'

import { ConsentField, Honeypot, SelectField, TextareaField, TextField } from './fields'
import {
  FormIntro,
  GeneralError,
  SubmitButton,
  SuccessPanel,
  useRequestForm,
  type FormMessages,
} from './useRequestForm'

const noop = () => () => {}

/**
 * Formulaire de la page Contact. Une fiche produit y renvoie avec `?produit=<slug>` (D29) :
 * le sujet « Produits & devis » est présélectionné et le produit rattaché à la demande.
 * Le paramètre est lu dans le navigateur : la page Contact reste statique.
 */
export function ContactForm({
  locale,
  messages: m,
  privacy,
  products,
}: {
  locale: Locale
  messages: FormMessages
  privacy?: { href: string; label: string }
  products: { slug: string; name: string }[]
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const form = useRequestForm(submitContact, contactSchema, m, formRef)
  const search = useSyncExternalStore(
    noop,
    () => window.location.search,
    () => '',
  )
  const productSlug = new URLSearchParams(search).get('produit')
  const product = products.find((p) => p.slug === productSlug)
  const [subjectChoice, setSubjectChoice] = useState<string | null>(null)
  const subject = subjectChoice ?? (product ? 'quote' : '')
  const [message, setMessage] = useState('')
  const labels = { optional: m.optional }

  if (form.succeeded)
    return (
      <SuccessPanel
        title={m.contact.successTitle}
        text={m.contact.successText}
        again={m.sendAnother}
        onAgain={() => {
          setMessage('')
          setSubjectChoice(null)
          form.reset()
        }}
      />
    )

  return (
    <form
      ref={formRef}
      onSubmit={form.onSubmit}
      noValidate
      aria-labelledby="contact-form-title"
      className="relative space-y-6"
    >
      <div>
        <h2 id="contact-form-title" className="text-xl">
          {m.contact.title}
        </h2>
        <p className="mt-2">{m.contact.intro}</p>
        <FormIntro>{m.requiredNote}</FormIntro>
      </div>
      <GeneralError message={form.generalError} />

      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="startedAt" value={form.token} />
      {product && subject === 'quote' && (
        <>
          <input type="hidden" name="product" value={product.slug} />
          <p className="rounded-[10px] bg-surface-warm px-4 py-3 font-semibold">
            {m.contact.quoteFor.replace('{product}', product.name)}
          </p>
        </>
      )}
      <Honeypot name={HONEYPOT_FIELD} label={m.fields.website} />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="name"
          label={m.fields.name}
          required
          autoComplete="name"
          labels={labels}
          error={form.errorText('name')}
        />
        <TextField
          name="email"
          type="email"
          label={m.fields.email}
          required
          autoComplete="email"
          labels={labels}
          error={form.errorText('email')}
        />
        <TextField
          name="phone"
          type="tel"
          label={m.fields.phone}
          autoComplete="tel"
          inputMode="tel"
          hint={m.fields.phoneHint}
          labels={labels}
          error={form.errorText('phone')}
        />
        <TextField
          name="organization"
          label={m.fields.organization}
          autoComplete="organization"
          labels={labels}
          error={form.errorText('organization')}
        />
        <SelectField
          name="subject"
          label={m.fields.subject}
          required
          placeholder={m.choose}
          value={subject}
          onChange={setSubjectChoice}
          options={CONTACT_SUBJECTS.map((value) => ({ value, label: m.options.subject[value] }))}
          labels={labels}
          error={form.errorText('subject')}
          className="sm:col-span-2"
        />
        <TextareaField
          name="message"
          label={m.fields.message}
          required
          maxLength={MESSAGE_MAX.contact}
          counter={m.charsLeft}
          value={message}
          onChange={setMessage}
          labels={labels}
          error={form.errorText('message')}
          className="sm:col-span-2"
        />
      </div>

      <ConsentField label={m.fields.consent} privacy={privacy} error={form.errorText('consent')} />
      <SubmitButton pending={form.pending} label={m.contact.submit} sending={m.sending} />
    </form>
  )
}
