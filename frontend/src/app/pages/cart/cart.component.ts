import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { Cart } from '../../models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container py-10">
      <h1 class="section-title text-3xl mb-8">Your Cart</h1>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <div class="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (!cart() || cart()!.items.length === 0) {
        <div class="text-center py-20">
          <div class="text-6xl mb-4">🛒</div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
          <p class="text-gray-400 mb-6">Add some delicious dishes to get started!</p>
          <a routerLink="/menu" class="btn-primary">Browse Menu</a>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Cart Items -->
          <div class="lg:col-span-2 space-y-4">
            @for (item of cart()!.items; track item.menuItem._id) {
              <div class="card p-4 flex items-center gap-4 animate-fade-in">
                
                <img 
                  [src]="item.menuItem.image" 
                  [alt]="item.menuItem.name"
                  class="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                  onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'">

                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-800 truncate">{{ item.menuItem.name }}</h3>
                  <p class="text-orange-500 font-bold text-sm mt-0.5">₹{{ item.price }} each</p>
                  <p class="text-xs text-gray-400">{{ item.menuItem.category }}</p>
                </div>

                <!-- Quantity -->
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button (click)="updateQty(item.menuItem._id, item.quantity - 1)"
                    class="w-8 h-8 rounded-full bg-gray-100 hover:bg-orange-100 hover:text-orange-600 flex items-center justify-center font-bold">
                    −
                  </button>

                  <span class="w-8 text-center font-semibold">{{ item.quantity }}</span>

                  <button (click)="updateQty(item.menuItem._id, item.quantity + 1)"
                    class="w-8 h-8 rounded-full bg-gray-100 hover:bg-orange-100 hover:text-orange-600 flex items-center justify-center font-bold">
                    +
                  </button>
                </div>

                <!-- Total -->
                <div class="text-right w-20">
                  <p class="font-bold">₹{{ item.price * item.quantity }}</p>
                  <button (click)="removeItem(item.menuItem._id)"
                    class="text-red-400 hover:text-red-600 text-xs mt-1">
                    Remove
                  </button>
                </div>

              </div>
            }

            <button (click)="clearCart()"
              class="text-red-400 hover:text-red-600 text-sm flex items-center gap-1">
              🗑 Clear entire cart
            </button>
          </div>

          <!-- Order Summary -->
          <div>
            <div class="card p-6 sticky top-24">

              <h2 class="font-bold text-lg mb-5">Order Summary</h2>

              <!-- Items -->
              <div class="space-y-3 mb-5">
                @for (item of cart()!.items; track item.menuItem._id) {
                  <div class="flex justify-between text-sm text-gray-600">
                    <span>{{ item.menuItem.name }} × {{ item.quantity }}</span>
                    <span>₹{{ item.price * item.quantity }}</span>
                  </div>
                }
              </div>

              <!-- Total -->
              <div class="border-t pt-4 mb-5 space-y-2">
                <div class="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{{ cart()!.total }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span class="text-green-500">Free</span>
                </div>
                <div class="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span class="text-orange-500">₹{{ cart()!.total }}</span>
                </div>
              </div>

              <!-- Address Input -->
              <div class="mb-5">
                <p class="font-medium mb-2">🏍 Delivery Address</p>

                <textarea
                  [value]="address()"
                  (input)="address.set($any($event.target).value)"
                  rows="3"
                  placeholder="Enter your delivery address"
                  class="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                </textarea>
              </div>

              <!-- Address Preview -->
              <div class="bg-orange-50 rounded-xl p-3 mb-5 text-sm">
                <p class="font-medium mb-1">Delivering to:</p>
                <p class="text-xs text-gray-500">
                  {{ address() || 'Please enter address above' }}
                </p>
              </div>

              <!-- Button -->
              <button
                (click)="placeOrder()"
                [disabled]="placingOrder()"
                class="btn-primary w-full py-3">

                @if (placingOrder()) {
                  <span class="flex items-center justify-center gap-2">
                    <svg class="animate-spin h-5 w-5"></svg>
                    Placing Order...
                  </span>
                } @else {
                  🎉 Place Order
                }

              </button>

            </div>
          </div>

        </div>
      }
    </div>
  `
})
export class CartComponent implements OnInit {

  cartService = inject(CartService);
  orderService = inject(OrderService);
  toast = inject(ToastService);

  cart = signal<Cart | null>(null);
  loading = signal(true);
  placingOrder = signal(false);
  address = signal('');

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading.set(true);
    this.cartService.getCart().subscribe({
      next: (res) => {
        this.cart.set(res.cart);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  updateQty(id: string, qty: number): void {
    if (qty <= 0) return this.removeItem(id);

    this.cartService.updateCartItem(id, qty).subscribe({
      next: (res) => this.cart.set(res.cart),
      error: () => this.toast.error('Update failed')
    });
  }

  removeItem(id: string): void {
    this.cartService.removeFromCart(id).subscribe({
      next: (res) => this.cart.set(res.cart),
      error: () => this.toast.error('Remove failed')
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => this.cart.set(null),
      error: () => this.toast.error('Clear failed')
    });
  }
  placeOrder(): void {
    if (!this.address().trim()) {
      this.toast.error('Please enter delivery address');
      return;
    }

    this.placingOrder.set(true);

    this.orderService.placeOrder(this.address()).subscribe({
      next: () => {
        this.placingOrder.set(false);
        this.cart.set(null);
        this.cartService.setCount(0);
        this.address.set('');
        this.toast.success('Order placed successfully!');
      },
      error: () => {
        this.placingOrder.set(false);
        this.toast.error('Order failed');
      }
    });
  }
}