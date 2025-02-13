import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [publicGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main/main.component').then((m) => m.MainComponent),
    children: [
      { path: '', redirectTo: 'cards', pathMatch: 'full' },
      {
        path: 'cards',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./cards/cards-list/cards-list.component').then(
                (m) => m.CardsListComponent
              ),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./cards/card-create/card-create.component').then(
                (m) => m.CardCreateComponent
              ),
          },
          {
            path: 'batch-create',
            loadComponent: () =>
              import(
                './cards/card-batch-create/card-batch-create.component'
              ).then((m) => m.CardBatchCreateComponent),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./cards/card-detail/card-detail.component').then(
                (m) => m.CardDetailComponent
              ),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '/auth/login' },
];
