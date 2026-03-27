import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container py-10">
      <h1 class="section-title text-3xl mb-8">My Orders</h1>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <div class="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (orders().length === 0) {
        <div class="text-center py-20">
          <div class="text-6xl mb-4">📦</div>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
          <p class="text-gray-400 mb-6">Start by browsing our menu and placing your first order!</p>
          <a routerLink="/menu" class="btn-primary">Browse Menu</a>
        </div>
      } @else {
        <div class="space-y-5">
          @for (order of orders(); track order._id) {
            <div class="card p-6 animate-fade-in">
              <!-- Order header -->
              <div class="flex flex-wrap items-start justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                <div>
                  <p class="text-xs text-gray-400 mb-1">Order ID</p>
                  <p class="font-mono text-sm text-gray-600">#{{ order._id.slice(-8).toUpperCase() }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-1">Date</p>
                  <p class="text-sm text-gray-700">{{ order.createdAt | date:'MMM d, y h:mm a' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-1">Total</p>
                  <p class="text-orange-500 font-bold">₹{{ order.total }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-1">Status</p>
                  <span [class]="statusClass(order.status)">{{ order.status }}</span>
                </div>
              </div>

              <!-- Order items -->
              <div class="space-y-2">
                @for (item of order.items; track $index) {
                  <div class="flex justify-between text-sm text-gray-600">
                    <span>{{ item.name }} <span class="text-gray-400">× {{ item.quantity }}</span></span>
                    <span class="font-medium text-gray-800">₹{{ item.price * item.quantity }}</span>
                  </div>
                }
              </div>

              <!-- Status timeline -->
              <div class="mt-4 pt-4 border-t border-gray-100">
                <div class="flex items-center gap-2 overflow-x-auto pb-1">
                  @for (step of statusSteps; track step) {
                    <div class="flex items-center gap-1 flex-shrink-0">
                      <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                        [class]="isStepDone(order.status, step) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'">
                        {{ isStepDone(order.status, step) ? '✓' : '○' }}
                      </div>
                      <span class="text-xs" [class]="isStepDone(order.status, step) ? 'text-orange-500 font-medium' : 'text-gray-400'">
                        {{ step }}
                      </span>
                      @if (step !== 'Delivered') {
                        <span class="text-gray-200 mx-1">→</span>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class OrdersComponent implements OnInit {
  orderService = inject(OrderService);
  orders = signal<Order[]>([]);
  loading = signal(true);

  statusSteps = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered'];
  statusOrder: Record<string, number> = {
    Pending: 0, Confirmed: 1, Preparing: 2, Ready: 3, Delivered: 4, Cancelled: -1
  };

  ngOnInit(): void {
    this.orderService.getUserOrders().subscribe({
      next: (res) => { this.orders.set(res.orders); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  isStepDone(currentStatus: string, step: string): boolean {
    if (currentStatus === 'Cancelled') return false;
    return this.statusOrder[currentStatus] >= this.statusOrder[step];
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'badge-pending',
      Confirmed: 'badge-confirmed',
      Preparing: 'badge-preparing',
      Ready: 'badge-ready',
      Delivered: 'badge-delivered',
      Cancelled: 'badge-cancelled'
    };
    return map[status] || 'badge';
  }
}
