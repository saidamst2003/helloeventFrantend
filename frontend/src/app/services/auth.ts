import { Injectable, inject, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  message?: string;
}

export interface RegistrationResponse {
  id?: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/auth';

  private platformId: Object;
  private currentUserSubject = new BehaviorSubject<string | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.platformId = platformId;

    // Vérifier si un token existe dans le localStorage au démarrage (uniquement si on est dans le navigateur)
    if (isPlatformBrowser(this.platformId)) {
      const token = this.getToken();
      if (token && !this.isTokenExpired(token)) {
        const username = this.getUsernameFromToken(token);
        this.currentUserSubject.next(username);
      }
    }
  }

  register(user: User): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${this.API_URL}/register`, user);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token && isPlatformBrowser(this.platformId)) {
            this.setToken(response.token);
            this.currentUserSubject.next(response.username);
          }
        })
      );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false; // Si pas dans navigateur, on dit que l'utilisateur n'est pas connecté
    }
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
    }
  }

  getCurrentUsername(): string | null {
    return this.currentUserSubject.value;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() > expiry;
    } catch (e) {
      return true;
    }
  }

  private getUsernameFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch (e) {
      return null;
    }
  }

  refreshToken(): Observable<AuthResponse> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, {}, { headers })
      .pipe(
        tap(response => {
          if (response.token && isPlatformBrowser(this.platformId)) {
            this.setToken(response.token);
            this.currentUserSubject.next(response.username);
          }
        })
      );
  }
}
