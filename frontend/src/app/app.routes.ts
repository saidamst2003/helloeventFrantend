import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './services/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'register',
    loadComponent: () => import('./registration/registration').then(c => c.RegistrationComponent),
    canActivate: [noAuthGuard] // Empêcher l'accès si déjà connecté
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(c => c.LoginComponent),
    canActivate: [noAuthGuard] // Empêcher l'accès si déjà connecté
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(c => c.Dashboard),
    canActivate: [authGuard] // Protéger la route
  },
 
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];