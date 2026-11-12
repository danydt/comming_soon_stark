import type { Access, FieldAccess, PayloadRequest } from 'payload'

export const ROLES = ['admin', 'editor'] as const
export type Role = (typeof ROLES)[number]

type MaybeUser = PayloadRequest['user']

/** Rôle de l'utilisateur connecté (collection `users` uniquement). */
export function roleOf(user: MaybeUser): Role | null {
  if (!user || user.collection !== 'users') return null
  const role = (user as { role?: unknown }).role
  return ROLES.includes(role as Role) ? (role as Role) : null
}

export const hasRole = (user: MaybeUser, ...roles: Role[]): boolean => {
  const role = roleOf(user)
  return role !== null && roles.includes(role)
}

/** Administrateur uniquement. */
export const isAdmin: Access = ({ req }) => hasRole(req.user, 'admin')
export const isAdminField: FieldAccess = ({ req }) => hasRole(req.user, 'admin')

/** Administrateur ou éditeur (écriture du contenu). */
export const isStaff: Access = ({ req }) => hasRole(req.user, 'admin', 'editor')

/** Administrateur, ou l'utilisateur lui-même. */
export const isAdminOrSelf: Access = ({ req }) => {
  if (hasRole(req.user, 'admin')) return true
  if (!req.user) return false
  return { id: { equals: req.user.id } }
}

/** Lecture publique. */
export const anyone: Access = () => true

/**
 * Contenu publié pour le public, tout pour l'équipe.
 * À utiliser sur les collections avec brouillons (phase 2).
 */
export const publishedOrStaff: Access = ({ req }) => {
  if (hasRole(req.user, 'admin', 'editor')) return true
  return { _status: { equals: 'published' } }
}

/**
 * Montant d'un projet : visible du public seulement si « Afficher le montant » est coché.
 * L'équipe le voit toujours. Appliqué au niveau du champ : l'API publique ne renvoie rien sinon.
 */
export const amountVisible: FieldAccess = ({ req, doc }) => {
  if (hasRole(req.user, 'admin', 'editor')) return true
  const amount = (doc as { amount?: { display?: unknown } } | undefined)?.amount
  return amount?.display === true
}
