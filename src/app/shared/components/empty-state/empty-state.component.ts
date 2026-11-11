import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed border-slate-200">
      <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-primary-container flex items-center justify-center mb-4">
        <span class="material-symbols-outlined text-[28px]">{{ icon }}</span>
      </div>
      <h3 class="text-base font-bold text-slate-800">{{ title }}</h3>
      <p class="mt-1 text-sm text-slate-500 max-w-sm">{{ description }}</p>
      @if (actionLabel) {
        <button
          type="button"
          (click)="actionClicked.emit()"
          class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-primary-container hover:bg-primary transition-colors shadow-sm"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          <span>{{ actionLabel }}</span>
        </button>
      }
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'No records found';
  @Input() description = 'There is currently no data matching your criteria.';
  @Input() actionLabel = '';

  @Output() actionClicked = new EventEmitter<void>();
}

