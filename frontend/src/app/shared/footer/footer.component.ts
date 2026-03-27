import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-gray-900 text-gray-300 mt-16">
      <div class="page-container py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
          <!-- Brand -->
          <div>
            <div class="flex items-center gap-2 mb-4">
              <div class="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white text-lg">🍽</div>
              <div>
                <span class="font-bold text-white text-lg block leading-none">BabaSai</span>
                <span class="text-orange-400 text-xs">Restaurant</span>
              </div>
            </div>
            <p class="text-sm leading-relaxed text-gray-400">
              Authentic Indian cuisine crafted with love and tradition. Every dish tells a story of flavors.
            </p>
          </div>

          <!-- Quick Links — ✅ About Us & Contact Us added -->
          <div>
            <h4 class="text-white font-semibold mb-4">Quick Links</h4>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/home"    class="hover:text-orange-400 transition-colors">Home</a></li>
              <li><a routerLink="/menu"    class="hover:text-orange-400 transition-colors">Our Menu</a></li>
              <li><a routerLink="/about"   class="hover:text-orange-400 transition-colors">About Us</a></li>    <!-- ✅ NEW -->
              <li><a routerLink="/contact" class="hover:text-orange-400 transition-colors">Contact Us</a></li>  <!-- ✅ NEW -->
              <li><a routerLink="/reviews" class="hover:text-orange-400 transition-colors">Reviews</a></li>
              <li><a routerLink="/orders"  class="hover:text-orange-400 transition-colors">My Orders</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="text-white font-semibold mb-4">Contact Us</h4>
            <ul class="space-y-3 text-sm">
              <li class="flex items-start gap-2">
                <span class="text-orange-400 mt-0.5">📍</span>
                <span>Babasai Restaurant, Hirabaug, Surat</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-orange-400">📞</span>
                <a href="tel:6355653553" class="hover:text-orange-400 transition-colors">6355653553</a>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-orange-400">✉️</span>
                <a href="mailto:info@babasai.com" class="hover:text-orange-400 transition-colors">info&#64;babasai.com</a>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-orange-400">🕐</span>
                <span>Open: 10:00 AM – 11:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-500">
          <p>&copy; {{ currentYear }} BabaSai Restaurant. All rights reserved.</p>
          <p>Made with ❤️ in Surat, Gujarat</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
