import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order, OrderStatus } from '../../../models';

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Orders</h1>
          <p class="text-gray-500 text-sm mt-0.5">{{ filteredOrders().length }} orders</p>
        </div>

        <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilter()"
          class="input-field w-44 text-sm">
          <option value="">All Statuses</option>
          @for (s of statuses; track s) {
            <option [value]="s">{{ s }}</option>
          }
        </select>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

        @if (loading()) {
          <div class="p-10 flex justify-center">
            <div class="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }

        @else if (filteredOrders().length === 0) {
          <div class="text-center py-12 text-gray-400">
            <div class="text-4xl mb-2">📦</div>
            <p>No orders found</p>
          </div>
        }

        @else {
          <div class="overflow-x-auto">

            <table class="w-full text-sm">

              <!-- HEAD -->
              <thead class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th class="px-4 py-3 text-left">Order ID</th>
                  <th class="px-4 py-3 text-left">Customer</th>
                  <th class="px-4 py-3 text-left">Address</th>
                  <th class="px-4 py-3 text-left">Items</th>
                  <th class="px-4 py-3 text-left">Total</th>
                  <th class="px-4 py-3 text-left">Date</th>
                  <th class="px-4 py-3 text-left">Status</th>
                  <th class="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>

              <!-- BODY -->
              <tbody class="divide-y divide-gray-50">

                @for (order of filteredOrders(); track order._id) {

                  <tr class="hover:bg-gray-50 transition">

                    <!-- ID -->
                    <td class="px-4 py-3 font-mono text-xs text-gray-600">
                      #{{ order._id.slice(-8).toUpperCase() }}
                    </td>

                    <!-- Customer -->
                    <td class="px-4 py-3">
                      <p class="font-medium text-gray-800">{{ getUserName(order) }}</p>
                      <p class="text-gray-400 text-xs">{{ getUserEmail(order) }}</p>
                    </td>

                    <!-- Address -->
                    <td class="px-4 py-3">
                      <p 
                        class="text-xs text-gray-600 max-w-[180px] truncate cursor-pointer"
                        [title]="order.deliveryAddress">
                        {{ order.deliveryAddress || 'No address' }}
                      </p>
                    </td>

                    <!-- Items -->
                    <td class="px-4 py-3">
                      <div class="max-w-xs">

                        @if (expandedOrder() !== order._id) {

                          @for (item of order.items.slice(0, 2); track $index) {
                            <p class="text-gray-600 text-xs">
                              {{ item.name }} × {{ item.quantity }}
                            </p>
                          }

                          @if (order.items.length > 2) {
                            <button
                              (click)="toggleItems(order._id)"
                              class="text-orange-500 text-xs mt-1 hover:underline">
                              +{{ order.items.length - 2 }} more
                            </button>
                          }

                        } @else {

                          @for (item of order.items; track $index) {
                            <p class="text-gray-600 text-xs">
                              {{ item.name }} × {{ item.quantity }}
                            </p>
                          }

                          <button
                            (click)="toggleItems(order._id)"
                            class="text-gray-400 text-xs mt-1 hover:underline">
                            Show less
                          </button>

                        }

                      </div>
                    </td>

                    <!-- Total -->
                    <td class="px-4 py-3 font-semibold text-orange-500">
                      ₹{{ order.total }}
                    </td>

                    <!-- Date -->
                    <td class="px-4 py-3 text-gray-400 text-xs">
                      {{ order.createdAt | date:'MMM d, y' }}
                    </td>

                    <!-- Status -->
                    <td class="px-4 py-3">
                      <span [class]="statusClass(order.status)">
                        {{ order.status }}
                      </span>
                    </td>

                    <!-- Action -->
                    <td class="px-4 py-3">
                      <select
                        [value]="order.status"
                        (change)="updateStatus(order, $any($event.target).value)"
                        class="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-orange-400 bg-white"
                      >
                        @for (s of statuses; track s) {
                          <option [value]="s">{{ s }}</option>
                        }
                      </select>
                    </td>

                  </tr>
                }

              </tbody>
            </table>

          </div>
        }

      </div>
    </div>
  `
})
export class ManageOrdersComponent implements OnInit {

  adminService = inject(AdminService);
  toast = inject(ToastService);

  orders = signal<Order[]>([]);
  filteredOrders = signal<Order[]>([]);
  loading = signal(true);
  filterStatus = '';
  expandedOrder = signal<string | null>(null);

  statuses: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Preparing',
    'Ready',
    'Delivered',
    'Cancelled'
  ];

  ngOnInit(): void {
    this.adminService.getAllOrders().subscribe({
      next: (res) => {
        this.orders.set(res.orders);
        this.filteredOrders.set(res.orders);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilter(): void {
    if (!this.filterStatus) {
      this.filteredOrders.set(this.orders());
    } else {
      this.filteredOrders.set(
        this.orders().filter(o => o.status === this.filterStatus)
      );
    }
  }

  toggleItems(orderId: string) {
    this.expandedOrder.set(
      this.expandedOrder() === orderId ? null : orderId
    );
  }

  updateStatus(order: Order, newStatus: OrderStatus): void {
    this.adminService.updateOrderStatus(order._id, newStatus).subscribe({
      next: () => {
        this.orders.update(list =>
          list.map(o =>
            o._id === order._id ? { ...o, status: newStatus } : o
          )
        );
        this.applyFilter();
        this.toast.success(`Updated to ${newStatus}`);
      },
      error: (err) => this.toast.error(err.error?.message || 'Update failed')
    });
  }

  getUserName(order: Order): string {
    return (order.user as any)?.name || 'Unknown';
  }

  getUserEmail(order: Order): string {
    return (order.user as any)?.email || '';
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-yellow-100 text-yellow-700 px-2 py-1 rounded',
      Confirmed: 'bg-blue-100 text-blue-700 px-2 py-1 rounded',
      Preparing: 'bg-purple-100 text-purple-700 px-2 py-1 rounded',
      Ready: 'bg-indigo-100 text-indigo-700 px-2 py-1 rounded',
      Delivered: 'bg-green-100 text-green-700 px-2 py-1 rounded',
      Cancelled: 'bg-red-100 text-red-700 px-2 py-1 rounded'
    };
    return map[status] || 'bg-gray-100 px-2 py-1 rounded';
  }
}