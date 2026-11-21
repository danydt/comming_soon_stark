/**
 * Supprime les demandes créées par les tests e2e (nom commençant par « E2E »).
 * Lancé automatiquement à la fin de `pnpm test:e2e` (globalTeardown), ou à la main :
 * `pnpm e2e:cleanup`.
 */
import { getPayload } from 'payload'

import config from '@payload-config'

const payload = await getPayload({ config })
for (const collection of ['donation-requests', 'contact-messages'] as const) {
  const { docs } = await payload.delete({
    collection,
    overrideAccess: true,
    where: { name: { like: 'E2E' } },
  })
  payload.logger.info(`${collection} : ${docs.length} demande(s) de test supprimée(s).`)
}
process.exit(0)
