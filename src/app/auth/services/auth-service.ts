import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  ValidateTokenResponse,
} from '../interfaces/register.types';

// Interfaces para tipado

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080';
  private currentUser: User | null = null;
  private token: string | null = null;
  constructor(private http: HttpClient) {}

  get getUser(): User | null {
    return this.currentUser;
  }
  get getToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    return token;
  }

  register(registerData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.API_URL}/auth/register`,
      registerData
    );
  }

  login(loginData: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.API_URL}/auth/login`,
      loginData
    );
  }

  validateToken(token: string): Observable<ValidateTokenResponse> {
    const headers = new HttpHeaders().set('token', token);
    return this.http
      .post<ValidateTokenResponse>(
        `${this.API_URL}/auth/validate`,
        {},
        { headers }
      )
      .pipe(
        tap((response) => {
          if (response.ok) {
            this.currentUser = response.user;
          } else {
            this.currentUser = null;
          }
        })
      );
  }
  logout(): void {
    this.currentUser = null;
  }
}
