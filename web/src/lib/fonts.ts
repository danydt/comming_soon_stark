import { Inter, Josefin_Sans, Roboto_Slab } from 'next/font/google'

// next/font télécharge les polices au build et les sert depuis le site (aucun appel à Google côté visiteur).
export const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['800', '900'],
  variable: '--font-roboto-slab',
  display: 'swap',
})

export const josefinSans = Josefin_Sans({
  subsets: ['latin'],
  weight: ['300'],
  variable: '--font-josefin-sans',
  display: 'swap',
})

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const fontVariables = [robotoSlab.variable, josefinSans.variable, inter.variable].join(' ')
