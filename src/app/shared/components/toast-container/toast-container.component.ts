import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all duration-200 animate-slide-up"
          [ngClass]="getToastStyles(toast.type)"
        >
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-[20px]">
              {{ getIcon(toast.type) }}
            </span>
            <span class="leading-snug">{{ toast.message }}</span>
          </div>
          <button
            type="button"
            (click)="toastService.remove(toast.id)"
            class="text-current opacity-60 hover:opacity-100 p-1"
          >
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  getToastStyles(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-slate-900 text-white border-slate-800';
      case 'error':
        return 'bg-rose-950 text-rose-50 border-rose-800';
      case 'warning':
        return 'bg-amber-950 text-amber-50 border-amber-800';
      case 'info':
        return 'bg-slate-900 text-white border-slate-800';
      default:
        return 'bg-slate-900 text-white border-slate-800';
    }
  }
}

