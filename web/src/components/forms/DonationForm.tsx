'use client'

import { useRef, useState } from 'react'

import type { Locale } from '@/i18n/routing'
import { HONEYPOT_FIELD } from '@/lib/forms/constants'
import { submitDonation } from '@/lib/forms/actions'
import { CURRENCIES, SUPPORT_AREAS, SUPPORT_TYPES, TIME_SLOTS } from '@/lib/forms/options'
import { donationSchema, MESSAGE_MAX } from '@/lib/forms/schemas'

import { ConsentField, Honeypot, SelectField, TextareaField, TextField } from './fields'
import {
  FormIntro,
  GeneralError,
  SubmitButton,
  SuccessPanel,
  useRequestForm,
  type FormMessages,
} from './useRequestForm'

/**
 * Formulaire « Être rappelé pour mon don » (page Nous soutenir) : pas de paiement en ligne,
 * l'équipe rappelle la personne pour organiser le don. Demandes : collection `donation-requests`.
 */
export function DonationForm({
  locale,
  messages: m,
  privacy,
}: {
  locale: Locale
  messages: FormMessages
  privacy?: { href: string; label: string }
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const form = useRequestForm(submitDonation, donationSchema, m, formRef)
  const [message, setMessage] = useState('')
  const labels = { optional: m.optional }
  const opts = <T extends string>(values: readonly T[], names: Record<T, string>) =>
    values.map((value) => ({ value, label: names[value] }))

  if (form.succeeded)
    return (
      <SuccessPanel
        title={m.donation.successTitle}
        text={m.donation.successText}
        again={m.sendAnother}
        onAgain={() => {
          setMessage('')
          form.reset()
        }}
      />
    )

  return (
    <form
      ref={formRef}
      onSubmit={form.onSubmit}
      noValidate
      aria-labelledby="donation-form-title"
      className="relative space-y-6"
    >
      <div>
        <h2 id="donation-form-title" className="text-[clamp(1.375rem,3.6vw,1.75rem)]">
          {m.donation.title}
        </h2>
        <p className="mt-2">{m.donation.intro}</p>
        <FormIntro>{m.requiredNote}</FormIntro>
      </div>
      <GeneralError message={form.generalError} />

      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="startedAt" value={form.token} />
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
          name="phone"
          type="tel"
          label={m.fields.phone}
          required
          autoComplete="tel"
          inputMode="tel"
          hint={m.fields.phoneHint}
          labels={labels}
          error={form.errorText('phone')}
        />
        <TextField
          name="email"
          type="email"
          label={m.fields.email}
          autoComplete="email"
          hint={m.fields.emailAckHint}
          labels={labels}
          error={form.errorText('email')}
          className="sm:col-span-2"
        />
        <SelectField
          name="supportType"
          label={m.fields.supportType}
          required
          placeholder={m.choose}
          options={opts(SUPPORT_TYPES, m.options.supportType)}
          labels={labels}
          error={form.errorText('supportType')}
        />
        <SelectField
          name="area"
          label={m.fields.area}
          placeholder={m.choose}
          options={opts(SUPPORT_AREAS, m.options.area)}
          labels={labels}
          error={form.errorText('area')}
        />
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <TextField
            name="amount"
            label={m.fields.amount}
            inputMode="decimal"
            hint={m.fields.amountHint}
            labels={labels}
            error={form.errorText('amount')}
          />
          <SelectField
            name="currency"
            label={m.fields.currency}
            placeholder="—"
            defaultValue="USD"
            options={CURRENCIES.map((c) => ({ value: c, label: c }))}
            labels={{ optional: '' }}
            className="[&_label>span]:hidden"
          />
        </div>
        <SelectField
          name="timeSlot"
          label={m.fields.timeSlot}
          placeholder={m.choose}
          options={opts(TIME_SLOTS, m.options.timeSlot)}
          labels={labels}
          error={form.errorText('timeSlot')}
        />
        <TextareaField
          name="message"
          label={m.fields.message}
          maxLength={MESSAGE_MAX.donation}
          counter={m.charsLeft}
          value={message}
          onChange={setMessage}
          labels={labels}
          error={form.errorText('message')}
          className="sm:col-span-2"
        />
      </div>

      <ConsentField label={m.fields.consent} privacy={privacy} error={form.errorText('consent')} />
      <SubmitButton pending={form.pending} label={m.donation.submit} sending={m.sending} />
    </form>
  )
}
