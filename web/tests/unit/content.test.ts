import type { FieldAccess, PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { amountVisible } from '@/access'
import { validateHref } from '@/fields/link'
import { PROVINCES } from '@/lib/provinces'
import { affectedLocales, docTags, tags } from '@/lib/revalidate'
import { slugify } from '@/lib/slugify'
import { pick, rich, t, withRowIds } from '@/scripts/seed/helpers'
import { PARTNERS, PROJECTS } from '@/scripts/seed/data'

describe('slugify', () => {
  it('retire les accents et la ponctuation', () => {
    expect(slugify('Pêche & pisciculture')).toBe('peche-pisciculture')
    expect(slugify('Maï-Ndombe')).toBe('mai-ndombe')
    expect(slugify('À propos')).toBe('a-propos')
    expect(slugify('Fistules obstétricales — Kasangulu')).toBe('fistules-obstetricales-kasangulu')
    expect(slugify('L’équipe')).toBe('l-equipe')
  })
  it('gère les valeurs vides', () => {
    expect(slugify('')).toBe('')
    expect(slugify(null)).toBe('')
    expect(slugify('  --  ')).toBe('')
  })
})

describe('revalidation du cache', () => {
  it('une modification en français touche aussi l’anglais (langue de repli)', () => {
    expect(affectedLocales('fr')).toEqual(['fr', 'en'])
    expect(affectedLocales('all')).toEqual(['fr', 'en'])
    expect(affectedLocales('en')).toEqual(['en'])
  })
  it('étiquettes de liste et de document, ancien et nouveau slug', () => {
    expect(docTags('sectors', 'en', ['health', 'sante-old'])).toEqual([
      tags.collection('sectors', 'en'),
      'sectors:en:health',
      'sectors:en:sante-old',
    ])
  })
})

describe('montant des projets', () => {
  type User = NonNullable<PayloadRequest['user']>
  const args = (doc: unknown, role?: string) =>
    ({
      req: { user: role ? ({ id: 1, role, collection: 'users' } as unknown as User) : null },
      doc,
    }) as unknown as Parameters<FieldAccess>[0]

  it('masqué au public tant que « Afficher le montant » n’est pas coché', () => {
    expect(amountVisible(args({ amount: { value: 1, display: false } }))).toBe(false)
    expect(amountVisible(args({ amount: { value: 1 } }))).toBe(false)
    expect(amountVisible(args({ amount: { value: 1, display: true } }))).toBe(true)
  })
  it('toujours visible par l’équipe', () => {
    expect(amountVisible(args({ amount: { display: false } }, 'editor'))).toBe(true)
  })
})

describe('liens', () => {
  it('accepte chemins internes et liens sûrs, refuse le reste', () => {
    for (const ok of [
      '/secteurs',
      '#contact',
      'https://x.org',
      'mailto:a@b.org',
      'tel:+243904947476',
    ]) {
      expect(validateHref(ok)).toBe(true)
    }
    for (const ko of ['', 'http://x.org', 'javascript:alert(1)', 'secteurs']) {
      expect(validateHref(ko)).not.toBe(true)
    }
  })
})

describe('provinces', () => {
  it('26 provinces, identifiants uniques', () => {
    expect(PROVINCES).toHaveLength(26)
    expect(new Set(PROVINCES.map((p) => p.value)).size).toBe(26)
  })
})

describe('outils du seed', () => {
  it('pick résout les valeurs bilingues en profondeur', () => {
    const data = { title: t('Bonjour', 'Hello'), items: [{ label: t('Un', 'One'), n: 1 }] }
    expect(pick(data, 'en')).toEqual({ title: 'Hello', items: [{ label: 'One', n: 1 }] })
  })
  it('withRowIds reprend les ids des lignes enregistrées sans toucher au texte riche', () => {
    const body = rich([['p', 'x']])
    const saved = {
      items: [
        { id: 'a', label: 'Un' },
        { id: 'b', label: 'Deux' },
      ],
      body,
    }
    const en = { items: [{ label: 'One' }, { label: 'Two' }], body }
    expect(withRowIds(en, saved)).toEqual({
      items: [
        { label: 'One', id: 'a' },
        { label: 'Two', id: 'b' },
      ],
      body,
    })
  })
  it('texte riche : gras simple', () => {
    const p = rich([['p', '**Siège** : Kinshasa']]).root.children[0] as {
      children: { text: string; format: number }[]
    }
    expect(p.children.map((c) => [c.text, c.format])).toEqual([
      ['Siège', 1],
      [' : Kinshasa', 0],
    ])
  })
})

describe('règles de contenu du seed', () => {
  it('la Fistula Foundation reste en brouillon, sans montant', () => {
    expect(PARTNERS.find((p) => p.key === 'fistula-foundation')?.status).toBe('draft')
    const project = PROJECTS.find((p) => p.key === 'fistula-foundation')
    expect(project?.status).toBe('draft')
    expect(project?.data.amount).toBeUndefined()
  })
  it('seuls les projets de santé sont publiés', () => {
    const published = PROJECTS.filter((p) => p.status === 'published')
    expect(published).toHaveLength(6)
    for (const p of published) expect(p.data.sector).toEqual({ __ref: ['sectors', 'sante'] })
  })
  it('les montants hors périmètre ne sont pas affichés', () => {
    for (const p of PROJECTS.filter((p) => p.status === 'draft' && p.data.amount)) {
      expect((p.data.amount as { display: boolean }).display).toBe(false)
    }
  })
})
