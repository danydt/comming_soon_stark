import { execSync } from 'node:child_process'

/** Nettoie les demandes créées par les tests des formulaires. */
export default function globalTeardown() {
  execSync('pnpm e2e:cleanup', { stdio: 'inherit' })
}
