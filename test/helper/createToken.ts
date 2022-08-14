import * as jwt from 'jsonwebtoken'

export function createToken(payload: any): string {
  if (typeof payload !== 'object' || !payload) return ''

  return jwt.sign(payload, process.env.PRIVATE_KEY, {
    algorithm: 'RS256',
  })
}
