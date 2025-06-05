// auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Ne pas ajouter le token pour les requêtes d'authentification
  const isAuthRequest = req.url.includes('/api/auth/login') || 
                       req.url.includes('/api/auth/register');

  let authReq = req;

  // Ajouter le token JWT si l'utilisateur est authentifié et ce n'est pas une requête d'auth
  if (!isAuthRequest && authService.isAuthenticated()) {
    const token = authService.getToken();
    if (token) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Gérer les erreurs d'authentification
      if (error.status === 401 || error.status === 403) {
        // Token expiré ou invalide
        authService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};