import type { CollectionConfig } from 'payload'

import { hasRole, isAdmin, isAdminField, isAdminOrSelf, ROLES } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Utilisateur', plural: 'Utilisateurs' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Administration',
  },
  auth: {
    // Limite de tentatives de connexion (brief, phase 5) : 5 essais puis blocage 15 min.
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    tokenExpiration: 8 * 60 * 60,
  },
  access: {
    // Accès à l'administration : admin et éditeurs.
    admin: ({ req }) => hasRole(req.user, 'admin', 'editor'),
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
    unlock: isAdmin,
  },
  fields: [
    {
      name: 'name',
      label: 'Nom complet',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      label: 'Rôle',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: ROLES.map((value) => ({
        value,
        label: value === 'admin' ? 'Administrateur' : 'Éditeur',
      })),
      access: {
        // Un éditeur ne peut pas modifier son propre rôle.
        create: isAdminField,
        update: isAdminField,
      },
      admin: {
        description:
          'Administrateur : gère les utilisateurs et les réglages. Éditeur : crée et publie le contenu.',
      },
    },
  ],
  timestamps: true,
}
