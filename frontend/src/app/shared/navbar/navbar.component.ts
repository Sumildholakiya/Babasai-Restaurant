import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div class="page-container">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <a routerLink="/home" class="flex items-center gap-2 group">
            <div class="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white text-lg font-bold group-hover:bg-orange-600 transition-colors">🍽</div>
            <div>
              <span class="font-bold text-gray-900 text-lg leading-none block">BabaSai</span>
              <span class="text-orange-500 text-xs font-medium">Restaurant</span>
            </div>
          </a>

          <!-- Desktop Nav -->
          <div class="hidden md:flex items-center gap-6">
            <a routerLink="/home"    routerLinkActive="nav-link-active" class="nav-link">Home</a>
            <a routerLink="/menu"    routerLinkActive="nav-link-active" class="nav-link">Menu</a>
            <a routerLink="/about"   routerLinkActive="nav-link-active" class="nav-link">About Us</a>   <!-- ✅ NEW -->
            <a routerLink="/contact" routerLinkActive="nav-link-active" class="nav-link">Contact</a>    <!-- ✅ NEW -->
            <a routerLink="/reviews" routerLinkActive="nav-link-active" class="nav-link">Reviews</a>
            @if (auth.isLoggedIn()) {
              <a routerLink="/orders" routerLinkActive="nav-link-active" class="nav-link">My Orders</a>
            }
          </div>

          <!-- Right actions -->
          <div class="flex items-center gap-3">
            @if (auth.isLoggedIn()) {
              <!-- Cart -->
              <a routerLink="/cart" class="relative p-2 text-gray-600 hover:text-orange-500 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                @if (cartCount() > 0) {
                  <span class="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {{ cartCount() }}
                  </span>
                }
              </a>

              <!-- User dropdown -->
              <div class="relative" (click)="toggleDropdown()">
                <button class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">
                    {{ auth.user()?.name?.[0]?.toUpperCase() }}
                  </div>
                  <span class="hidden md:block text-sm font-medium text-gray-700">{{ auth.user()?.name }}</span>
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                @if (dropdownOpen) {
                  <div class="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-fade-in">
                    @if (auth.isAdmin()) {
                      <a routerLink="/admin/dashboard" class="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                        <span>⚙️</span> Admin Panel
                      </a>
                      <div class="border-t border-gray-100 my-1"></div>
                    }
                    <button (click)="logout()" class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <span>🚪</span> Logout
                    </button>
                  </div>
                }
              </div>
            } @else {
              <a routerLink="/login"    class="btn-secondary text-sm px-4 py-2">Login</a>
              <a routerLink="/register" class="btn-primary  text-sm px-4 py-2">Register</a>
            }
          </div>
        </div>

        <!-- Mobile Nav -->
        <div class="md:hidden flex flex-wrap gap-4 pb-3 text-sm">
          <a routerLink="/home"    routerLinkActive="text-orange-500 font-semibold" class="text-gray-600">Home</a>
          <a routerLink="/menu"    routerLinkActive="text-orange-500 font-semibold" class="text-gray-600">Menu</a>
          <a routerLink="/about"   routerLinkActive="text-orange-500 font-semibold" class="text-gray-600">About</a>   <!-- ✅ NEW -->
          <a routerLink="/contact" routerLinkActive="text-orange-500 font-semibold" class="text-gray-600">Contact</a> <!-- ✅ NEW -->
          <a routerLink="/reviews" routerLinkActive="text-orange-500 font-semibold" class="text-gray-600">Reviews</a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/orders" routerLinkActive="text-orange-500 font-semibold" class="text-gray-600">Orders</a>
          }
        </div>
      </div>
    </nav>

    <!-- Backdrop for dropdown -->
    @if (dropdownOpen) {
      <div class="fixed inset-0 z-30" (click)="dropdownOpen = false"></div>
    }
  `
})
export class NavbarComponent implements OnInit {
  auth = inject(AuthService);
  cartService = inject(CartService);
  cartCount = this.cartService.cartItemCount;
  dropdownOpen = false;

  ngOnInit(): void {
    if (this.auth.isLoggedIn() && !this.auth.isAdmin()) {
      this.cartService.getCart().subscribe();
    }
  }

  toggleDropdown(): void { this.dropdownOpen = !this.dropdownOpen; }

  logout(): void {
    this.dropdownOpen = false;
    this.auth.logout();
  }
}
