import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * Hashea una contraseña usando bcryptjs.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Compara una contraseña en texto plano con un hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
