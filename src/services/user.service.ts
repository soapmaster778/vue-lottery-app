import { http } from '@/api/http-client'
import type {
  CreateUserDto,
  DeleteUserResponse,
  UpdateUserDto,
  User,
  UsersResponse,
} from '@/types/user'
import type { Creatable, Deletable, Editable, ListParams, Readable } from './interfaces'

export interface UserRepository
  extends
    Readable<User, UsersResponse>,
    Creatable<User, CreateUserDto>,
    Editable<User, UpdateUserDto>,
    Deletable<User> {
  search(query: string, params?: ListParams): Promise<UsersResponse>
}

function createListQuery({ limit = 10, skip = 0 }: ListParams = {}): URLSearchParams {
  return new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
  })
}

export class UserService implements UserRepository {
  getAll(params: ListParams = {}): Promise<UsersResponse> {
    const query = createListQuery(params)

    return http<UsersResponse>(`/users?${query}`, {
      signal: params.signal,
    })
  }

  search(searchQuery: string, params: ListParams = {}): Promise<UsersResponse> {
    const query = createListQuery(params)
    query.set('q', searchQuery)

    return http<UsersResponse>(`/users/search?${query}`, {
      signal: params.signal,
    })
  }

  getById(id: number): Promise<User> {
    return http<User>(`/users/${id}`)
  }

  create(data: CreateUserDto): Promise<User> {
    return http<User>('/users/add', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  update(id: number, data: UpdateUserDto): Promise<User> {
    return http<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  delete(id: number): Promise<DeleteUserResponse> {
    return http<DeleteUserResponse>(`/users/${id}`, {
      method: 'DELETE',
    })
  }
}
