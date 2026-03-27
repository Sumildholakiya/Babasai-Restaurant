import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { DashboardStats, Order } from '../../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">

      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p class="text-gray-500 text-sm mt-1">Overview of BabaSai Restaurant</p>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          @for (s of [1,2,3,4]; track s) {
            <div class="bg-white rounded-xl p-5 animate-pulse">
              <div class="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div class="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          }
        </div>
      }

      @else {

        <!-- Top Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          @for (card of statCards(); track card.label) {
            <div class="bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition">
              <div class="flex justify-between mb-3">
                <span class="text-2xl">{{ card.icon }}</span>
                <span class="text-xs px-2 py-1 rounded-full" [class]="card.badgeClass">
                  {{ card.badge }}
                </span>
              </div>
              <p class="text-2xl font-bold">{{ card.value }}</p>
              <p class="text-gray-500 text-sm">{{ card.label }}</p>
            </div>
          }
        </div>

        <!-- Revenue Section -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">

          <!-- Revenue -->
          <div class="md:col-span-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
            <p class="text-sm mb-1">💰 Delivered Revenue</p>
            <p class="text-3xl font-bold">
              ₹{{ deliveredRevenue().toLocaleString('en-IN') }}
            </p>
            <p class="text-xs mt-2 opacity-80">
              From {{ deliveredCount() }} delivered orders
            </p>
          </div>

          <!-- Pending -->
          <div class="bg-white rounded-xl p-5 border shadow-sm">
            <p class="text-gray-500 text-sm mb-1">⏳ Pending Orders</p>
            <p class="text-3xl font-bold text-yellow-500">
              {{ pendingCount() }}
            </p>
            <a routerLink="/admin/orders" class="text-orange-500 text-xs mt-2 block">
              Manage →
            </a>
          </div>

          <!-- Unread -->
          <div class="bg-white rounded-xl p-5 border shadow-sm"
            [class]="(stats()?.unreadContacts || 0) > 0 ? 'border-red-200 bg-red-50/30' : ''">
            <p class="text-gray-500 text-sm mb-1">✉️ Unread Messages</p>
            <p class="text-3xl font-bold"
              [class]="(stats()?.unreadContacts || 0) > 0 ? 'text-red-500' : 'text-gray-400'">
              {{ stats()?.unreadContacts || 0 }}
            </p>
            <a routerLink="/admin/contacts" class="text-orange-500 text-xs mt-2 block">
              View →
            </a>
          </div>

        </div>

        <!-- Recent Orders -->
        <div class="bg-white rounded-xl border shadow-sm overflow-hidden">

          <div class="px-6 py-4 border-b flex justify-between">
            <h2 class="font-semibold">Recent Orders</h2>
            <a routerLink="/admin/orders" class="text-orange-500 text-sm">
              View all →
            </a>
          </div>

          @if (recentOrders().length === 0) {
            <div class="p-10 text-center text-gray-400">No orders yet</div>
          }

          @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">

                <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th class="px-6 py-3 text-left">ID</th>
                    <th class="px-6 py-3 text-left">Customer</th>
                    <th class="px-6 py-3 text-left">Total</th>
                    <th class="px-6 py-3 text-left">Status</th>
                    <th class="px-6 py-3 text-left">Date</th>
                  </tr>
                </thead>

                <tbody class="divide-y">
                  @for (order of recentOrders(); track order._id) {
                    <tr>
                      <td class="px-6 py-3 font-mono text-xs">
                        #{{ order._id.slice(-6).toUpperCase() }}
                      </td>
                      <td class="px-6 py-3">
                        {{ getUserName(order) }}
                      </td>
                      <td class="px-6 py-3 font-semibold text-orange-500">
                        ₹{{ order.total }}
                      </td>
                      <td class="px-6 py-3">
                        <span [class]="statusClass(order.status)">
                          {{ order.status }}
                        </span>
                      </td>
                      <td class="px-6 py-3 text-gray-400">
                        {{ order.createdAt | date:'MMM d, y' }}
                      </td>
                    </tr>
                  }
                </tbody>

              </table>
            </div>
          }

        </div>

      }
    </div>
  `
})
export class DashboardComponent implements OnInit {

  adminService = inject(AdminService);

  stats = signal<DashboardStats | null>(null);
  recentOrders = signal<Order[]>([]);
  loading = signal(true);

  statCards = signal<any[]>([]);

  // ✅ NEW
  deliveredRevenue = signal(0);
  deliveredCount = signal(0);
  pendingCount = signal(0);

  ngOnInit(): void {
    this.adminService.getStats().subscribe({
      next: (res) => {

        this.stats.set(res.stats);
        this.recentOrders.set(res.recentOrders);

        // ✅ FIXED LOGIC
        const delivered = res.recentOrders.filter((o: Order) => o.status === 'Delivered');
        const pending = res.recentOrders.filter((o: Order) => o.status === 'Pending');

        this.deliveredRevenue.set(
          delivered.reduce((sum: number, o: Order) => sum + o.total, 0)
        );
        this.deliveredCount.set(delivered.length);
        this.pendingCount.set(pending.length);

        this.statCards.set([
          { icon: '👥', label: 'Users', value: res.stats.totalUsers, badge: 'Users', badgeClass: 'bg-blue-100 text-blue-700' },
          { icon: '📦', label: 'Orders', value: res.stats.totalOrders, badge: 'Orders', badgeClass: 'bg-orange-100 text-orange-700' },
          { icon: '🍛', label: 'Menu', value: res.stats.totalMenuItems, badge: 'Items', badgeClass: 'bg-green-100 text-green-700' },
          { icon: '⭐', label: 'Reviews', value: res.stats.totalReviews, badge: 'Reviews', badgeClass: 'bg-yellow-100 text-yellow-700' }
        ]);

        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getUserName(order: Order): string {
    return (order.user as any)?.name || 'Unknown';
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'text-yellow-600',
      Confirmed: 'text-blue-600',
      Preparing: 'text-purple-600',
      Ready: 'text-indigo-600',
      Delivered: 'text-green-600',
      Cancelled: 'text-red-600'
    };
    return map[status] || '';
  }
}