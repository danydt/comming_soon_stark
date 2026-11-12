import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

// Composant shadcn/ui « Button », adapté à la charte (boutons arrondis, rouge en accent, cible ≥ 44 px).
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2.5 rounded-full font-semibold whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'border-2 border-brand-red bg-brand-red text-white hover:border-brand-red-deep hover:bg-brand-red-deep',
        outline: 'border-2 border-line bg-surface text-brand-black hover:border-brand-black',
        ghost: 'text-brand-black hover:bg-surface-warm',
      },
      size: {
        default: 'min-h-12 px-5 py-3 text-base',
        sm: 'min-h-11 px-4 py-2 text-sm',
        icon: 'size-12',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export { buttonVariants }
