import 'server-only'

import { getTranslations } from 'next-intl/server'
import type { Payload } from 'payload'

import type { Locale } from '@/i18n/routing'
import { contactRecipient } from '@/lib/email'
import { serverURL } from '@/lib/env'

import { ADMIN_LABELS } from './options'
import type { ContactInput, DonationInput } from './schemas'

/**
 * E-mails des formulaires (phase 4) : notification à l'équipe (en français, avec un lien direct
 * vers la demande dans /admin) et accusé de réception au visiteur, dans sa langue, s'il a laissé
 * une adresse. Un échec d'envoi est journalisé mais n'annule pas la demande, déjà enregistrée.
 */

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  )

type Row = [label: string, value: string | number | null | undefined]

function renderTable(title: string, rows: Row[], link: { href: string; label: string }) {
  const filled = rows.filter((r): r is [string, string | number] => r[1] != null && r[1] !== '')
  const text = [
    title,
    '',
    ...filled.map(([k, v]) => `${k} : ${v}`),
    '',
    `${link.label} : ${link.href}`,
  ].join('\n')
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0C0C0C">
<h1 style="font-size:18px">${escapeHtml(title)}</h1>
<table cellpadding="6" style="border-collapse:collapse">${filled
    .map(
      ([k, v]) =>
        `<tr><th align="left" valign="top" style="color:#595959;font-weight:600">${escapeHtml(k)}</th><td style="white-space:pre-line">${escapeHtml(String(v))}</td></tr>`,
    )
    .join('')}</table>
<p><a href="${escapeHtml(link.href)}" style="display:inline-block;background:#C00000;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:600">${escapeHtml(link.label)}</a></p>
</div>`
  return { text, html }
}

function renderPlain(body: string, footer: string) {
  const text = `${body}\n\n—\n${footer}`
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0C0C0C;white-space:pre-line">${escapeHtml(body)}</div>
<p style="font-family:Arial,sans-serif;font-size:12px;color:#595959">${escapeHtml(footer)}</p>`
  return { text, html }
}

const adminLink = (collection: string, id: number | string) => ({
  href: `${serverURL()}/admin/collections/${collection}/${id}`,
  label: 'Ouvrir la demande dans l’administration',
})

const amountLabel = (d: DonationInput) =>
  d.amount === undefined ? undefined : `${d.amount.toLocaleString('fr-FR')} ${d.currency ?? ''}`

async function send(payload: Payload, message: Parameters<Payload['sendEmail']>[0]) {
  try {
    await payload.sendEmail(message)
  } catch (error) {
    payload.logger.error({ err: error, to: message?.to }, 'Échec d’envoi d’un e-mail de formulaire')
  }
}

export async function sendDonationEmails(
  payload: Payload,
  id: number | string,
  data: DonationInput,
) {
  const notification = renderTable(
    `Nouvelle demande de don : ${data.name}`,
    [
      ['Nom', data.name],
      ['Téléphone', data.phone],
      ['E-mail', data.email],
      ['Type de soutien', ADMIN_LABELS.supportType[data.supportType]],
      ['Domaine', data.area && ADMIN_LABELS.area[data.area]],
      ['Montant envisagé', amountLabel(data)],
      ['Créneau', data.timeSlot && ADMIN_LABELS.timeSlot[data.timeSlot]],
      ['Message', data.message],
      ['Langue', data.locale.toUpperCase()],
      ['Page', data.sourcePage],
    ],
    adminLink('donation-requests', id),
  )
  const jobs = [
    send(payload, {
      to: contactRecipient(),
      subject: `[Don] ${data.name} — à rappeler`,
      ...notification,
    }),
  ]
  if (data.email) jobs.push(acknowledge(payload, data.locale, data.email, 'donation', data))
  await Promise.all(jobs)
}

export async function sendContactEmails(
  payload: Payload,
  id: number | string,
  data: ContactInput,
  productTitle?: string,
) {
  const notification = renderTable(
    `Nouveau message de contact : ${data.name}`,
    [
      ['Nom', data.name],
      ['E-mail', data.email],
      ['Téléphone', data.phone],
      ['Organisation', data.organization],
      ['Sujet', ADMIN_LABELS.subject[data.subject]],
      ['Produit', productTitle],
      ['Message', data.message],
      ['Langue', data.locale.toUpperCase()],
      ['Page', data.sourcePage],
    ],
    adminLink('contact-messages', id),
  )
  await Promise.all([
    send(payload, {
      to: contactRecipient(),
      replyTo: data.email,
      subject: `[Contact — ${ADMIN_LABELS.subject[data.subject]}] ${data.name}`,
      ...notification,
    }),
    acknowledge(payload, data.locale, data.email, 'contact', data),
  ])
}

async function acknowledge(
  payload: Payload,
  locale: Locale,
  to: string,
  kind: 'donation' | 'contact',
  data: { name: string; phone?: string },
) {
  const t = await getTranslations({ locale, namespace: 'emails' })
  const body =
    kind === 'donation'
      ? t('donationAckBody', { name: data.name, phone: data.phone ?? '' })
      : t('contactAckBody', { name: data.name })
  await send(payload, {
    to,
    subject: t(kind === 'donation' ? 'donationAckSubject' : 'contactAckSubject'),
    ...renderPlain(body, t('footer')),
  })
}
