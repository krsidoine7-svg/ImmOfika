import { z } from 'zod'

export const PasswordPolicySchema = z
  .string()
  .min(10, 'Le mot de passe doit contenir au moins 10 caractères.')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une lettre majuscule.')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une lettre minuscule.')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre.')
  .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...).')

