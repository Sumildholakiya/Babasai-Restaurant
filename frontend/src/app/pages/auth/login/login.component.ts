import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <a routerLink="/home" class="inline-flex items-center gap-2 group">
            <div class="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-md group-hover:bg-orange-600 transition-colors">🍽</div>
            <div class="text-left">
              <span class="font-bold text-gray-900 text-xl block leading-tight">BabaSai</span>
              <span class="text-orange-500 text-sm">Restaurant</span>
            </div>
          </a>
        </div>

        <div class="card p-8 shadow-md">
          <h1 class="text-2xl font-bold text-gray-800 mb-1">Welcome back!</h1>
          <p class="text-gray-500 text-sm mb-6">Sign in to continue ordering</p>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                formControlName="email"
                placeholder="you@example.com"
                class="input-field"
                [class.input-error]="f['email'].touched && f['email'].invalid"
              >
              @if (f['email'].touched && f['email'].errors?.['required']) {
                <p class="text-red-500 text-xs mt-1">Email is required.</p>
              }
              @if (f['email'].touched && f['email'].errors?.['email']) {
                <p class="text-red-500 text-xs mt-1">Enter a valid email address.</p>
              }
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div class="relative">
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                  class="input-field pr-11"
                  [class.input-error]="f['password'].touched && f['password'].invalid"
                >
                <button type="button" (click)="showPassword.set(!showPassword())"
                  class="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors">
                  {{ showPassword() ? '🙈' : '👁' }}
                </button>
              </div>
              @if (f['password'].touched && f['password'].errors?.['required']) {
                <p class="text-red-500 text-xs mt-1">Password is required.</p>
              }
            </div>

            <!-- Error message -->
            @if (errorMsg()) {
              <div class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in">
                <span>⚠️</span> {{ errorMsg() }}
              </div>
            }

            <button type="submit" [disabled]="loading()" class="btn-primary w-full py-3 text-base mt-2">
              @if (loading()) {
                <span class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Signing in...
                </span>
              } @else {
                Sign In
              }
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-500">
              Don't have an account?
              <a routerLink="/register" class="text-orange-500 hover:text-orange-600 font-medium ml-1">Register here</a>
            </p>
          </div>

         
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  toast = inject(ToastService);
  router = inject(Router);

  loading = signal(false);
  errorMsg = signal('');
  showPassword = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    this.authService.login(this.loginForm.value as any).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(`Welcome back, ${res.user.name}!`);
        if (res.user.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Login failed. Please try again.');
      }
    });
  }
}
