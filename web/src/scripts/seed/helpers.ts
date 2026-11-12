/**
 * Outils du seed : valeurs bilingues, texte riche Lexical minimal, fusion des identifiants de lignes.
 */

export type Locale = 'fr' | 'en'

/** Valeur localisée : une version par langue. */
export type L<T = string> = { __l: true; fr: T; en: T }
export const t = <T = string>(fr: T, en: T): L<T> => ({ __l: true, fr, en })

const isL = (v: unknown): v is L<unknown> =>
  typeof v === 'object' && v !== null && (v as { __l?: unknown }).__l === true

/** Résout récursivement toutes les valeurs bilingues pour une langue. */
export function pick(value: unknown, locale: Locale): unknown {
  if (isL(value)) return value[locale]
  if (Array.isArray(value)) return value.map((v) => pick(v, locale))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, pick(v, locale)]))
  }
  return value
}

/**
 * Les lignes de tableaux et de blocs sont partagées entre les langues : seuls leurs champs
 * localisés diffèrent. Pour écrire la version anglaise sans recréer les lignes (ce qui viderait
 * le français), on reprend l'`id` de chaque ligne du document enregistré.
 */
export function withRowIds(data: unknown, saved: unknown): unknown {
  if (Array.isArray(data)) {
    const savedArr = Array.isArray(saved) ? saved : []
    return data.map((item, i) => {
      const s = savedArr[i] as { id?: unknown } | undefined
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const merged = withRowIds(item, s) as Record<string, unknown>
        return s?.id !== undefined ? { ...merged, id: s.id } : merged
      }
      return item
    })
  }
  if (data && typeof data === 'object') {
    // Texte riche Lexical : valeur entière, propre à chaque langue.
    if ('root' in data) return data
    const s = (saved ?? {}) as Record<string, unknown>
    return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, withRowIds(v, s[k])]))
  }
  return data
}

/* ---------- Texte riche Lexical ---------- */

type Inline = {
  type: 'text'
  text: string
  format: number
  style: ''
  mode: 'normal'
  detail: 0
  version: 1
}

/** Texte avec **gras** simple. */
function inline(text: string): Inline[] {
  return text
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((part) => {
      const bold = part.startsWith('**') && part.endsWith('**')
      return {
        type: 'text',
        text: bold ? part.slice(2, -2) : part,
        format: bold ? 1 : 0,
        style: '',
        mode: 'normal',
        detail: 0,
        version: 1,
      }
    })
}

const base = { format: '', indent: 0, version: 1, direction: 'ltr' as const }

export type RichNode = ['p', string] | ['h', string] | ['ul', string[]] | ['ol', string[]]

export function rich(nodes: RichNode[]) {
  return {
    root: {
      type: 'root',
      ...base,
      children: nodes.map(([kind, content]) => {
        if (kind === 'p') {
          return {
            type: 'paragraph',
            ...base,
            textFormat: 0,
            textStyle: '',
            children: inline(content),
          }
        }
        if (kind === 'h') return { type: 'heading', tag: 'h3', ...base, children: inline(content) }
        return {
          type: 'list',
          listType: kind === 'ul' ? 'bullet' : 'number',
          tag: kind,
          start: 1,
          ...base,
          children: content.map((item, i) => ({
            type: 'listitem',
            value: i + 1,
            ...base,
            children: inline(item),
          })),
        }
      }),
    },
  }
}

/** Texte riche bilingue. */
export const richT = (fr: RichNode[], en: RichNode[]) => t(rich(fr), rich(en))
