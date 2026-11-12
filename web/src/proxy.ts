import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

// Next.js 16 : « proxy.ts » remplace « middleware.ts ».
export default createMiddleware(routing)

export const config = {
  // Exclut l'administration et l'API Payload, les fichiers internes de Next/Vercel et les fichiers statiques.
  matcher: '/((?!api|admin|_next|_vercel|.*\..*).*)',
}
