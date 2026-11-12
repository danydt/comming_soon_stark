/**
 * Transforme un texte en slug d'URL : minuscules, sans accents, mots séparés par des tirets.
 * « Pêche & pisciculture » → « peche-pisciculture » ; « Maï-Ndombe » → « mai-ndombe ».
 */
export function slugify(input: string | null | undefined): string {
  if (!input) return ''
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, '-')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 96)
    .replace(/-+$/g, '')
}
