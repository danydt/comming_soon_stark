/**
 * Variables d'environnement côté serveur. Ne jamais importer ce fichier dans un composant client.
 * La liste complète et commentée est dans `.env.example`.
 */

/** Lit une variable (chaîne vide = absente). */
export function readEnv(name: string): string | undefined {
  const value = process.env[name]
  return value === undefined || value.trim() === '' ? undefined : value.trim()
}

/** Lit une variable obligatoire. En production, une absence fait échouer le démarrage. */
export function requireEnv(name: string, devFallback?: string): string {
  const value = readEnv(name)
  if (value) return value
  if (process.env.NODE_ENV !== 'production' && devFallback !== undefined) return devFallback
  throw new Error(`Variable d'environnement manquante : ${name} (voir web/.env.example)`)
}

/** URL publique du site, sans « / » final. */
export function serverURL(): string {
  return (readEnv('NEXT_PUBLIC_SERVER_URL') ?? 'http://localhost:3000').replace(/\/$/, '')
}

/**
 * Chaîne de connexion Postgres.
 * - Exécution (Vercel, serverless) : pooler Supavisor en mode transaction, port 6543 → DATABASE_URI.
 * - Migrations (`pnpm migrate:prod`) : pooler en mode session, port 5432 → DATABASE_URI_MIGRATIONS.
 */
export function databaseURI(): string {
  if (process.env.PAYLOAD_MIGRATING === '1') {
    return readEnv('DATABASE_URI_MIGRATIONS') ?? requireEnv('DATABASE_URI')
  }
  return requireEnv('DATABASE_URI', '')
}
