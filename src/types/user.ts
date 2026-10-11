export type UserGender = 'male' | 'female' | 'other'

export interface Coordinates {
  lat: number
  lng: number
}

export interface UserAddress {
  address: string
  city: string
  state: string
  stateCode: string
  postalCode: string
  country: string
  coordinates: Coordinates
}

export interface UserBank {
  cardExpire: string
  cardNumber: string
  cardType: string
  currency: string
  iban: string
}

export interface UserCompany {
  department: string
  name: string
  title: string
  address: UserAddress
}

export interface UserCrypto {
  coin: string
  wallet: string
  network: string
}

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  username: string
  password: string
  age: number
  gender: UserGender
  phone: string

  maidenName?: string
  birthDate?: string
  image?: string
  bloodGroup?: string
  height?: number
  weight?: number
  eyeColor?: string

  hair?: {
    color: string
    type: string
  }

  ip?: string
  address?: UserAddress
  macAddress?: string
  university?: string
  bank?: UserBank
  company?: UserCompany
  ein?: string
  ssn?: string
  userAgent?: string
  crypto?: UserCrypto
  role?: 'admin' | 'moderator' | 'user'
}

export type CreateUserDto = Pick<
  User,
  'firstName' | 'lastName' | 'email' | 'username' | 'password' | 'age' | 'gender' | 'phone'
>

export type UpdateUserDto = Partial<CreateUserDto>

export interface UsersResponse {
  users: User[]
  total: number
  skip: number
  limit: number
}

export interface DeleteUserResponse extends User {
  isDeleted: boolean
  deletedOn: string
}
