/* eslint-disable @next/next/no-img-element -- composant de l'admin Payload, hors next/image */

/** Logo complet affiché sur la page de connexion de l'administration. */
export function Logo() {
  return (
    <img
      src="/brand/logo-full.svg"
      alt="StarkHold — Fondation Stark Hold Solutions"
      width={180}
      height={180}
      style={{ display: 'block', width: 180, height: 'auto' }}
    />
  )
}
