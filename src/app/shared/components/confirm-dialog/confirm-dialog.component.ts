import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all p-6">
          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              [ngClass]="isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'"
            >
              <span class="material-symbols-outlined text-[22px]">
                {{ isDestructive ? 'warning' : 'help' }}
              </span>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-slate-900">{{ title }}</h3>
              <p class="mt-1.5 text-sm text-slate-600 leading-relaxed">{{ message }}</p>
            </div>
          </div>

          <div class="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="onCancel()"
              [disabled]="isLoading"
              class="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              (click)="onConfirm()"
              [disabled]="isLoading"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors shadow-sm disabled:opacity-50"
              [ngClass]="isDestructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-primary-container hover:bg-primary'"
            >
              @if (isLoading) {
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              }
              <span>{{ confirmText }}</span>
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() isDestructive = false;
  @Input() isLoading = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}

