import { http } from '@/api/http-client'
import type { AuthTokens, LoginDto, LoginResponse } from '@/types/auth'
import type { User } from '@/types/user'

export interface AuthRepository {
  login(data: LoginDto): Promise<LoginResponse>
  getCurrentUser(): Promise<User>
  refresh(refreshToken: string): Promise<AuthTokens>
}

export class AuthService implements AuthRepository {
  login(data: LoginDto): Promise<LoginResponse> {
    return http<LoginResponse>('/auth/login', {
      method: 'POST',
      skipAuthRefresh: true,
      body: JSON.stringify(data),
    })
  }

  getCurrentUser(): Promise<User> {
    return http<User>('/auth/me', {
      auth: true,
    })
  }

  refresh(refreshToken: string): Promise<AuthTokens> {
    return http<AuthTokens>('/auth/refresh', {
      method: 'POST',
      skipAuthRefresh: true,
      body: JSON.stringify({
        refreshToken,
      }),
    })
  }
}
