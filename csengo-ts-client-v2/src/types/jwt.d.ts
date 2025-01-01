declare module 'csengoJwt' {
  import type { RoleEnum } from '@/types/role.enum'

  export interface JwtPayload {
    sub: string
    username: string
    hashedPassword: string
    roles: RoleEnum[]
  }
}
