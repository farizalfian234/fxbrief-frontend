import { Routes } from '@angular/router';

export const ARTICLE_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/article-list/article-list.component').then((m) => m.ArticleListComponent)
  },
  {
    path: ':slug',
    loadComponent: () =>
      import('./pages/article-detail/article-detail.component').then(
        (m) => m.ArticleDetailComponent
      )
  }
];

export const WEEKLY_RECAP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/weekly-recap-list/weekly-recap-list.component').then(
        (m) => m.WeeklyRecapListComponent
      )
  },
  {
    path: ':slug',
    loadComponent: () =>
      import('./pages/weekly-recap-detail/weekly-recap-detail.component').then(
        (m) => m.WeeklyRecapDetailComponent
      )
  }
];
