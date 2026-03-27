import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Public layout routes
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: 'home',    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
      { path: 'menu',    loadComponent: () => import('./pages/menu/menu.component').then(m => m.MenuComponent) },
      { path: 'reviews', loadComponent: () => import('./pages/reviews/reviews.component').then(m => m.ReviewsComponent) },
      { path: 'cart',    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent), canActivate: [authGuard] },
      { path: 'orders',  loadComponent: () => import('./pages/orders/orders.component').then(m => m.OrdersComponent), canActivate: [authGuard] },

      // ✅ NEW — About & Contact pages
      { path: 'about',   loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) },
      { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) },
    ]
  },

  // Auth routes (guest only)
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },

  // Admin routes
  {
    path: 'admin',
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'menu',      loadComponent: () => import('./pages/admin/manage-menu/manage-menu.component').then(m => m.ManageMenuComponent) },
      { path: 'orders',    loadComponent: () => import('./pages/admin/manage-orders/manage-orders.component').then(m => m.ManageOrdersComponent) },
      { path: 'users',     loadComponent: () => import('./pages/admin/manage-users/manage-users.component').then(m => m.ManageUsersComponent) },
      { path: 'reviews',   loadComponent: () => import('./pages/admin/manage-reviews/manage-reviews.component').then(m => m.ManageReviewsComponent) },

      // ✅ NEW — Admin contact messages page
      { path: 'contacts',  loadComponent: () => import('./pages/admin/manage-contacts/manage-contacts.component').then(m => m.ManageContactsComponent) },
    ]
  },

  { path: '**', redirectTo: 'home' }
];
