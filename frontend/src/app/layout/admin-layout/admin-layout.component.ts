import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="min-h-screen flex bg-gray-100">

      <!-- ===== Sidebar ===== -->
      <aside class="w-64 bg-gray-900 text-white flex flex-col fixed inset-y-0 left-0 z-40">

        <!-- Logo -->
        <div class="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <div class="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-lg">🍽</div>
          <div>
            <span class="font-bold text-white block leading-tight">BabaSai</span>
            <span class="text-orange-400 text-xs">Admin Panel</span>
          </div>
        </div>

        <!-- Nav links -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <a routerLink="/admin/dashboard" routerLinkActive="bg-orange-500 text-white"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all text-sm font-medium">
            <span class="text-lg">📊</span> Dashboard
          </a>
          <a routerLink="/admin/menu" routerLinkActive="bg-orange-500 text-white"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all text-sm font-medium">
            <span class="text-lg">🍛</span> Menu Items
          </a>
          <a routerLink="/admin/orders" routerLinkActive="bg-orange-500 text-white"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all text-sm font-medium">
            <span class="text-lg">📦</span> Orders
          </a>
          <a routerLink="/admin/users" routerLinkActive="bg-orange-500 text-white"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all text-sm font-medium">
            <span class="text-lg">👥</span> Users
          </a>
          <a routerLink="/admin/reviews" routerLinkActive="bg-orange-500 text-white"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all text-sm font-medium">
            <span class="text-lg">⭐</span> Reviews
          </a>

          <!-- ✅ NEW — Contact Messages with unread badge -->
          <a routerLink="/admin/contacts" routerLinkActive="bg-orange-500 text-white"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all text-sm font-medium">
            <span class="text-lg">✉️</span>
            <span class="flex-1">Messages</span>
            @if (unreadCount() > 0) {
              <span class="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {{ unreadCount() }}
              </span>
            }
          </a>
        </nav>

        <!-- Bottom actions -->
        <div class="px-3 py-4 border-t border-gray-800 space-y-1">
          <a routerLink="/home"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all text-sm">
            <span>🏠</span> View Site
          </a>
          <button (click)="logout()"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all text-sm">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <!-- ===== Main content ===== -->
      <div class="flex-1 ml-64 flex flex-col min-h-screen">
        <!-- Top bar -->
        <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 class="text-gray-800 font-semibold">Welcome, {{ auth.user()?.name }}</h1>
          <div class="flex items-center gap-3">
            @if (unreadCount() > 0) {
              <a routerLink="/admin/contacts"
                class="flex items-center gap-1.5 text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-full font-medium hover:bg-red-100 transition-colors">
                ✉️ {{ unreadCount() }} unread message{{ unreadCount() > 1 ? 's' : '' }}
              </a>
            }
            <span class="text-sm text-gray-500 bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-medium">Admin</span>
          </div>
        </header>

        <!-- Page content -->
        <main class="flex-1 p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent implements OnInit {
  auth           = inject(AuthService);
  contactService = inject(ContactService);

  unreadCount = signal(0);

  ngOnInit(): void {
    // Poll unread contact count every 60 seconds
    this.fetchUnreadCount();
    setInterval(() => this.fetchUnreadCount(), 60000);
  }

  fetchUnreadCount(): void {
    this.contactService.getAllContacts('Unread').subscribe({
      next: (res) => this.unreadCount.set(res.count || 0),
      error: () => {}
    });
  }

  logout(): void { this.auth.logout(); }
}
