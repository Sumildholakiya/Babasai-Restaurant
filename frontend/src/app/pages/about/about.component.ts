import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero Banner -->
    <section class="relative bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 text-white overflow-hidden">
      <div class="absolute inset-0 opacity-20"
        style="background-image: url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80');
               background-size: cover; background-position: center;">
      </div>
      <div class="relative page-container py-20 text-center">
        <span class="inline-block bg-orange-500/20 text-orange-300 text-sm font-medium px-4 py-1.5 rounded-full mb-5 border border-orange-500/30">
          🍽 Our Story
        </span>
        <h1 class="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
          About <span class="text-orange-400">BabaSai</span> Restaurant
        </h1>
        <p class="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
          A legacy of authentic Indian flavors, rooted in tradition and cooked with love since day one.
        </p>
      </div>
    </section>

    <!-- Our Story Section -->
    <section class="page-container py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 class="text-3xl font-bold text-gray-800 mb-4">Our Story</h2>
          <div class="w-16 h-1 bg-orange-500 rounded mb-6"></div>
          <p class="text-gray-600 leading-relaxed mb-4">
            BabaSai Restaurant was born from a simple passion — bringing the rich, aromatic flavors of authentic
            Indian cuisine to the heart of Surat, Gujarat. What started as a small family eatery has grown into
            a beloved destination for food lovers across the city.
          </p>
          <p class="text-gray-600 leading-relaxed mb-4">
            Our founder, inspired by generations of home-cooked recipes passed down through the family, opened
            BabaSai with a vision: to serve food that feels like home — comforting, flavorful, and made with
            only the freshest ingredients.
          </p>
          <p class="text-gray-600 leading-relaxed">
            Today, we continue that mission every single day, serving hundreds of happy customers with the same
            warmth and dedication that started it all.
          </p>
        </div>
        <div class="relative">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80"
            alt="BabaSai Restaurant Interior"
            class="w-full h-80 object-cover rounded-2xl shadow-lg"
          >
          <div class="absolute -bottom-5 -left-5 bg-orange-500 text-white rounded-2xl px-6 py-4 shadow-xl">
            <p class="text-3xl font-bold leading-none">10+</p>
            <p class="text-orange-100 text-sm mt-0.5">Years of Service</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission & Vision -->
    <section class="bg-orange-50 py-16">
      <div class="page-container">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Our Mission & Vision</h2>
          <div class="w-16 h-1 bg-orange-500 rounded mx-auto"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
            <div class="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl mb-5">🎯</div>
            <h3 class="text-xl font-bold text-gray-800 mb-3">Our Mission</h3>
            <p class="text-gray-600 leading-relaxed">
              To serve authentic, high-quality Indian cuisine made from the freshest ingredients, ensuring
              every guest leaves with a smile and a full stomach. We believe food is love, and we pour that
              love into every dish we prepare.
            </p>
          </div>
          <div class="bg-white rounded-2xl p-8 shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
            <div class="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl mb-5">🌟</div>
            <h3 class="text-xl font-bold text-gray-800 mb-3">Our Vision</h3>
            <p class="text-gray-600 leading-relaxed">
              To become Surat's most trusted and cherished restaurant — a place where families gather,
              friendships grow, and memories are made over a shared love of great food. We aim to preserve
              Indian culinary heritage for future generations.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Values -->
    <section class="page-container py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">What We Stand For</h2>
        <div class="w-16 h-1 bg-orange-500 rounded mx-auto mb-4"></div>
        <p class="text-gray-500">The values that guide every dish we make</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        @for (value of coreValues; track value.title) {
          <div class="card p-6 text-center group hover:border-orange-200">
            <div class="w-14 h-14 bg-orange-50 group-hover:bg-orange-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 transition-colors">
              {{ value.icon }}
            </div>
            <h3 class="font-semibold text-gray-800 mb-2">{{ value.title }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed">{{ value.desc }}</p>
          </div>
        }
      </div>
    </section>

    <!-- Team Section -->
<section class="bg-gray-50 py-16">
  <div class="page-container">
    
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold text-gray-800 mb-2">Meet Our Team</h2>
      <div class="w-16 h-1 bg-orange-500 rounded mx-auto mb-4"></div>
      <p class="text-gray-500">The leadership behind our success</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      
      <div *ngFor="let member of team" 
           class="bg-white rounded-xl p-5 text-center border border-gray-100 shadow-sm hover:shadow-md transition">
        
        <div class="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-orange-100">
          <img 
            [src]="member.image" 
            [alt]="member.name"
            class="w-full h-full object-cover object-top"
            loading="lazy">
        </div>

        <h3 class="font-semibold text-gray-800">{{ member.name }}</h3>
        <p class="text-orange-500 text-sm font-medium">{{ member.role }}</p>
        <p class="text-gray-500 text-xs mt-2">{{ member.bio }}</p>

      </div>

    </div>

  </div>
</section>

    <!-- Stats Banner -->
    <section class="bg-orange-400 border border-gray-100">
  <div class="page-container py-10">
    <div class="grid grid-cols-3 gap-6 text-center">

      <div>
        <div class="text-xl font-semibold text-white-500">25+ Dishes</div>
        <div class="text-xs text-gray-700 mt-0.5">Variety of Menu</div>
      </div>

      <div>
        <div class="text-xl font-semibold text-white-500">Quality Food</div>
        <div class="text-xs text-gray-700 mt-0.5">Fresh Ingredients</div>
      </div>

      <div>
        <div class="text-xl font-semibold text-white-500">Fast Service</div>
        <div class="text-xs text-gray-700 mt-0.5">Quick Delivery</div>
      </div>

    </div>
  </div>
</section>


    <!-- CTA -->
    <section class="page-container py-16 text-center">
      <h2 class="text-3xl font-bold text-gray-800 mb-3">Come Dine With Us</h2>
      <p class="text-gray-500 mb-8 max-w-xl mx-auto">
        Experience the warmth, flavor, and hospitality of BabaSai Restaurant. We can't wait to serve you!
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a routerLink="/menu" class="btn-primary px-10 py-3 text-base">Explore Our Menu</a>
        <a routerLink="/contact" class="btn-secondary px-10 py-3 text-base">Contact Us</a>
      </div>
    </section>
  `
})
export class AboutComponent {
  coreValues = [
    { icon: '🌿', title: 'Fresh Ingredients', desc: 'We source locally and cook fresh daily — no shortcuts, ever.' },
    { icon: '❤️', title: 'Cooked with Love', desc: 'Every dish is prepared with genuine care and dedication to taste.' },
    { icon: '🏆', title: 'Quality First', desc: 'We never compromise on quality, from raw ingredients to the final plate.' },
    { icon: '🤝', title: 'Warm Hospitality', desc: 'Every guest is treated like family from the moment they walk in.' },
  ];

  team = [
    {
      name: 'Chalodiya Keshavi',
      role: 'Head of Operations',
      bio: 'Leads overall operations and ensures smooth management across all departments.',
      image: 'assets/images/keshavi.png'
    },
    {
      name: 'Dholakiya Sumil',
      role: 'Technical Head',
      bio: 'Manages technology and ensures high-quality digital experience.',
      image: 'assets/images/sumil.png'
    },
    {
      name: 'Chandpara Dharati',
      role: 'Creative Director',
      bio: 'Handles branding, design, and visual identity with creativity.',
      image: 'assets/images/dharati.png'
    },
    {
      name: 'Chothani Prem',
      role: 'Managing Director',
      bio: 'Oversees business strategy and key decision making.',
      image: 'assets/images/prem.png'
    }
  ];

 
}
