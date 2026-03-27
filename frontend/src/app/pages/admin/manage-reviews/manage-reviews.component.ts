import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { ReviewService } from '../../../core/services/review.service';
import { ToastService } from '../../../core/services/toast.service';
import { Review } from '../../../models';

@Component({
  selector: 'app-manage-reviews',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Reviews</h1>
        <p class="text-gray-500 text-sm mt-0.5">{{ reviews().length }} total reviews</p>
      </div>

      <!-- Stats row -->
      @if (reviews().length > 0) {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          @for (stat of ratingStats(); track stat.label) {
            <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <div class="text-xl font-bold" [class]="stat.color">{{ stat.value }}</div>
              <div class="text-xs text-gray-500 mt-0.5">{{ stat.label }}</div>
            </div>
          }
        </div>
      }

      <!-- Reviews Grid -->
      @if (loading()) {
        <div class="p-10 flex justify-center">
          <div class="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (reviews().length === 0) {
        <div class="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
          <div class="text-4xl mb-2">⭐</div>
          <p>No reviews yet</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (review of reviews(); track review._id) {
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-fade-in">
              <!-- Header -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                    {{ getName(review).charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-800 text-sm">{{ getName(review) }}</p>
                    <p class="text-gray-400 text-xs">{{ getEmail(review) }}</p>
                  </div>
                </div>
                <button (click)="deleteReview(review)"
                  class="text-red-400 hover:text-red-600 text-xs font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors flex-shrink-0">
                  🗑 Delete
                </button>
              </div>

              <!-- Stars -->
              <div class="flex items-center gap-1 mb-2">
                @for (s of getStars(review.rating); track $index) {
                  <span class="text-yellow-400 text-sm">★</span>
                }
                @for (s of getEmptyStars(review.rating); track $index) {
                  <span class="text-gray-200 text-sm">★</span>
                }
                <span class="text-xs text-gray-400 ml-auto">{{ review.createdAt | date:'MMM d, y' }}</span>
              </div>

              <p class="text-gray-600 text-sm leading-relaxed">"{{ review.message }}"</p>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ManageReviewsComponent implements OnInit {
  adminService = inject(AdminService);
  reviewService = inject(ReviewService);
  toast = inject(ToastService);

  reviews = signal<Review[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.adminService.getAllReviews().subscribe({
      next: (res) => { this.reviews.set(res.reviews); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  ratingStats(): any[] {
    const r = this.reviews();
    if (!r.length) return [];
    const avg = (r.reduce((s, x) => s + x.rating, 0) / r.length).toFixed(1);
    return [
      { label: 'Total Reviews', value: r.length, color: 'text-blue-500' },
      { label: 'Avg Rating', value: `${avg}★`, color: 'text-yellow-500' },
      { label: '5-Star Reviews', value: r.filter(x => x.rating === 5).length, color: 'text-green-500' },
      { label: '1-Star Reviews', value: r.filter(x => x.rating === 1).length, color: 'text-red-500' },
    ];
  }

  deleteReview(review: Review): void {
    if (!confirm('Delete this review?')) return;
    this.reviewService.deleteReview(review._id).subscribe({
      next: () => {
        this.reviews.update(r => r.filter(x => x._id !== review._id));
        this.toast.success('Review deleted!');
      },
      error: (err) => this.toast.error(err.error?.message || 'Delete failed.')
    });
  }

  getName(r: Review): string { return (r.user as any)?.name || 'Anonymous'; }
  getEmail(r: Review): string { return (r.user as any)?.email || ''; }
  getStars(n: number): number[] { return Array(n).fill(0); }
  getEmptyStars(n: number): number[] { return Array(5 - n).fill(0); }
}
