import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'

import { cn } from '@/lib/utils'

/** Texte riche de l'admin, rendu côté serveur, avec la typographie du site (`.prose-fshs`). */
export function RichText({
  data,
  className,
  dark = false,
}: {
  data: unknown
  className?: string
  dark?: boolean
}) {
  if (!data || typeof data !== 'object' || !('root' in data)) return null
  return (
    <LexicalRichText
      data={data as SerializedEditorState}
      disableContainer={false}
      className={cn('prose-fshs', dark && 'prose-fshs-dark', className)}
    />
  )
}
