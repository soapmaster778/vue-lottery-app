import type { UserGender } from './user'

export interface LoginDto {
  username: string
  password: string
}

export interface AuthUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: UserGender
  image: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse extends AuthUser, AuthTokens {}
