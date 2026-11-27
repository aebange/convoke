import {computed, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {environment} from '../../environments/environment';

export interface LoginResponse {
  token: string;
  groupId: number;
  groupName: string;
}

export interface JwtClaims {
  sub?: string;
  groupId?: number;
  groupName?: string;
  iat?: number;
  exp?: number;
}

const TOKEN_KEY = 'convoke.jwt';

function decodeToken(token: string | null): JwtClaims | null {
  if (!token) {
    return null;
  }

  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, '=');
    const decoded = decodeURIComponent(
      atob(padded)
        .split('')
        .map(char => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(decoded) as JwtClaims;
  } catch {
    return null;
  }
}

function isExpired(claims: JwtClaims | null): boolean {
  return claims === null || typeof claims.exp !== 'number' || claims.exp * 1000 <= Date.now();
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly tokenSignal = signal<string | null>(null);

  public readonly token = this.tokenSignal.asReadonly();

  public readonly claims = computed<JwtClaims | null>(() => decodeToken(this.tokenSignal()));

  public readonly isAuthenticated = computed<boolean>(() => {
    const claims = this.claims();
    return claims !== null && !isExpired(claims);
  });

  public readonly groupId = computed<number | null>(() => {
    const claims = this.claims();
    return claims && typeof claims.groupId === 'number' ? claims.groupId : null;
  });

  public constructor(private http: HttpClient) {
    this.hydrateFromStorage();
  }

  public login(groupName: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.baseUrl}/api/auth/login`, {groupName, password})
      .pipe(
        tap((response: LoginResponse) => {
          localStorage.setItem(TOKEN_KEY, response.token);
          this.tokenSignal.set(response.token);
        })
      );
  }

  public logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.tokenSignal.set(null);
  }

  public getToken(): string | null {
    return this.tokenSignal();
  }

  private hydrateFromStorage(): void {
    const stored = localStorage.getItem(TOKEN_KEY);

    if (!stored) {
      return;
    }

    if (isExpired(decodeToken(stored))) {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }

    this.tokenSignal.set(stored);
  }
}
