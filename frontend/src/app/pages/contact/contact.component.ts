import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <!-- Hero Banner -->
    <section class="relative bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 text-white overflow-hidden">
      <div class="absolute inset-0 opacity-20"
        style="background-image: url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80');
               background-size: cover; background-position: center;">
      </div>
      <div class="relative page-container py-20 text-center">
        <span class="inline-block bg-orange-500/20 text-orange-300 text-sm font-medium px-4 py-1.5 rounded-full mb-5 border border-orange-500/30">
          📞 Get In Touch
        </span>
        <h1 class="text-4xl md:text-5xl font-extrabold mb-4">
          Contact <span class="text-orange-400">Us</span>
        </h1>
        <p class="text-gray-300 text-lg max-w-xl mx-auto leading-relaxed">
          We'd love to hear from you. Reach out for reservations, feedback, or any questions.
        </p>
      </div>
    </section>

    <!-- Contact Info Cards -->
    <section class="page-container py-14">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        @for (info of contactInfo; track info.label) {
          <div class="card p-6 text-center group hover:border-orange-200">
            <div class="w-14 h-14 bg-orange-50 group-hover:bg-orange-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 transition-colors">
              {{ info.icon }}
            </div>
            <h3 class="font-semibold text-gray-800 mb-1">{{ info.label }}</h3>
            @if (info.link) {
              <a [href]="info.link" class="text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors">
                {{ info.value }}
              </a>
            } @else {
              <p class="text-gray-500 text-sm">{{ info.value }}</p>
            }
            @if (info.sub) {
              <p class="text-gray-400 text-xs mt-0.5">{{ info.sub }}</p>
            }
          </div>
        }
      </div>

      <!-- Main Grid: Form + Map -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">

        <!-- ===== CONTACT FORM ===== -->
        <div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Send Us a Message</h2>
          <div class="w-12 h-1 bg-orange-500 rounded mb-6"></div>

          <!-- Success state -->
          @if (submitted()) {
            <div class="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-fade-in">
              <div class="text-5xl mb-4">✅</div>
              <h3 class="text-xl font-bold text-green-700 mb-2">Message Sent!</h3>
              <p class="text-green-600 text-sm mb-1">
                Thank you, <strong>{{ submittedName() }}</strong>!
              </p>
              <p class="text-green-500 text-sm mb-5">
                Your message has been saved. We'll respond within 24 hours.
              </p>
              <button (click)="submitted.set(false)" class="btn-primary px-6 py-2 text-sm">
                Send Another Message
              </button>
            </div>

          } @else {
            <!-- Form -->
            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-5">

              <!-- Name + Email -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" formControlName="name" placeholder="Your name"
                    class="input-field" [class.input-error]="f['name'].touched && f['name'].invalid">
                  @if (f['name'].touched && f['name'].errors?.['required']) {
                    <p class="text-red-500 text-xs mt-1">Name is required.</p>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input type="email" formControlName="email" placeholder="you@example.com"
                    class="input-field" [class.input-error]="f['email'].touched && f['email'].invalid">
                  @if (f['email'].touched && f['email'].errors?.['required']) {
                    <p class="text-red-500 text-xs mt-1">Email is required.</p>
                  }
                  @if (f['email'].touched && f['email'].errors?.['email']) {
                    <p class="text-red-500 text-xs mt-1">Enter a valid email.</p>
                  }
                </div>
              </div>

              <!-- Phone -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span class="text-gray-400 font-normal">(optional)</span>
                </label>
                <input type="tel" formControlName="phone" placeholder="e.g. 9876543210" class="input-field">
              </div>

              <!-- Subject -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <select formControlName="subject" class="input-field"
                  [class.input-error]="f['subject'].touched && f['subject'].invalid">
                  <option value="">Select a subject</option>
                  @for (opt of subjectOptions; track opt) {
                    <option [value]="opt">{{ opt }}</option>
                  }
                </select>
                @if (f['subject'].touched && f['subject'].invalid) {
                  <p class="text-red-500 text-xs mt-1">Please select a subject.</p>
                }
              </div>

              <!-- Message -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea formControlName="message" rows="5"
                  placeholder="Write your message here..."
                  class="input-field resize-none"
                  [class.input-error]="f['message'].touched && f['message'].invalid">
                </textarea>
                @if (f['message'].touched && f['message'].errors?.['required']) {
                  <p class="text-red-500 text-xs mt-1">Message is required.</p>
                }
                @if (f['message'].touched && f['message'].errors?.['minlength']) {
                  <p class="text-red-500 text-xs mt-1">Message must be at least 10 characters.</p>
                }
                <p class="text-gray-400 text-xs mt-1 text-right">
                  {{ f['message'].value?.length || 0 }} characters
                </p>
              </div>

              <!-- Server error -->
              @if (errorMsg()) {
                <div class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in">
                  <span>⚠️</span> {{ errorMsg() }}
                </div>
              }

              <!-- Submit button -->
              <button type="submit" [disabled]="sending()" class="btn-primary w-full py-3 text-base">
                @if (sending()) {
                  <span class="flex items-center justify-center gap-2">
                    <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Sending...
                  </span>
                } @else {
                  📨 Send Message
                }
              </button>
            </form>
          }
        </div>

        <!-- Right: Map + Hours + Social -->
        <div class="space-y-6">

          <!-- Google Map -->
          <div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Find Us Here</h2>
            <div class="w-12 h-1 bg-orange-500 rounded mb-5"></div>
            <div class="rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-64">
              <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3719.378610808684!2d72.87414600000001!3d21.21683!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04f1e42b3d09b%3A0x41a6c9238885640c!2sBaba%20Sai%20Dhosa!5e0!3m2!1sen!2sus!4v1774437383181!5m2!1sen!2sus"
                width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"
                referrerpolicy="no-referrer-when-downgrade" title="BabaSai Location">
              </iframe>
            </div>
          </div>

          <!-- Opening Hours -->
          <div class="card p-6">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span class="text-xl">🕐</span> Opening Hours
            </h3>
            <div class="space-y-3">
              @for (hour of openingHours; track hour.day; let last = $last) {
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-600 font-medium">{{ hour.day }}</span>
                  <span class="font-semibold" [class]="hour.closed ? 'text-red-400' : 'text-green-600'">
                    {{ hour.time }}
                  </span>
                </div>
                @if (!last) { <div class="border-b border-gray-50"></div> }
              }
            </div>
          </div>

         
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="bg-orange-50 py-16">
      <div class="page-container">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Frequently Asked Questions</h2>
          <div class="w-16 h-1 bg-orange-500 rounded mx-auto"></div>
        </div>
        <div class="max-w-3xl mx-auto space-y-4">
          @for (faq of faqs; track faq.q; let i = $index) {
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button (click)="toggleFaq(i)"
                class="w-full flex items-center justify-between px-6 py-4 text-left text-gray-800 font-medium hover:bg-orange-50 transition-colors">
                <span>{{ faq.q }}</span>
                <span class="text-orange-500 text-xl font-light transition-transform duration-200"
                  [class]="openFaq() === i ? 'rotate-45' : ''">+</span>
              </button>
              @if (openFaq() === i) {
                <div class="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-3 animate-fade-in">
                  {{ faq.a }}
                </div>
              }
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="page-container py-14 text-center">
      <h2 class="text-2xl font-bold text-gray-800 mb-3">Ready to Order?</h2>
      <p class="text-gray-500 mb-6">Browse our menu and place your order right now!</p>
      <a routerLink="/menu" class="btn-primary px-10 py-3 text-base">View Our Menu</a>
    </section>
  `
})
export class ContactComponent {
  // ✅ KEY CHANGE: ContactService inject kiya hai — ye real API call karega
  fb             = inject(FormBuilder);
  contactService = inject(ContactService);

  submitted     = signal(false);
  sending       = signal(false);
  submittedName = signal('');
  openFaq       = signal<number | null>(null);
  errorMsg      = signal('');

  contactForm = this.fb.group({
    name:    ['', Validators.required],
    email:   ['', [Validators.required, Validators.email]],
    phone:   [''],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  get f() { return this.contactForm.controls; }

  subjectOptions = [
    'Table Reservation',
    'Bulk / Catering Order',
    'Feedback & Suggestions',
    'Complaint',
    'Partnership Enquiry',
    'Other'
  ];

  contactInfo = [
    { icon: '📍', label: 'Our Address',   value: 'Babasai Restaurant, Hirabaug', sub: 'Come visit us anytime!',  link: null },
    { icon: '📞', label: 'Phone Number',  value: '6355653553',             sub: 'Mon–Sun, 10am–11pm',      link: 'tel:6355653553' },
    { icon: '✉️', label: 'Email Us',      value: 'info@babasai.com',       sub: 'We reply within 24 hrs',  link: 'mailto:info@babasai.com' },
    { icon: '🕐', label: 'Working Hours', value: '10:00 AM – 11:00 PM',    sub: 'Open all 7 days',         link: null }
  ];

  openingHours = [
    { day: 'Monday – Friday', time: '10:00 AM – 11:00 PM', closed: false },
    { day: 'Saturday',        time: '9:00 AM – 11:30 PM',  closed: false },
    { day: 'Sunday',          time: '9:00 AM – 10:30 PM',  closed: false },
    { day: 'Public Holidays', time: '10:00 AM – 9:00 PM',  closed: false },
  ];

  socialLinks = [
    { icon: '📘', label: 'Facebook',  href: '#', bg: '#e7f0fd', color: '#1877f2' },
    { icon: '📸', label: 'Instagram', href: '#', bg: '#fce4f3', color: '#e1306c' },
    { icon: '🐦', label: 'Twitter',   href: '#', bg: '#e8f5fd', color: '#1da1f2' },
    { icon: '📺', label: 'YouTube',   href: '#', bg: '#fde8e8', color: '#ff0000' },
  ];

  faqs = [
    { q: 'Do you offer table reservations?',
      a: 'Yes! You can call us at 6355653553 or send a message using the form above. We recommend booking at least 2 hours before your visit.' },
    { q: 'Do you offer home delivery?',
      a: 'Yes, within Surat city. Place your order through our website. Delivery charges may apply based on distance.' },
    { q: 'Are there vegetarian options?',
      a: 'Absolutely! Most of our menu is vegetarian-friendly. We also accommodate special dietary requirements.' },
    { q: 'Do you cater for events?',
      a: 'Yes — weddings, corporate events, birthdays and more. Please contact us at least 3–5 days in advance.' },
    { q: 'What payment methods do you accept?',
      a: 'Cash, all major UPI apps (GPay, PhonePe, Paytm), credit/debit cards, and net banking.' },
    { q: 'Can I cancel my order?',
      a: 'Yes, within 5 minutes of placing it. After that please call us immediately at 6355653553.' },
  ];

  toggleFaq(i: number): void {
    this.openFaq.set(this.openFaq() === i ? null : i);
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.sending.set(true);
    this.errorMsg.set('');

    const { name, email, phone, subject, message } = this.contactForm.value;

    // ✅ KEY CHANGE: Real API call — POST /api/contact — saves to MongoDB
    this.contactService.submitContact({
      name:    name!,
      email:   email!,
      phone:   phone || '',
      subject: subject!,
      message: message!
    }).subscribe({
      next: () => {
        this.submittedName.set(name!);
        this.sending.set(false);
        this.submitted.set(true);
        this.contactForm.reset();
      },
      error: (err) => {
        this.sending.set(false);
        this.errorMsg.set(err.error?.message || 'Something went wrong. Please try again.');
      }
    });
  }
}
