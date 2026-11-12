/** Les 26 provinces de la RDC (Constitution de 2006, découpage effectif depuis 2015). */
export const PROVINCES = [
  { value: 'kinshasa', fr: 'Kinshasa', en: 'Kinshasa' },
  { value: 'kongo-central', fr: 'Kongo Central', en: 'Kongo Central' },
  { value: 'kwango', fr: 'Kwango', en: 'Kwango' },
  { value: 'kwilu', fr: 'Kwilu', en: 'Kwilu' },
  { value: 'mai-ndombe', fr: 'Maï-Ndombe', en: 'Mai-Ndombe' },
  { value: 'equateur', fr: 'Équateur', en: 'Équateur' },
  { value: 'sud-ubangi', fr: 'Sud-Ubangi', en: 'Sud-Ubangi' },
  { value: 'nord-ubangi', fr: 'Nord-Ubangi', en: 'Nord-Ubangi' },
  { value: 'mongala', fr: 'Mongala', en: 'Mongala' },
  { value: 'tshuapa', fr: 'Tshuapa', en: 'Tshuapa' },
  { value: 'tshopo', fr: 'Tshopo', en: 'Tshopo' },
  { value: 'bas-uele', fr: 'Bas-Uele', en: 'Bas-Uele' },
  { value: 'haut-uele', fr: 'Haut-Uele', en: 'Haut-Uele' },
  { value: 'ituri', fr: 'Ituri', en: 'Ituri' },
  { value: 'nord-kivu', fr: 'Nord-Kivu', en: 'North Kivu' },
  { value: 'sud-kivu', fr: 'Sud-Kivu', en: 'South Kivu' },
  { value: 'maniema', fr: 'Maniema', en: 'Maniema' },
  { value: 'haut-katanga', fr: 'Haut-Katanga', en: 'Haut-Katanga' },
  { value: 'lualaba', fr: 'Lualaba', en: 'Lualaba' },
  { value: 'haut-lomami', fr: 'Haut-Lomami', en: 'Haut-Lomami' },
  { value: 'tanganyika', fr: 'Tanganyika', en: 'Tanganyika' },
  { value: 'lomami', fr: 'Lomami', en: 'Lomami' },
  { value: 'sankuru', fr: 'Sankuru', en: 'Sankuru' },
  { value: 'kasai', fr: 'Kasaï', en: 'Kasai' },
  { value: 'kasai-central', fr: 'Kasaï Central', en: 'Kasai Central' },
  { value: 'kasai-oriental', fr: 'Kasaï Oriental', en: 'Kasai Oriental' },
] as const

export type Province = (typeof PROVINCES)[number]['value']

export const provinceOptions = PROVINCES.map(({ value, fr }) => ({ value, label: fr }))
