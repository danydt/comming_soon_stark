/**
 * Vérifie que les tables Payload (schéma `payload`) ne sont PAS exposées par l'API REST
 * auto-générée de Supabase (PostgREST). Utilise uniquement la clé publique « anon ».
 * Usage : pnpm check:supabase
 */
export {}

const url = process.env.SUPABASE_URL?.replace(/\/$/, '')
const anon = process.env.SUPABASE_ANON_KEY

if (!url || !anon) {
  console.error('SUPABASE_URL et SUPABASE_ANON_KEY sont requis (voir .env.example).')
  process.exit(1)
}

const headers = { apikey: anon, Authorization: `Bearer ${anon}` }
let ok = true

// 1. Accès direct au schéma `payload` : PostgREST doit refuser (schéma non exposé, code PGRST106).
const viaProfile = await fetch(`${url}/rest/v1/users?select=id&limit=1`, {
  headers: { ...headers, 'Accept-Profile': 'payload' },
})
const body = await viaProfile.text()
if (viaProfile.ok) {
  ok = false
  console.error(
    '✗ Le schéma « payload » est exposé par l’API REST de Supabase ! Retirez-le de Settings → API → Exposed schemas.',
  )
} else {
  console.log(
    `✓ Schéma « payload » non exposé (HTTP ${viaProfile.status} ${body.includes('PGRST106') ? 'PGRST106' : ''}).`,
  )
}

// 2. Aucune table Payload dans le schéma public.
const inPublic = await fetch(`${url}/rest/v1/users?select=id&limit=1`, { headers })
if (inPublic.ok) {
  ok = false
  console.error(
    '✗ Une table « users » est lisible dans le schéma public : vérifier schemaName dans payload.config.ts.',
  )
} else {
  console.log(`✓ Aucune table « users » lisible dans le schéma public (HTTP ${inPublic.status}).`)
}

process.exit(ok ? 0 : 1)
