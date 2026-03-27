import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MenuService } from '../../core/services/menu.service';
import { ReviewService } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { MenuItem, Review } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 text-white overflow-hidden">
      <div class="absolute inset-0 opacity-20"
        style="background-image: url('https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=1200&q=80'); background-size: cover; background-position: center;">
      </div>
      <div class="relative page-container py-24 text-center">
        <div class="inline-block bg-orange-500/20 text-orange-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-orange-500/30">
          🍽 Authentic Indian Cuisine · Surat, Gujarat
        </div>
        <h1 class="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
          Welcome to<br>
          <span class="text-orange-400">BabaSai</span> Restaurant
        </h1>
        <p class="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
          Experience the rich flavors of India with our carefully crafted dishes made from the finest ingredients.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a routerLink="/menu" class="btn-primary text-base px-8 py-3">Explore Menu</a>
          @if (!auth.isLoggedIn()) {
            <a routerLink="/register" class="btn-secondary text-base px-8 py-3 border-white/30 text-orange-500 hover:bg-white/10">
              Join Us Free
            </a>
          }
        </div>
      </div>
    </section>

   <!-- Stats bar -->
<section class="bg-white border-b border-gray-100">
  <div class="page-container py-5">
    <div class="grid grid-cols-3 gap-6 text-center">

      <div>
        <div class="text-xl font-semibold text-orange-500">25+ Dishes</div>
        <div class="text-xs text-gray-500 mt-0.5">Variety of Menu</div>
      </div>

      <div>
        <div class="text-xl font-semibold text-orange-500">Quality Food</div>
        <div class="text-xs text-gray-500 mt-0.5">Fresh Ingredients</div>
      </div>

      <div>
        <div class="text-xl font-semibold text-orange-500">Fast Service</div>
        <div class="text-xs text-gray-500 mt-0.5">Quick Delivery</div>
      </div>

    </div>
  </div>
</section>

    <!-- Featured Menu -->
    <section class="page-container py-14">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="section-title">Featured Dishes</h2>
          <p class="text-gray-500 text-sm">Our most popular items, loved by customers</p>
        </div>
        <a routerLink="/menu" class="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1 transition-colors">
          View All <span>→</span>
        </a>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (s of [1,2,3,4,5,6]; track s) {
            <div class="card animate-pulse">
              <div class="h-48 bg-gray-200"></div>
              <div class="p-4 space-y-3">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded w-full"></div>
                <div class="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (item of featuredItems(); track item._id) {
            <div class="card group">
              <div class="relative overflow-hidden h-48">
                <img [src]="item.image" [alt]="item.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'">
                <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-orange-600 text-xs font-semibold px-2 py-1 rounded-full">
                  {{ item.category }}
                </span>
              </div>
              <div class="p-4">
                <div class="flex items-start justify-between mb-1">
                  <h3 class="font-semibold text-gray-800 group-hover:text-orange-500 transition-colors">{{ item.name }}</h3>
                  <span class="text-orange-500 font-bold text-sm ml-2 whitespace-nowrap">₹{{ item.price }}</span>
                </div>
                <p class="text-gray-400 text-xs line-clamp-2 mb-4">{{ item.description }}</p>
                <a routerLink="/menu" class="btn-primary w-full text-center block text-sm py-2">Order Now</a>
              </div>
            </div>
          }
        </div>
      }
    </section>

    <!-- Why Choose Us -->
    <section class="bg-orange-50 py-14">
      <div class="page-container">
        <div class="text-center mb-10">
          <h2 class="section-title">Why Choose BabaSai?</h2>
          <p class="text-gray-500 text-sm">We take pride in serving you the best</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (feature of features; track feature.title) {
            <div class="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div class="text-4xl mb-4">{{ feature.icon }}</div>
              <h3 class="font-semibold text-gray-800 mb-2">{{ feature.title }}</h3>
              <p class="text-gray-500 text-sm leading-relaxed">{{ feature.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Recent Reviews -->
    <section class="page-container py-14">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="section-title">What Our Customers Say</h2>
          <p class="text-gray-500 text-sm">Real reviews from real customers</p>
        </div>
        <a routerLink="/reviews" class="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1">
          All Reviews →
        </a>
      </div>

      @if (reviews().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          @for (review of reviews(); track review._id) {
            <div class="card p-5">
              <div class="flex items-center gap-1 mb-3">
                @for (star of getStars(review.rating); track $index) {
                  <span class="text-yellow-400 text-sm">★</span>
                }
                @for (star of getEmptyStars(review.rating); track $index) {
                  <span class="text-gray-200 text-sm">★</span>
                }
              </div>
              <p class="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">"{{ review.message }}"</p>
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold">
                  {{ getUserName(review).charAt(0).toUpperCase() }}
                </div>
                <span class="text-xs font-medium text-gray-700">{{ getUserName(review) }}</span>
              </div>
            </div>
          }
        </div>
      } @else {
        <p class="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
      }
    </section>

    <!-- CTA -->
    <section class="bg-gradient-to-r from-orange-500 to-orange-600 py-14">
      <div class="page-container text-center text-white">
        <h2 class="text-3xl font-bold mb-3">Ready to Order?</h2>
        <p class="text-orange-100 mb-6 text-lg">Experience the authentic taste of India delivered to your table</p>
        <div class="flex justify-center gap-4 flex-wrap">
          <a routerLink="/menu" class="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-lg">
            Browse Menu
          </a>
          <a href="tel:6355653553" class="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-xl transition-all">
            📞 Call Us: 6355653553
          </a>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);
  menuService = inject(MenuService);
  reviewService = inject(ReviewService);

  featuredItems = signal<MenuItem[]>([]);
  reviews = signal<Review[]>([]);
  loading = signal(true);

  features = [
    { icon: '🌿', title: 'Fresh Ingredients', desc: 'We use only the freshest, locally sourced ingredients in every dish we prepare.' },
    { icon: '👨‍🍳', title: 'Expert Chefs', desc: 'Our experienced chefs bring decades of culinary expertise to your plate.' },
    { icon: '🚀', title: 'Fast Service', desc: 'Quick and efficient service so you get your food hot and fresh every time.' }
  ];

  ngOnInit(): void {
    this.menuService.getMenuItems().subscribe({
      next: (res) => {
        this.featuredItems.set(res.items.slice(0, 6));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.reviewService.getReviews().subscribe({
      next: (res) => this.reviews.set(res.reviews.slice(0, 3))
    });
  }

  getStars(rating: number): number[] { return Array(rating).fill(0); }
  getEmptyStars(rating: number): number[] { return Array(5 - rating).fill(0); }
  getUserName(review: Review): string {
    const u = review.user as any;
    return u?.name || 'Customer';
  }
}
