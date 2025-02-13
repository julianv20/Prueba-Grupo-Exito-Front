export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  code: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  ok: boolean;
  msg: string;
  token: string;
}

export interface ValidateTokenResponse {
  ok: boolean;
  msg?: string;
  user: User;
}

export interface LoginResponse {
  ok: boolean;
  msg: string;
  token: string;
  user: User;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
}
