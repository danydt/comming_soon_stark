import { Container } from './primitives'

/** En-tête simple des pages de liste et de détail (titre h1 sur fond chaud). */
export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string | null
  title: string
  intro?: string | null
  children?: React.ReactNode
}) {
  return (
    <div className="bg-surface-warm">
      <Container className="py-10 sm:py-14">
        <div className="max-w-3xl">
          {eyebrow && <p className="eyebrow mb-3 text-[0.8125rem] sm:text-sm">{eyebrow}</p>}
          <h1 className="text-[clamp(1.875rem,6vw,3rem)] tracking-[-0.01em]">{title}</h1>
          {intro && (
            <p className="mt-4 text-[1.0625rem] text-pretty text-[#333] sm:text-lg">{intro}</p>
          )}
        </div>
        {children}
      </Container>
    </div>
  )
}
