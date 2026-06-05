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
  },
  {
    path: 'articles',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/admin-articles/admin-articles.component').then(
        (m) => m.AdminArticlesComponent
      )
  },
  {
    path: 'articles/:id',
    loadComponent: () =>
      import('./pages/admin-article-editor/admin-article-editor.component').then(
        (m) => m.AdminArticleEditorComponent
      )
  },
  {
    path: 'weekly-recap',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/admin-weekly-recap/admin-weekly-recap.component').then(
        (m) => m.AdminWeeklyRecapComponent
      )
  },
  {
    path: 'weekly-recap/:id',
    loadComponent: () =>
      import('./pages/admin-weekly-recap-review/admin-weekly-recap-review.component').then(
        (m) => m.AdminWeeklyRecapReviewComponent
      )
  }
];
