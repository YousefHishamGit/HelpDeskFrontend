import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api.constants';
import { CurrentUserDto, LoginRequestDto, LoginResponseDto, RefreshTokenRequestDto, RegisterRequestDto } from '../models/auth.models';

const ACCESS_TOKEN_KEY = 'helpdesk_access_token';
const REFRESH_TOKEN_KEY = 'helpdesk_refresh_token';
const USER_KEY = 'helpdesk_user';

function stripBearer(token: string | null | undefined): string {
  if (!token) return '';
  return token.replace(/^Bearer\s+/i, '').trim();
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const raw = stripBearer(token);
    const parts = raw.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function extractUserFromToken(token: string): CurrentUserDto | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const role = (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
    payload['role'] ||
    payload['Role']) as string;

  const userId = (payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
    payload['nameid'] ||
    payload['sub'] ||
    payload['userId']) as string;

  const email = (payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
    payload['email'] ||
    payload['Email']) as string;

  if (!role || !userId) return null;

  return {
    userId: String(userId),
    email: email || '',
    role
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSignal = signal<CurrentUserDto | null>(this.getStoredUser());
  private accessTokenSignal = signal<string | null>(stripBearer(localStorage.getItem(ACCESS_TOKEN_KEY)));
  private refreshTokenSignal = signal<string | null>(stripBearer(localStorage.getItem(REFRESH_TOKEN_KEY)));

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.accessTokenSignal() && !!this.currentUserSignal());
  readonly userRole = computed(() => this.currentUserSignal()?.role ?? null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role?.toLowerCase() === 'admin');
  readonly isAgent = computed(() => this.currentUserSignal()?.role?.toLowerCase() === 'agent');
  readonly isEmployee = computed(() => this.currentUserSignal()?.role?.toLowerCase() === 'employee');

  constructor() {
    if (this.accessTokenSignal() && !this.currentUserSignal()) {
      this.fetchCurrentUser().subscribe();
    }
  }

  getAccessToken(): string | null {
    return this.accessTokenSignal();
  }

  getRefreshToken(): string | null {
    return this.refreshTokenSignal();
  }

  login(dto: LoginRequestDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(API_ENDPOINTS.auth.login, dto).pipe(
      tap(response => {
        this.saveTokens(response.accessToken, response.refreshToken);
        this.fetchCurrentUser().subscribe({
          error: () => {
            // If /me fails, we already extracted user from JWT in saveTokens
          }
        });
      })
    );
  }

  register(dto: RegisterRequestDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(API_ENDPOINTS.auth.register, dto).pipe(
      tap(response => {
        this.saveTokens(response.accessToken, response.refreshToken);
        this.fetchCurrentUser().subscribe();
      })
    );
  }

  fetchCurrentUser(): Observable<CurrentUserDto> {
    return this.http.get<CurrentUserDto>(API_ENDPOINTS.auth.me).pipe(
      tap(user => {
        this.currentUserSignal.set(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  refreshToken(): Observable<LoginResponseDto> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    const payload: RefreshTokenRequestDto = { refreshToken };
    return this.http.post<LoginResponseDto>(API_ENDPOINTS.auth.refresh, payload).pipe(
      tap(res => {
        this.saveTokens(res.accessToken, res.refreshToken);
      }),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      const payload: RefreshTokenRequestDto = { refreshToken };
      this.http.post(API_ENDPOINTS.auth.revoke, payload).pipe(
        catchError(() => of(null))
      ).subscribe();
    }

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  saveTokens(accessToken: string, refreshToken: string): void {
    const cleanAccessToken = stripBearer(accessToken);
    const cleanRefreshToken = stripBearer(refreshToken);

    localStorage.setItem(ACCESS_TOKEN_KEY, cleanAccessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, cleanRefreshToken);
    this.accessTokenSignal.set(cleanAccessToken);
    this.refreshTokenSignal.set(cleanRefreshToken);

    const extracted = extractUserFromToken(cleanAccessToken);
    if (extracted) {
      this.currentUserSignal.set(extracted);
      localStorage.setItem(USER_KEY, JSON.stringify(extracted));
    }
  }

  private getStoredUser(): CurrentUserDto | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        // Fallback to token extraction
      }
    }
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      return extractUserFromToken(token);
    }
    return null;
  }

  getDefaultRouteForRole(): string {
    const role = this.userRole()?.toLowerCase();
    switch (role) {
      case 'admin':
        return '/dashboard/admin';
      case 'agent':
        return '/dashboard/agent';
      case 'employee':
        return '/dashboard/employee';
      default:
        return '/dashboard/admin';
    }
  }
}
