import { AuthService } from './auth.service'
import type { AuthRepository } from './auth.service'
import { UserService } from './user.service'
import type { UserRepository } from './user.service'

export class ServiceProvider {
  private static userService: UserRepository | undefined
  private static authService: AuthRepository | undefined

  static get users(): UserRepository {
    this.userService ??= new UserService()
    return this.userService
  }

  static get auth(): AuthRepository {
    this.authService ??= new AuthService()
    return this.authService
  }
}
