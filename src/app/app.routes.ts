import { Routes } from '@angular/router';
import { authGuard, authChildGuard } from './core/guards/auth.guard';
import { adminGuard, adminChildGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/public-layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadChildren: () => import('./features/public/public.routes').then((m) => m.PUBLIC_ROUTES)
      }
    ]
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: '',
        loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
      }
    ]
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/info-layout/info-layout.component').then((m) => m.InfoLayoutComponent),
    children: [
      {
        path: '',
        loadChildren: () => import('./features/public/info.routes').then((m) => m.INFO_ROUTES)
      },
      {
        path: 'articles',
        loadChildren: () => import('./features/content/content.routes').then((m) => m.ARTICLE_ROUTES)
      },
      {
        path: 'weekly-recap',
        loadChildren: () =>
          import('./features/content/content.routes').then((m) => m.WEEKLY_RECAP_ROUTES)
      }
    ]
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadComponent: () =>
      import('./layout/user-layout/user-layout.component').then((m) => m.UserLayoutComponent),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    canActivateChild: [adminChildGuard],
    loadComponent: () =>
      import('./layout/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () =>
      import('./layout/info-layout/info-layout.component').then((m) => m.InfoLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/public/pages/not-found/not-found.component').then(
            (m) => m.NotFoundComponent
          )
      }
    ]
  }
];
