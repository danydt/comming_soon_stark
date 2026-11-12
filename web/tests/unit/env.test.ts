import { afterEach, describe, expect, it, vi } from 'vitest'

import { databaseURI, readEnv } from '@/lib/env'

afterEach(() => vi.unstubAllEnvs())

describe('variables d’environnement', () => {
  it('une chaîne vide vaut « absente »', () => {
    vi.stubEnv('X_TEST', '  ')
    expect(readEnv('X_TEST')).toBeUndefined()
  })

  it('exécution : pooler transaction (DATABASE_URI)', () => {
    vi.stubEnv('DATABASE_URI', 'postgresql://run:6543/postgres')
    vi.stubEnv('DATABASE_URI_MIGRATIONS', 'postgresql://mig:5432/postgres')
    vi.stubEnv('PAYLOAD_MIGRATING', '')
    expect(databaseURI()).toContain(':6543')
  })

  it('migrations : pooler session (DATABASE_URI_MIGRATIONS)', () => {
    vi.stubEnv('DATABASE_URI', 'postgresql://run:6543/postgres')
    vi.stubEnv('DATABASE_URI_MIGRATIONS', 'postgresql://mig:5432/postgres')
    vi.stubEnv('PAYLOAD_MIGRATING', '1')
    expect(databaseURI()).toContain(':5432')
  })
})
