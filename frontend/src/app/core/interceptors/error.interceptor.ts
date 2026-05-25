import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (req.url.includes('/api/auth')) {
          authService.logout();
        } else {
          console.error('Unauthorized request to non-auth endpoint:', req.url);
          // Don't logout, just let the component handle the error
        }
      } else if (error.status === 403) {
        console.error('Forbidden access:', req.url);
        // router.navigate(['/']);
      }
      return throwError(() => error);
    })
  );
};
