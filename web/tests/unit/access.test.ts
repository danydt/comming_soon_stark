import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { hasRole, isAdmin, isAdminOrSelf, isStaff, publishedOrStaff, roleOf } from '@/access'

type User = NonNullable<PayloadRequest['user']>
const user = (role: string, id = 1) => ({ id, role, collection: 'users' }) as unknown as User
const req = (u: User | null) => ({ req: { user: u } }) as unknown as Parameters<typeof isAdmin>[0]

describe('rôles', () => {
  it('reconnaît admin et editor, ignore le reste', () => {
    expect(roleOf(user('admin'))).toBe('admin')
    expect(roleOf(user('editor'))).toBe('editor')
    expect(roleOf(user('superman'))).toBeNull()
    expect(roleOf(null)).toBeNull()
  })

  it('hasRole', () => {
    expect(hasRole(user('editor'), 'admin', 'editor')).toBe(true)
    expect(hasRole(user('editor'), 'admin')).toBe(false)
  })
})

describe('règles d’accès', () => {
  it('isAdmin : admin seulement', () => {
    expect(isAdmin(req(user('admin')))).toBe(true)
    expect(isAdmin(req(user('editor')))).toBe(false)
    expect(isAdmin(req(null))).toBe(false)
  })

  it('isStaff : admin et éditeur', () => {
    expect(isStaff(req(user('admin')))).toBe(true)
    expect(isStaff(req(user('editor')))).toBe(true)
    expect(isStaff(req(null))).toBe(false)
  })

  it('isAdminOrSelf : un éditeur ne voit que son propre compte', () => {
    expect(isAdminOrSelf(req(user('admin')))).toBe(true)
    expect(isAdminOrSelf(req(user('editor', 7)))).toEqual({ id: { equals: 7 } })
    expect(isAdminOrSelf(req(null))).toBe(false)
  })

  it('publishedOrStaff : le public ne lit que le contenu publié', () => {
    expect(publishedOrStaff(req(null))).toEqual({ _status: { equals: 'published' } })
    expect(publishedOrStaff(req(user('editor')))).toBe(true)
  })
})
