import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { fr } from '@payloadcms/translations/languages/fr'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { emailAdapter } from './lib/email'
import { databaseURI, readEnv, requireEnv, serverURL } from './lib/env'
import { storagePlugins } from './lib/storage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: serverURL(),
  secret: requireEnv('PAYLOAD_SECRET', 'dev-secret-a-remplacer'),

  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' — Administration FSHS',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/icon.svg' }],
    },
    components: {
      graphics: {
        Logo: '@/components/admin/Logo#Logo',
        Icon: '@/components/admin/Icon#Icon',
      },
    },
  },

  // Interface d'administration en français uniquement.
  i18n: {
    supportedLanguages: { fr },
    fallbackLanguage: 'fr',
  },

  // Contenu localisé au niveau des champs : FR par défaut, repli sur le FR si la traduction manque.
  localization: {
    locales: [
      { code: 'fr', label: 'Français' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'fr',
    fallback: true,
  },

  collections: [Users, Media],
  editor: lexicalEditor(),

  db: postgresAdapter({
    pool: {
      connectionString: databaseURI(),
      // Peu de connexions par instance serverless : c'est le pooler Supavisor qui mutualise.
      max: Number(readEnv('DATABASE_POOL_MAX') ?? 3),
    },
    // Tables Payload hors du schéma `public`, que l'API REST de Supabase (PostgREST) expose.
    schemaName: 'payload',
    // `push` (synchronisation automatique du schéma) : développement uniquement.
    // Désactivable avec PAYLOAD_DB_PUSH=false. En production : migrations versionnées.
    push: process.env.NODE_ENV === 'development' && readEnv('PAYLOAD_DB_PUSH') !== 'false',
    migrationDir: path.resolve(dirname, 'migrations'),
  }),

  email: emailAdapter(),
  sharp,
  plugins: [...storagePlugins()],

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
    disablePlaygroundInProduction: true,
  },
})
