import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      @for (toast of toastService.allToasts(); track toast.id) {
        <div
          class="flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium toast-enter"
          [class]="toastClass(toast.type)"
        >
          <span class="text-lg leading-none mt-0.5">{{ toastIcon(toast.type) }}</span>
          <span class="flex-1">{{ toast.message }}</span>
          <button (click)="toastService.remove(toast.id)"
            class="ml-1 opacity-70 hover:opacity-100 transition-opacity text-lg leading-none">&times;</button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);

  toastClass(type: string): string {
    const map: Record<string, string> = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };
    return map[type] || 'bg-gray-700';
  }

  toastIcon(type: string): string {
    const map: Record<string, string> = {
      success: '✓', error: '✕', warning: '⚠', info: 'ℹ'
    };
    return map[type] || 'ℹ';
  }
}
