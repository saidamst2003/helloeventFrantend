// auth.guard.ts
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from './auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    // Rediriger vers la page de login en gardant l'URL de destination
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
};

// Guard pour empêcher les utilisateurs connectés d'accéder aux pages de login/register
export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  } else {
    // Rediriger vers le dashboard ou la page d'accueil
    router.navigate(['/dashboard']);
    return false;
  }
};