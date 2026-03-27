import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../core/services/contact.service';
import { ToastService } from '../../../core/services/toast.service';

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'Unread' | 'Read' | 'Replied';
  createdAt: string;
}

@Component({
  selector: 'app-manage-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">

      <!-- ===== Header ===== -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
            ✉️ Contact Messages
            @if (unreadCount() > 0) {
              <span class="bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {{ unreadCount() }} new
              </span>
            }
          </h1>
          <p class="text-gray-500 text-sm mt-0.5">
            {{ contacts().length }} message{{ contacts().length !== 1 ? 's' : '' }} total
          </p>
        </div>

        <!-- Filter dropdown -->
        <select
          [(ngModel)]="filterStatus"
          (ngModelChange)="loadContacts()"
          class="input-field w-44 text-sm"
        >
          <option value="">All Messages</option>
          <option value="Unread">🔴 Unread</option>
          <option value="Read">🔵 Read</option>
          <option value="Replied">✅ Replied</option>
        </select>
      </div>

      <!-- ===== Stats Row ===== -->
      <div class="grid grid-cols-3 gap-4">
        @for (stat of statusStats(); track stat.label) {
          <div
            class="bg-white rounded-xl p-4 border shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow"
            [class]="filterStatus === stat.value ? 'border-orange-300 bg-orange-50' : 'border-gray-100'"
            (click)="filterStatus = stat.value; loadContacts()"
          >
            <div class="text-2xl font-bold" [class]="stat.color">{{ stat.count }}</div>
            <div class="text-xs text-gray-500 mt-0.5 font-medium">{{ stat.label }}</div>
          </div>
        }
      </div>

      <!-- ===== Messages Table ===== -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

        @if (loading()) {
          <!-- Loading skeleton -->
          <div class="p-10 flex flex-col items-center gap-3">
            <div class="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-gray-400 text-sm">Loading messages...</p>
          </div>

        } @else if (contacts().length === 0) {
          <!-- Empty state -->
          <div class="text-center py-16">
            <div class="text-5xl mb-3">📭</div>
            <h3 class="text-lg font-semibold text-gray-600 mb-1">
              {{ filterStatus ? 'No ' + filterStatus + ' messages' : 'No messages yet' }}
            </h3>
            <p class="text-gray-400 text-sm">
              Contact form submissions will appear here
            </p>
            @if (filterStatus) {
              <button
                (click)="filterStatus = ''; loadContacts()"
                class="mt-4 text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                View all messages →
              </button>
            }
          </div>

        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th class="px-4 py-3 text-left">Sender</th>
                  <th class="px-4 py-3 text-left">Subject</th>
                  <th class="px-4 py-3 text-left">Message Preview</th>
                  <th class="px-4 py-3 text-left">Date</th>
                  <th class="px-4 py-3 text-left">Status</th>
                  <th class="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (msg of contacts(); track msg._id) {
                  <tr
                    class="hover:bg-gray-50 transition-colors"
                    [class]="msg.status === 'Unread' ? 'bg-orange-50/50' : ''"
                  >

                    <!-- Sender -->
                    <td class="px-4 py-3 min-w-[160px]">
                      <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                          {{ msg.name.charAt(0).toUpperCase() }}
                        </div>
                        <div class="min-w-0">
                          <p class="font-semibold text-gray-800 flex items-center gap-1.5 truncate">
                            {{ msg.name }}
                            @if (msg.status === 'Unread') {
                              <span class="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>
                            }
                          </p>
                          <a
                            [href]="'mailto:' + msg.email"
                            class="text-gray-400 text-xs hover:text-orange-500 transition-colors truncate block"
                          >
                            {{ msg.email }}
                          </a>
                          @if (msg.phone) {
                            <p class="text-gray-400 text-xs">📞 {{ msg.phone }}</p>
                          }
                        </div>
                      </div>
                    </td>

                    <!-- Subject -->
                    <td class="px-4 py-3 min-w-[140px]">
                      <span class="inline-block bg-orange-50 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                        {{ msg.subject }}
                      </span>
                    </td>

                    <!-- Message preview -->
                    <td class="px-4 py-3 min-w-[200px] max-w-[240px]">
                      <p class="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                        {{ msg.message }}
                      </p>
                      <button
                        (click)="openDetail(msg)"
                        class="text-orange-500 hover:text-orange-700 text-xs mt-1 font-medium transition-colors"
                      >
                        Read full →
                      </button>
                    </td>

                    <!-- Date -->
                    <td class="px-4 py-3 whitespace-nowrap">
                      <p class="text-gray-600 text-xs">{{ msg.createdAt | date:'MMM d, y' }}</p>
                      <p class="text-gray-400 text-xs">{{ msg.createdAt | date:'h:mm a' }}</p>
                    </td>

                    <!-- Status badge -->
                    <td class="px-4 py-3">
                      <span
                        class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                        [class]="statusBadgeClass(msg.status)"
                      >
                        {{ statusIcon(msg.status) }} {{ msg.status }}
                      </span>
                    </td>

                    <!-- Actions -->
                    <td class="px-4 py-3 min-w-[130px]">
                      <div class="flex flex-col gap-2">

                        <!-- Status change dropdown -->
                        <select
                          [value]="msg.status"
                          (change)="updateStatus(msg, $any($event.target).value)"
                          class="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none bg-white w-full"
                        >
                          <option value="Unread">🔴 Unread</option>
                          <option value="Read">🔵 Read</option>
                          <option value="Replied">✅ Replied</option>
                        </select>

                        <div class="flex gap-1">
                          <!-- View button -->
                          <button
                            (click)="openDetail(msg)"
                            class="flex-1 text-center text-blue-500 hover:text-blue-700 text-xs font-medium hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                          >
                            👁 View
                          </button>
                          <!-- Delete button -->
                          <button
                            (click)="deleteContact(msg)"
                            class="flex-1 text-center text-red-400 hover:text-red-600 text-xs font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
                          >
                            🗑 Del
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>

    <!-- ===== Detail Modal ===== -->
    @if (selectedMsg()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        (click)="selectedMsg.set(null)"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <!-- Modal card -->
        <div
          class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
          (click)="$event.stopPropagation()"
        >
          <!-- Modal header -->
          <div class="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
            <h2 class="font-bold text-gray-800 text-lg">Message Details</h2>
            <button
              (click)="selectedMsg.set(null)"
              class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-xl"
            >
              &times;
            </button>
          </div>

          <!-- Modal body -->
          <div class="p-6 space-y-5">

            <!-- Sender card -->
            <div class="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div class="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xl flex-shrink-0">
                {{ selectedMsg()!.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="font-bold text-gray-800 text-base">{{ selectedMsg()!.name }}</p>
                <a
                  [href]="'mailto:' + selectedMsg()!.email"
                  class="text-orange-500 text-sm hover:underline block"
                >
                  {{ selectedMsg()!.email }}
                </a>
                @if (selectedMsg()!.phone) {
                  <p class="text-gray-500 text-sm mt-0.5">
                    📞 {{ selectedMsg()!.phone }}
                  </p>
                }
              </div>
            </div>

            <!-- Subject + Date row -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1.5">Subject</p>
                <span class="inline-block bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1 rounded-full">
                  {{ selectedMsg()!.subject }}
                </span>
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1.5">Received On</p>
                <p class="text-sm text-gray-700 font-medium">
                  {{ selectedMsg()!.createdAt | date:'MMM d, y' }}
                </p>
                <p class="text-xs text-gray-400">
                  {{ selectedMsg()!.createdAt | date:'h:mm a' }}
                </p>
              </div>
            </div>

            <!-- Full message -->
            <div>
              <p class="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-2">Message</p>
              <div class="bg-gray-50 rounded-xl p-4 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap border border-gray-100 min-h-[100px]">
                {{ selectedMsg()!.message }}
              </div>
            </div>

            <!-- Current status -->
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p class="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-1">Current Status</p>
                <span
                  class="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
                  [class]="statusBadgeClass(selectedMsg()!.status)"
                >
                  {{ statusIcon(selectedMsg()!.status) }} {{ selectedMsg()!.status }}
                </span>
              </div>

              <!-- Quick status update inside modal -->
              <select
                [value]="selectedMsg()!.status"
                (change)="updateStatusFromModal($any($event.target).value)"
                class="text-xs border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none bg-white"
              >
                <option value="Unread">🔴 Mark Unread</option>
                <option value="Read">🔵 Mark Read</option>
                <option value="Replied">✅ Mark Replied</option>
              </select>
            </div>
          </div>

          <!-- Modal footer -->
          <div class="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex gap-3 rounded-b-2xl">
            <a
              [href]="getMailLink()"
              target="_blank"
              rel="noopener noreferrer"
              (click)="markAsReplied()"
              class="btn-primary flex-1 text-center text-sm py-2.5">
              ✉️ Reply via Email
            </a>
            <button
              (click)="deleteContactFromModal()"
              class="btn-danger flex-shrink-0 text-sm px-4"
            >
              🗑 Delete
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ManageContactsComponent implements OnInit {
  contactService = inject(ContactService);
  toast = inject(ToastService);

  contacts = signal<ContactMessage[]>([]);
  loading = signal(true);
  unreadCount = signal(0);
  selectedMsg = signal<ContactMessage | null>(null);
  filterStatus = '';

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.loading.set(true);
    this.contactService.getAllContacts(this.filterStatus || undefined).subscribe({
      next: (res) => {
        this.contacts.set(res.contacts);
        this.unreadCount.set(res.unreadCount ?? 0);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load messages.');
        this.loading.set(false);
      }
    });
  }

  // ── Stats for the 3 top cards ──────────────────────────────────────────────
  statusStats(): { label: string; count: number; color: string; value: string }[] {
    const all = this.contacts();
    return [
      { label: 'Unread', count: all.filter(c => c.status === 'Unread').length, color: 'text-red-500', value: 'Unread' },
      { label: 'Read', count: all.filter(c => c.status === 'Read').length, color: 'text-blue-500', value: 'Read' },
      { label: 'Replied', count: all.filter(c => c.status === 'Replied').length, color: 'text-green-500', value: 'Replied' },
    ];
  }

  // ── Open detail modal & auto-mark as Read ─────────────────────────────────
  openDetail(msg: ContactMessage): void {
    this.selectedMsg.set(msg);
    if (msg.status === 'Unread') {
      this.updateStatus(msg, 'Read');
    }
  }

  // ── Update status from table row dropdown ─────────────────────────────────
  updateStatus(msg: ContactMessage, newStatus: string): void {
    this.contactService.updateStatus(msg._id, newStatus).subscribe({
      next: () => {
        // Update in list
        this.contacts.update(list =>
          list.map(c => c._id === msg._id ? { ...c, status: newStatus as ContactMessage['status'] } : c)
        );
        // Update inside modal if open
        if (this.selectedMsg()?._id === msg._id) {
          this.selectedMsg.update(m => m ? { ...m, status: newStatus as ContactMessage['status'] } : null);
        }
        // Recalculate unread badge
        this.unreadCount.set(this.contacts().filter(c => c.status === 'Unread').length);
        this.toast.success(`Marked as ${newStatus}`);
      },
      error: (err) => this.toast.error(err.error?.message || 'Status update failed.')
    });
  }

  // ── Update status from inside the modal ───────────────────────────────────
  updateStatusFromModal(newStatus: string): void {
    const msg = this.selectedMsg();
    if (msg) this.updateStatus(msg, newStatus);
  }

  // ── Auto mark Replied when Reply button is clicked ────────────────────────
  markAsReplied(): void {
    const msg = this.selectedMsg();
    if (msg && msg.status !== 'Replied') {
      this.updateStatus(msg, 'Replied');
    }
  }

  // ── Delete from table row ─────────────────────────────────────────────────
  deleteContact(msg: ContactMessage): void {
    if (!confirm(`"${msg.name}" ka message delete karna chahte ho?`)) return;
    this.contactService.deleteContact(msg._id).subscribe({
      next: () => {
        this.contacts.update(list => list.filter(c => c._id !== msg._id));
        this.unreadCount.set(this.contacts().filter(c => c.status === 'Unread').length);
        this.toast.success('Message deleted!');
      },
      error: (err) => this.toast.error(err.error?.message || 'Delete failed.')
    });
  }

  // ── Delete from inside modal ──────────────────────────────────────────────
  deleteContactFromModal(): void {
    const msg = this.selectedMsg();
    if (!msg) return;
    if (!confirm(`"${msg.name}" ka message delete karna chahte ho?`)) return;
    this.contactService.deleteContact(msg._id).subscribe({
      next: () => {
        this.contacts.update(list => list.filter(c => c._id !== msg._id));
        this.unreadCount.set(this.contacts().filter(c => c.status === 'Unread').length);
        this.selectedMsg.set(null);
        this.toast.success('Message deleted!');
      },
      error: (err) => this.toast.error(err.error?.message || 'Delete failed.')
    });
  }

  getMailLink() {
  const msg = this.selectedMsg();
  if (!msg) return '';

  const subject = encodeURIComponent('Re: ' + msg.subject);
  const body = encodeURIComponent('Hello,\n\nRegarding your message...');

  return `mailto:${msg.email}?subject=${subject}&body=${body}`;
}

  // ── Helpers ───────────────────────────────────────────────────────────────
  statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      Unread: 'bg-red-100 text-red-700',
      Read: 'bg-blue-100 text-blue-700',
      Replied: 'bg-green-100 text-green-700'
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }

  statusIcon(status: string): string {
    return ({ Unread: '🔴', Read: '🔵', Replied: '✅' } as Record<string, string>)[status] || '⚪';
  }
}
