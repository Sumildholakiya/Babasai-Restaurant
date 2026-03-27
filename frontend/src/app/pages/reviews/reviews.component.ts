import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ReviewService } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Review } from '../../models';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-container py-10">
      <div class="mb-8">
        <h1 class="section-title text-3xl">Customer Reviews</h1>
        <p class="text-gray-500">Hear what our valued customers have to say</p>
      </div>

      <!-- Submit Review -->
      @if (auth.isLoggedIn() && !auth.isAdmin()) {
        <div class="card p-6 mb-8 bg-gradient-to-br from-orange-50 to-white border-orange-100">
          <h2 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span class="text-2xl">✍️</span> Share Your Experience
          </h2>
          <form [formGroup]="reviewForm" (ngSubmit)="submitReview()" class="space-y-4">
            <!-- Star rating -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <div class="flex gap-2">
                @for (star of [1,2,3,4,5]; track star) {
                  <button type="button"
                    (click)="setRating(star)"
                    class="text-3xl transition-transform hover:scale-110"
                    [class]="star <= (selectedRating()) ? 'text-yellow-400' : 'text-gray-200'"
                  >★</button>
                }
              </div>
              @if (reviewForm.get('rating')?.touched && reviewForm.get('rating')?.invalid) {
                <p class="text-red-500 text-xs mt-1">Please select a rating.</p>
              }
            </div>

            <!-- Message -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
              <textarea
                formControlName="message"
                rows="4"
                placeholder="Tell us about your experience..."
                class="input-field resize-none"
                [class.input-error]="reviewForm.get('message')?.touched && reviewForm.get('message')?.invalid"
              ></textarea>
              @if (reviewForm.get('message')?.touched && reviewForm.get('message')?.errors?.['required']) {
                <p class="text-red-500 text-xs mt-1">Review message is required.</p>
              }
              @if (reviewForm.get('message')?.touched && reviewForm.get('message')?.errors?.['minlength']) {
                <p class="text-red-500 text-xs mt-1">Review must be at least 10 characters.</p>
              }
            </div>

            <button type="submit" [disabled]="submitting()" class="btn-primary px-8">
              @if (submitting()) { Submitting... } @else { Submit Review }
            </button>
          </form>
        </div>
      }

      <!-- Stats -->
      @if (reviews().length > 0) {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="card p-4 text-center">
            <div class="text-2xl font-bold text-orange-500">{{ reviews().length }}</div>
            <div class="text-xs text-gray-500 mt-0.5">Total Reviews</div>
          </div>
          <div class="card p-4 text-center">
            <div class="text-2xl font-bold text-yellow-500">{{ avgRating() }}★</div>
            <div class="text-xs text-gray-500 mt-0.5">Average Rating</div>
          </div>
          <div class="card p-4 text-center">
            <div class="text-2xl font-bold text-green-500">{{ fiveStarCount() }}</div>
            <div class="text-xs text-gray-500 mt-0.5">5-Star Reviews</div>
          </div>
          <div class="card p-4 text-center">
            <div class="text-2xl font-bold text-blue-500">{{ uniqueReviewers() }}</div>
            <div class="text-xs text-gray-500 mt-0.5">Happy Customers</div>
          </div>
        </div>
      }

      <!-- Reviews grid -->
      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (s of [1,2,3,4,5,6]; track s) {
            <div class="card p-5 animate-pulse space-y-3">
              <div class="h-4 bg-gray-200 rounded w-24"></div>
              <div class="h-16 bg-gray-200 rounded"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          }
        </div>
      } @else if (reviews().length === 0) {
        <div class="text-center py-16">
          <div class="text-5xl mb-4">⭐</div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">No reviews yet</h3>
          <p class="text-gray-400">Be the first to share your experience!</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (review of reviews(); track review._id) {
            <div class="card p-5 hover:shadow-md transition-shadow animate-fade-in">
              <div class="flex items-center gap-1 mb-3">
                @for (s of getStars(review.rating); track $index) {
                  <span class="text-yellow-400">★</span>
                }
                @for (s of getEmptyStars(review.rating); track $index) {
                  <span class="text-gray-200">★</span>
                }
                <span class="ml-auto text-xs text-gray-400">{{ review.createdAt | date:'MMM d, y' }}</span>
              </div>
              <p class="text-gray-600 text-sm leading-relaxed mb-4">"{{ review.message }}"</p>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                  {{ getName(review).charAt(0).toUpperCase() }}
                </div>
                <span class="text-sm font-medium text-gray-700">{{ getName(review) }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ReviewsComponent implements OnInit {
  auth = inject(AuthService);
  reviewService = inject(ReviewService);
  toast = inject(ToastService);
  fb = inject(FormBuilder);

  reviews = signal<Review[]>([]);
  loading = signal(true);
  submitting = signal(false);
  selectedRating = signal(0);

  reviewForm = this.fb.group({
    message: ['', [Validators.required, Validators.minLength(10)]],
    rating: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void { this.loadReviews(); }

  loadReviews(): void {
    this.reviewService.getReviews().subscribe({
      next: (res) => { this.reviews.set(res.reviews); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  setRating(star: number): void {
    this.selectedRating.set(star);
    this.reviewForm.patchValue({ rating: star });
  }

  submitReview(): void {
    if (this.reviewForm.invalid) { this.reviewForm.markAllAsTouched(); return; }
    this.submitting.set(true);
    const { message, rating } = this.reviewForm.value;
    this.reviewService.createReview({ message: message!, rating: rating! }).subscribe({
      next: (res) => {
        this.reviews.update(r => [res.review, ...r]);
        this.reviewForm.reset();
        this.selectedRating.set(0);
        this.submitting.set(false);
        this.toast.success('Review submitted! Thank you!');
      },
      error: (err) => {
        this.submitting.set(false);
        this.toast.error(err.error?.message || 'Failed to submit review.');
      }
    });
  }

  avgRating(): string {
    if (!this.reviews().length) return '0';
    const avg = this.reviews().reduce((s, r) => s + r.rating, 0) / this.reviews().length;
    return avg.toFixed(1);
  }

  fiveStarCount(): number { return this.reviews().filter(r => r.rating === 5).length; }
  uniqueReviewers(): number { return new Set(this.reviews().map(r => (r.user as any)?._id || r.user)).size; }
  getStars(n: number): number[] { return Array(n).fill(0); }
  getEmptyStars(n: number): number[] { return Array(5 - n).fill(0); }
  getName(r: Review): string { return (r.user as any)?.name || 'Customer'; }
}
