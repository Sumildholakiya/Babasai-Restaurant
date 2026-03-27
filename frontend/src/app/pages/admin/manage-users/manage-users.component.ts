import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Users</h1>
        <p class="text-gray-500 text-sm mt-0.5">{{ users().length }} registered users</p>
      </div>

      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        @if (loading()) {
          <div class="p-10 flex justify-center">
            <div class="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (users().length === 0) {
          <div class="text-center py-12 text-gray-400">
            <div class="text-4xl mb-2">👥</div>
            <p>No users registered yet</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th class="px-6 py-3 text-left">User</th>
                  <th class="px-6 py-3 text-left">Email</th>
                  <th class="px-6 py-3 text-left">Role</th>
                  <th class="px-6 py-3 text-left">Joined</th>
                  <th class="px-6 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (user of users(); track user._id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                          {{ user.name.charAt(0).toUpperCase() }}
                        </div>
                        <span class="font-medium text-gray-800">{{ user.name }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-3 text-gray-600">{{ user.email }}</td>
                    <td class="px-6 py-3">
                      <span class="badge"
                        [class]="user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'">
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="px-6 py-3 text-gray-400">{{ getDate(user.createdAt) }}</td>
                    <td class="px-6 py-3">
                      <button (click)="deleteUser(user)"
                        class="text-red-400 hover:text-red-600 text-xs font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors">
                        🗑 Delete
                      </button>
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
export class ManageUsersComponent implements OnInit {
  adminService = inject(AdminService);
  toast        = inject(ToastService);

  users   = signal<AdminUser[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.adminService.getAllUsers().subscribe({
      next: (res) => { this.users.set(res.users); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  }

  deleteUser(user: AdminUser): void {
    if (!confirm('Delete user "' + user.name + '"? This cannot be undone.')) return;
    this.adminService.deleteUser(user._id).subscribe({
      next: () => {
        this.users.update(u => u.filter(x => x._id !== user._id));
        this.toast.success('User deleted!');
      },
      error: (err) => this.toast.error(err.error?.message || 'Delete failed.')
    });
  }
}