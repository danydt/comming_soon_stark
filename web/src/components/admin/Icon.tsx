/* eslint-disable @next/next/no-img-element -- composant de l'admin Payload, hors next/image */

/** Symbole « S » affiché dans la barre de navigation de l'administration. */
export function Icon() {
  return (
    <img
      src="/brand/logo-mark.svg"
      alt="StarkHold"
      width={18}
      height={27}
      style={{ display: 'block', height: 27, width: 'auto' }}
    />
  )
}
