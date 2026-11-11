import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-pulse space-y-4 w-full p-4">
      @if (type === 'table') {
        <div class="h-10 bg-slate-100 rounded-lg w-full"></div>
        <div class="space-y-2">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="h-12 bg-slate-50 border border-slate-100 rounded-lg flex items-center px-4 gap-4">
              <div class="h-4 bg-slate-200 rounded w-16"></div>
              <div class="h-4 bg-slate-200 rounded flex-1"></div>
              <div class="h-4 bg-slate-200 rounded w-24"></div>
              <div class="h-4 bg-slate-200 rounded w-20"></div>
            </div>
          }
        </div>
      } @else if (type === 'card') {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="h-28 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div class="flex justify-between items-center">
                <div class="h-3 bg-slate-200 rounded w-20"></div>
                <div class="h-8 w-8 bg-slate-200 rounded-lg"></div>
              </div>
              <div class="h-7 bg-slate-200 rounded w-16"></div>
            </div>
          }
        </div>
      } @else {
        <div class="h-4 bg-slate-200 rounded w-3/4"></div>
        <div class="h-4 bg-slate-200 rounded w-1/2"></div>
        <div class="h-20 bg-slate-200 rounded w-full"></div>
      }
    </div>
  `
})
export class LoadingSkeletonComponent {
  @Input() type: 'table' | 'card' | 'details' = 'table';
}

