// Textes de la page de lancement (FR par défaut, EN).
// Les faits (nom, adresse, domaines) viennent de docs/contenu-source.md : ne rien ajouter qui n'y figure pas.

export const LOCALES = ['fr', 'en'];
export const DEFAULT_LOCALE = 'fr';

export const messages = {
  fr: {
    'meta.title': 'Fondation Stark Hold Solutions — Notre nouveau site arrive',
    'meta.description':
      'La Fondation Stark Hold Solutions (FSHS), ASBL congolaise, ouvre son nouveau site le 20 novembre 2026. Santé maternelle, agriculture, élevage, pêche et pisciculture.',
    'lang.label': 'Langue du site',
    'hero.eyebrow': 'Fondation Stark Hold Solutions',
    'hero.title': 'Notre nouveau site arrive',
    'hero.date': 'Ouverture le 20 novembre 2026',
    'countdown.label': 'Compte à rebours avant l’ouverture',
    'unit.days': 'Jours',
    'unit.hours': 'Heures',
    'unit.minutes': 'Minutes',
    'unit.seconds': 'Secondes',
    'countdown.live': 'Ouverture dans {d} jours, {h} heures et {m} minutes.',
    'live.title': 'Le site est en ligne',
    'live.text': 'Merci de votre patience.',
    'live.cta': 'Découvrir le site',
    intro:
      'ASBL congolaise à vocation nationale, la Fondation Stark Hold Solutions mène des actions d’urgence et de développement durable, et assiste les communautés et les populations vulnérables.',
    'domains.title': 'Nos domaines d’action',
    'domain.health': 'Santé maternelle',
    'domain.agriculture': 'Agriculture',
    'domain.livestock': 'Élevage',
    'domain.fishing': 'Pêche & pisciculture',
    'domain.inputs': 'Intrants piscicoles',
    'contact.title': 'Nous contacter',
    'contact.whatsapp': 'Écrire sur WhatsApp',
    'contact.call': 'Appeler',
    'contact.email': 'Envoyer un e-mail',
    'contact.whatsappMessage':
      'Bonjour, je souhaite avoir des informations sur la Fondation Stark Hold Solutions.',
    'social.title': 'Suivez-nous',
    'social.x': 'Fondation Stark Hold Solutions sur X',
    'social.linkedin': 'Fondation Stark Hold Solutions sur LinkedIn',
    'social.facebook': 'Fondation Stark Hold Solutions sur Facebook',
    'footer.tagline': 'Aller plus loin ensemble',
    'footer.address':
      'Siège : N° 70, Av. de la Gombe, Q. Batetela, Commune de la Gombe, Kinshasa, RD Congo',
    'footer.legal': 'Association sans but lucratif (ASBL)',
  },
  en: {
    'meta.title': 'Fondation Stark Hold Solutions — Our new website is coming',
    'meta.description':
      'Fondation Stark Hold Solutions (FSHS), a Congolese non-profit, launches its new website on 20 November 2026. Maternal health, agriculture, livestock, fishing and fish farming.',
    'lang.label': 'Website language',
    'hero.eyebrow': 'Fondation Stark Hold Solutions',
    'hero.title': 'Our new website is coming',
    'hero.date': 'Opening on 20 November 2026',
    'countdown.label': 'Countdown to the launch',
    'unit.days': 'Days',
    'unit.hours': 'Hours',
    'unit.minutes': 'Minutes',
    'unit.seconds': 'Seconds',
    'countdown.live': 'Opening in {d} days, {h} hours and {m} minutes.',
    'live.title': 'We’re live',
    'live.text': 'Thank you for your patience.',
    'live.cta': 'Discover the website',
    intro:
      'A Congolese non-profit working nationwide, Fondation Stark Hold Solutions carries out emergency and sustainable development work and supports vulnerable communities and people.',
    'domains.title': 'What we do',
    'domain.health': 'Maternal health',
    'domain.agriculture': 'Agriculture',
    'domain.livestock': 'Livestock',
    'domain.fishing': 'Fishing & fish farming',
    'domain.inputs': 'Fish-farming inputs',
    'contact.title': 'Get in touch',
    'contact.whatsapp': 'Chat on WhatsApp',
    'contact.call': 'Call',
    'contact.email': 'Send an email',
    'contact.whatsappMessage':
      'Hello, I would like to know more about Fondation Stark Hold Solutions.',
    'social.title': 'Follow us',
    'social.x': 'Fondation Stark Hold Solutions on X',
    'social.linkedin': 'Fondation Stark Hold Solutions on LinkedIn',
    'social.facebook': 'Fondation Stark Hold Solutions on Facebook',
    'footer.tagline': 'Go further together',
    'footer.address':
      'Head office: No. 70, Av. de la Gombe, Q. Batetela, Commune de la Gombe, Kinshasa, DR Congo',
    'footer.legal': 'Non-profit association (ASBL)',
  },
};

/** Langues de RDC rattachées au français, en plus du français lui-même. */
const FRENCH_FAMILY = ['fr', 'ln', 'sw', 'kg', 'lu'];

/** Choisit la langue : français si le navigateur est en français (ou langue de RDC) ou inconnu, sinon anglais. */
export function detectLocale(languages) {
  const first = (languages && languages[0]) || '';
  if (!first) return DEFAULT_LOCALE;
  const base = first.toLowerCase().split('-')[0];
  return FRENCH_FAMILY.includes(base) ? 'fr' : 'en';
}

export function t(locale, key, vars) {
  const dict = messages[locale] || messages[DEFAULT_LOCALE];
  let s = dict[key] ?? messages[DEFAULT_LOCALE][key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}
