import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../auth/services/auth-service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = localStorage.getItem('token');

  // Si no hay token, redirige a login
  if (!token) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Valida el token con el backend
  return authService.validateToken(token).pipe(
    map((response) => {
      console.log('response', response);
      if (response.ok) {
        return true;
      } else {
        router.navigate(['/auth/login']);
        localStorage.clear();
        router.navigate(['/auth/login']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/auth/login']);
      localStorage.clear();
      router.navigate(['/auth/login']);
      return of(false);
    })
  );
};
