import { expect, test, type APIRequestContext } from '@playwright/test'

/**
 * Règles de publication vues depuis l'API publique (nécessite `pnpm seed`).
 * Un visiteur ne voit que le contenu publié, même en demandant les brouillons,
 * et ne voit jamais un montant non marqué « à afficher ».
 */
type Doc = { slug: string; name?: string; amount?: { display?: boolean } | null }
type List = { totalDocs: number; docs: Doc[] }

async function list(request: APIRequestContext, path: string): Promise<List> {
  const res = await request.get(`/api/${path}`)
  expect(res.ok()).toBeTruthy()
  return (await res.json()) as List
}

test.describe('API publique', () => {
  test.setTimeout(180_000)

  test('seuls les projets de santé publiés sont visibles, même avec draft=true', async ({
    request,
  }) => {
    for (const query of ['projects?limit=50&depth=0', 'projects?limit=50&depth=0&draft=true']) {
      const { totalDocs, docs } = await list(request, query)
      expect(totalDocs).toBe(6)
      expect(docs.map((d) => d.slug)).not.toContain('fistules-fistula-foundation')
      expect(docs.map((d) => d.slug)).not.toContain('infrastructures-boma-tshela')
    }
  })

  test('la Fistula Foundation n’apparaît pas parmi les partenaires', async ({ request }) => {
    const { docs } = await list(request, 'partners?limit=50&depth=0&draft=true')
    expect(docs.map((d) => d.name)).not.toContain('Fistula Foundation')
  })

  test('les produits et marques d’exemple restent invisibles', async ({ request }) => {
    expect((await list(request, 'products?draft=true&depth=0')).totalDocs).toBe(0)
    expect((await list(request, 'brands?draft=true&depth=0')).totalDocs).toBe(0)
  })

  test('un montant publié est toujours marqué « à afficher »', async ({ request }) => {
    const { docs } = await list(request, 'projects?limit=50&depth=0')
    for (const d of docs) {
      if (d.amount) expect(d.amount.display).toBe(true)
    }
  })

  test('slugs localisés : même secteur en /fr et /en', async ({ request }) => {
    const fr = await list(request, 'sectors?locale=fr&depth=0&where[slug][equals]=sante')
    const en = await list(request, 'sectors?locale=en&depth=0&where[slug][equals]=health')
    expect(fr.totalDocs).toBe(1)
    expect(en.totalDocs).toBe(1)
  })

  test('les demandes de modification sont refusées sans connexion', async ({ request }) => {
    const res = await request.post('/api/sectors', { data: { title: 'Test' } })
    expect(res.status()).toBe(403)
  })
})
