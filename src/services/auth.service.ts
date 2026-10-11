import { http } from '@/api/http-client'
import type { AuthTokens, LoginDto, LoginResponse } from '@/types/auth'
import type { User } from '@/types/user'

export interface AuthRepository {
  login(data: LoginDto): Promise<LoginResponse>
  getCurrentUser(accessToken: string): Promise<User>
  refresh(refreshToken: string): Promise<AuthTokens>
}

export class AuthService implements AuthRepository {
  login(data: LoginDto): Promise<LoginResponse> {
    return http<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  getCurrentUser(accessToken: string): Promise<User> {
    return http<User>('/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }

  refresh(refreshToken: string): Promise<AuthTokens> {
    return http<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refreshToken,
      }),
    })
  }
}
