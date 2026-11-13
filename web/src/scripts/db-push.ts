/**
 * Synchronise le schéma de la base de dev avec la config Payload (push Drizzle), puis quitte.
 * Le serveur de dev tourne avec PAYLOAD_DB_PUSH=false : via le pooler Supabase, un push
 * à chaque recompilation prend plusieurs minutes. À lancer après une modification du modèle.
 */
import { getPayload } from 'payload'

import config from '@payload-config'

const payload = await getPayload({ config })
payload.logger.info('Schéma synchronisé.')
process.exit(0)
