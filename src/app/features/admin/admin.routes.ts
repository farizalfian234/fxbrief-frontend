import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      )
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/admin-users/admin-users.component').then((m) => m.AdminUsersComponent)
  },
  {
    path: 'usage',
    loadComponent: () =>
      import('./pages/admin-usage/admin-usage.component').then((m) => m.AdminUsageComponent)
  },
  {
    path: 'feedback',
    loadComponent: () =>
      import('./pages/admin-feedback/admin-feedback.component').then(
        (m) => m.AdminFeedbackComponent
      )
  }
];
