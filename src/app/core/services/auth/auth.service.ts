import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { API_URL } from '@core/utils/api';
import { AuthResponse, LoginRequest } from '@interfaces/auth/auth.interface';
import { ApiResponse } from '@interfaces/shared/api-response.interface';
import { UserResponse } from '@interfaces/users/user.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'auth_user';

  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${API_URL}/auth`;


  login(data: LoginRequest): Observable<ApiResponse<AuthResponse>> {

    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, data);

  }


  saveSession(data: AuthResponse): void {

    localStorage.setItem(AuthService.TOKEN_KEY, data.token);
    localStorage.setItem(AuthService.USER_KEY, JSON.stringify(data));

  }


  getToken(): string | null {

    return localStorage.getItem(AuthService.TOKEN_KEY);

  }


  debugTokenPayload(): void {
    const token = this.getToken();

    if (!token) {
      console.warn('[AuthService] No token found in storage');
      return;
    }

    try {
      const payloadPart = token.split('.')[1];
      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(normalized));
      const expDate = payload?.exp ? new Date(payload.exp * 1000).toISOString() : null;

      console.log('[AuthService] token payload', {
        sub: payload?.sub,
        rol: payload?.rol,
        iat: payload?.iat,
        exp: payload?.exp,
        expDate,
      });
    } catch (error) {
      console.error('[AuthService] token parse error', error);
    }
  }


  getUser(): UserResponse {
    const rawUser = localStorage.getItem(AuthService.USER_KEY);

    if (!rawUser) {
      return null as any;
    }

    try {
      return JSON.parse(rawUser);
    } catch {
      return null as any;
    }
  }


  updateUser(user: UserResponse): void {

    localStorage.setItem(AuthService.USER_KEY, JSON.stringify(user));

  }

  isAuthenticated(): boolean {

    return !!this.getToken();

  }


  clearSession(): void {

    localStorage.removeItem(AuthService.TOKEN_KEY);
    localStorage.removeItem(AuthService.USER_KEY);

  }

  logout(redirect = true): void {

    console.log('[AuthService] logout called', { redirect });
    this.clearSession();

    if (redirect) {
      void this.router.navigateByUrl('/');
    }

  }

}
