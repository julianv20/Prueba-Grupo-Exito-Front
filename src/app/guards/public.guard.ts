import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const publicGuard = () => {
  const router = inject(Router);

  const isAuthenticated = localStorage.getItem('token') !== null;

  if (isAuthenticated) {
    router.navigate(['/cards']);
    return false;
  }

  return true;
};
