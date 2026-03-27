import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
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
          <h1 class="text-2xl font-bold text-gray-800 mb-1">Create Account</h1>
          <p class="text-gray-500 text-sm mb-6">Join us to start ordering delicious food</p>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                formControlName="name"
                placeholder="Your full name"
                class="input-field"
                [class.input-error]="f['name'].touched && f['name'].invalid"
              >
              @if (f['name'].touched && f['name'].errors?.['required']) {
                <p class="text-red-500 text-xs mt-1">Name is required.</p>
              }
              @if (f['name'].touched && f['name'].errors?.['minlength']) {
                <p class="text-red-500 text-xs mt-1">Name must be at least 2 characters.</p>
              }
            </div>

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
                  placeholder="Min. 6 characters"
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
              @if (f['password'].touched && f['password'].errors?.['minlength']) {
                <p class="text-red-500 text-xs mt-1">Password must be at least 6 characters.</p>
              }
              <!-- Password strength bar -->
              @if (f['password'].value) {
                <div class="mt-2 flex gap-1">
                  @for (bar of [1,2,3,4]; track bar) {
                    <div class="h-1 flex-1 rounded-full transition-colors"
                      [class]="passwordStrength() >= bar ? strengthColor() : 'bg-gray-200'"></div>
                  }
                </div>
                <p class="text-xs mt-1" [class]="strengthTextColor()">{{ strengthLabel() }}</p>
              }
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                formControlName="confirmPassword"
                placeholder="Re-enter password"
                class="input-field"
                [class.input-error]="f['confirmPassword'].touched && registerForm.errors?.['mismatch']"
              >
              @if (f['confirmPassword'].touched && registerForm.errors?.['mismatch']) {
                <p class="text-red-500 text-xs mt-1">Passwords do not match.</p>
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
                  Creating account...
                </span>
              } @else {
                Create Account
              }
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-500">
              Already have an account?
              <a routerLink="/login" class="text-orange-500 hover:text-orange-600 font-medium ml-1">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  toast = inject(ToastService);
  router = inject(Router);

  loading = signal(false);
  errorMsg = signal('');
  showPassword = signal(false);

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  get f() { return this.registerForm.controls; }

  passwordMatchValidator(control: AbstractControl) {
    const pass = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  passwordStrength(): number {
    const pwd = this.f['password'].value || '';
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 10) strength++;
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  }

  strengthColor(): string {
    const s = this.passwordStrength();
    if (s <= 1) return 'bg-red-400';
    if (s === 2) return 'bg-yellow-400';
    if (s === 3) return 'bg-blue-400';
    return 'bg-green-500';
  }

  strengthTextColor(): string {
    const s = this.passwordStrength();
    if (s <= 1) return 'text-red-500';
    if (s === 2) return 'text-yellow-600';
    if (s === 3) return 'text-blue-500';
    return 'text-green-600';
  }

  strengthLabel(): string {
    const s = this.passwordStrength();
    if (s <= 1) return 'Weak';
    if (s === 2) return 'Fair';
    if (s === 3) return 'Good';
    return 'Strong';
  }

  onSubmit(): void {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    const { name, email, password } = this.registerForm.value;
    this.authService.register({ name: name!, email: email!, password: password! }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(`Welcome to BabaSai, ${res.user.name}! 🎉`);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Registration failed. Please try again.');
      }
    });
  }
}
