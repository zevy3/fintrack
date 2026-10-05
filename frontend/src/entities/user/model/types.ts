export interface User {
  id: number
  email: string
  name: string
  role: 'user' | 'admin'
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput extends LoginInput {
  name: string
}
