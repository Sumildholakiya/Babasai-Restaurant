import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MenuService } from '../../core/services/menu.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { MenuItem, MenuFilterParams } from '../../models';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container py-10">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="section-title text-3xl">Our Menu</h1>
        <p class="text-gray-500">Explore our delicious selection of authentic Indian dishes</p>
      </div>

      <!-- Filters Bar -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="relative md:col-span-1">
            <input
              type="text"
              [(ngModel)]="filters.search"
              (ngModelChange)="onFilterChange()"
              placeholder="Search dishes..."
              class="input-field pl-10 text-sm"
            >
            <span class="absolute left-3 top-3.5 text-gray-400">🔍</span>
          </div>

          <!-- Category -->
          <select [(ngModel)]="filters.category" (ngModelChange)="onFilterChange()" class="input-field text-sm">
            @for (cat of categories(); track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>

          <!-- Min Price -->
          <div class="relative">
            <input
              type="number"
              [(ngModel)]="filters.minPrice"
              (ngModelChange)="onFilterChange()"
              placeholder="Min price (₹)"
              class="input-field text-sm pl-8"
              min="0"
            >
            <span class="absolute left-3 top-3.5 text-gray-400 text-sm">₹</span>
          </div>

          <!-- Max Price -->
          <div class="flex gap-2">
            <div class="relative flex-1">
              <input
                type="number"
                [(ngModel)]="filters.maxPrice"
                (ngModelChange)="onFilterChange()"
                placeholder="Max price (₹)"
                class="input-field text-sm pl-8"
                min="0"
              >
              <span class="absolute left-3 top-3.5 text-gray-400 text-sm">₹</span>
            </div>
            <button (click)="resetFilters()" title="Reset filters"
              class="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors text-sm">
              ✕
            </button>
          </div>
        </div>

        <!-- Active category pills -->
        <div class="flex flex-wrap gap-2 mt-4">
          @for (cat of categories(); track cat) {
            <button
              (click)="selectCategory(cat)"
              class="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
              [class]="filters.category === cat ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-500'"
            >
              {{ cat }}
            </button>
          }
        </div>
      </div>

      <!-- Results count -->
      @if (!loading()) {
        <p class="text-sm text-gray-500 mb-6">
          Showing <span class="font-semibold text-gray-700">{{ menuItems().length }}</span> dishes
          @if (filters.category && filters.category !== 'All') {
            in <span class="text-orange-500 font-medium">{{ filters.category }}</span>
          }
        </p>
      }

      <!-- Loading Skeleton -->
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (s of [1,2,3,4,5,6,7,8]; track s) {
            <div class="card animate-pulse">
              <div class="h-44 bg-gray-200"></div>
              <div class="p-4 space-y-2">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded"></div>
                <div class="h-8 bg-gray-200 rounded mt-3"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Menu Grid -->
      @if (!loading() && menuItems().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (item of menuItems(); track item._id) {
            <div class="card group animate-slide-up">
              <!-- Image -->
              <div class="relative overflow-hidden h-44">
                <img [src]="item.image" [alt]="item.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'">
                <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span class="absolute top-2 left-2 bg-white/90 text-orange-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {{ item.category }}
                </span>
                @if (!item.isAvailable) {
                  <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span class="text-white font-semibold text-sm bg-red-500 px-3 py-1 rounded-full">Unavailable</span>
                  </div>
                }
              </div>

              <!-- Info -->
              <div class="p-4">
                <div class="flex items-start justify-between mb-1">
                  <h3 class="font-semibold text-gray-800 text-sm group-hover:text-orange-500 transition-colors leading-tight">
                    {{ item.name }}
                  </h3>
                  <span class="text-orange-500 font-bold text-sm ml-2 whitespace-nowrap">₹{{ item.price }}</span>
                </div>
                <p class="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed">{{ item.description }}</p>

                @if (auth.isLoggedIn() && !auth.isAdmin()) {
                  <button
                    (click)="addToCart(item)"
                    [disabled]="!item.isAvailable || addingId() === item._id"
                    class="btn-primary w-full text-sm py-2"
                  >
                    @if (addingId() === item._id) {
                      <span class="flex items-center justify-center gap-2">
                        <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Adding...
                      </span>
                    } @else {
                      🛒 Add to Cart
                    }
                  </button>
                } @else if (!auth.isLoggedIn()) {
                  <a routerLink="/login" class="btn-primary w-full text-sm py-2 block text-center">
                    Login to Order
                  </a>
                } @else {
                  <div class="h-9 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-xs border border-dashed border-gray-200">
                    Admin View
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty state -->
      @if (!loading() && menuItems().length === 0) {
        <div class="text-center py-16">
          <div class="text-5xl mb-4">🍽</div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">No dishes found</h3>
          <p class="text-gray-400 mb-6">Try adjusting your filters or search terms</p>
          <button (click)="resetFilters()" class="btn-primary">Clear Filters</button>
        </div>
      }
    </div>
  `
})
export class MenuComponent implements OnInit {
  menuService = inject(MenuService);
  cartService = inject(CartService);
  auth = inject(AuthService);
  toastService = inject(ToastService);

  menuItems = signal<MenuItem[]>([]);
  categories = signal<string[]>(['All']);
  loading = signal(true);
  addingId = signal<string | null>(null);

  filters: MenuFilterParams = { category: 'All', search: '', minPrice: undefined, maxPrice: undefined };

  ngOnInit(): void {
    this.loadCategories();
    this.loadMenu();
  }

  loadCategories(): void {
    this.menuService.getCategories().subscribe({
      next: (res) => this.categories.set(res.categories)
    });
  }

  loadMenu(): void {
    this.loading.set(true);
    this.menuService.getMenuItems(this.filters).subscribe({
      next: (res) => { this.menuItems.set(res.items); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange(): void {
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => this.loadMenu(), 400);
  }

  private debounce: any;

  selectCategory(cat: string): void {
    this.filters.category = cat;
    this.loadMenu();
  }

  resetFilters(): void {
    this.filters = { category: 'All', search: '', minPrice: undefined, maxPrice: undefined };
    this.loadMenu();
  }

  addToCart(item: MenuItem): void {
    this.addingId.set(item._id);
    this.cartService.addToCart(item._id).subscribe({
      next: () => {
        this.addingId.set(null);
        this.toastService.success(`${item.name} added to cart!`);
      },
      error: (err) => {
        this.addingId.set(null);
        this.toastService.error(err.error?.message || 'Failed to add item.');
      }
    });
  }
}
