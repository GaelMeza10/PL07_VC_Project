import { jwtVerify, SignJWT } from 'jose'
import bcrypt from 'bcryptjs'

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret'
const key = new TextEncoder().encode(SECRET_KEY)

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash)
}

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key)
    return payload
  } catch (error) {
    return null
  }
}

export function getUserFromToken(token: string) {
    return verifyToken(token)
}
