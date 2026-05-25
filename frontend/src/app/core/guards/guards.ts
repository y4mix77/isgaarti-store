import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const vendeurGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.hasRole('ROLE_VENDEUR')) {
    return true;
  }

  if (authService.hasRole('ROLE_ADMIN')) {
    return router.createUrlTree(['/admin']);
  }

  return router.createUrlTree(['/']);
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.hasRole('ROLE_ADMIN')) {
    return true;
  }

  if (authService.hasRole('ROLE_VENDEUR')) {
    return router.createUrlTree(['/vendeur']);
  }

  return router.createUrlTree(['/']);
};

export const clientGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.hasRole('ROLE_CLIENT') && !authService.hasRole('ROLE_ADMIN') && !authService.hasRole('ROLE_VENDEUR')) {
    return true;
  }

  if (authService.hasRole('ROLE_VENDEUR')) {
    return router.createUrlTree(['/vendeur']);
  }

  if (authService.hasRole('ROLE_ADMIN')) {
    return router.createUrlTree(['/admin']);
  }

  return router.createUrlTree(['/']);
};

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/']);
};
