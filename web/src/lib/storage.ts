import type { Plugin } from 'payload'
import { s3Storage } from '@payloadcms/storage-s3'

import { readEnv, requireEnv } from './env'

/**
 * Supabase Storage via son API compatible S3.
 * - Endpoint : https://<ref>.storage.supabase.co/storage/v1/s3, avec `forcePathStyle: true`.
 * - Bucket public `media` : les fichiers sont servis directement par Supabase (URL publique),
 *   sans repasser par Payload (`disablePayloadAccessControl`), puis optimisés par next/image.
 * Sans S3_ENDPOINT, en développement uniquement, Payload écrit les fichiers dans `web/media/`.
 */
export function storagePlugins(): Plugin[] {
  const endpoint = readEnv('S3_ENDPOINT')
  if (!endpoint) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'S3_ENDPOINT manquant : le stockage S3 (Supabase) est obligatoire en production.',
      )
    }
    return []
  }

  const bucket = readEnv('S3_BUCKET') ?? 'media'
  const publicBase = publicMediaBaseURL()

  return [
    s3Storage({
      bucket,
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) =>
            `${publicBase}/${[prefix, filename].filter(Boolean).join('/')}`,
        },
      },
      config: {
        endpoint,
        region: requireEnv('S3_REGION'),
        forcePathStyle: true,
        credentials: {
          accessKeyId: requireEnv('S3_ACCESS_KEY_ID'),
          secretAccessKey: requireEnv('S3_SECRET_ACCESS_KEY'),
        },
      },
    }),
  ]
}

/** https://<ref>.supabase.co/storage/v1/object/public/<bucket> */
export function publicMediaBaseURL(): string {
  const explicit = readEnv('S3_PUBLIC_URL')
  if (explicit) return explicit.replace(/\/$/, '')
  const supabaseURL = requireEnv('SUPABASE_URL').replace(/\/$/, '')
  return `${supabaseURL}/storage/v1/object/public/${readEnv('S3_BUCKET') ?? 'media'}`
}
