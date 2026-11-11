import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-surface-container-lowest border-t border-slate-200/80 rounded-b-xl">
      <div class="text-xs text-slate-500 font-medium">
        Showing
        <span class="font-semibold text-slate-800">{{ startItem }}</span>
        to
        <span class="font-semibold text-slate-800">{{ endItem }}</span>
        of
        <span class="font-semibold text-slate-800">{{ totalCount }}</span>
        entries
      </div>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          (click)="onPageChange(pageNumber - 1)"
          [disabled]="pageNumber <= 1"
          class="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors text-xs font-medium"
        >
          <span class="material-symbols-outlined text-[16px]">chevron_left</span>
          <span>Previous</span>
        </button>

        @for (p of visiblePages; track p) {
          <button
            type="button"
            (click)="onPageChange(p)"
            class="h-8 min-w-[32px] px-2 rounded-lg text-xs font-semibold transition-colors"
            [ngClass]="p === pageNumber
              ? 'bg-primary-container text-white shadow-sm'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
          >
            {{ p }}
          </button>
        }

        <button
          type="button"
          (click)="onPageChange(pageNumber + 1)"
          [disabled]="pageNumber >= totalPages"
          class="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors text-xs font-medium"
        >
          <span>Next</span>
          <span class="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input() pageNumber = 1;
  @Input() pageSize = 10;
  @Input() totalCount = 0;
  @Input() totalPages = 1;

  @Output() pageChanged = new EventEmitter<number>();

  get startItem(): number {
    if (this.totalCount === 0) return 0;
    return (this.pageNumber - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.pageNumber * this.pageSize, this.totalCount);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.pageNumber - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPageChange(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages && newPage !== this.pageNumber) {
      this.pageChanged.emit(newPage);
    }
  }
}

