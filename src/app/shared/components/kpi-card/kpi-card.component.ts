import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between border border-slate-200/60">
      <div class="flex items-start justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ title }}</span>
          <div class="text-3xl font-bold tracking-tight text-slate-900 mt-2 leading-none">
            @if (isLoading) {
              <div class="h-8 w-20 bg-slate-200 animate-pulse rounded"></div>
            } @else {
              {{ value }}
            }
          </div>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" [ngClass]="iconContainerClass">
          <span class="material-symbols-outlined text-[20px]">{{ icon }}</span>
        </div>
      </div>

      <div class="flex items-center gap-2 mt-4 text-xs">
        @if (trendText) {
          <span class="inline-flex items-center gap-0.5 font-medium" [ngClass]="trendColorClass">
            @if (trendIcon) {
              <span class="material-symbols-outlined text-[14px]">{{ trendIcon }}</span>
            }
            {{ trendText }}
          </span>
        }
        @if (subtitle) {
          <span class="text-slate-500 truncate">{{ subtitle }}</span>
        }
      </div>

      <!-- Subtle background ambient orb -->
      <div class="absolute -right-6 -bottom-6 w-20 h-20 rounded-full opacity-10 pointer-events-none" [ngClass]="orbClass"></div>
    </div>
  `
})
export class KpiCardComponent {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() icon = 'analytics';
  @Input() iconType: 'primary' | 'amber' | 'emerald' | 'secondary' | 'rose' = 'primary';
  @Input() trendText = '';
  @Input() trendIcon = '';
  @Input() trendType: 'positive' | 'negative' | 'neutral' = 'neutral';
  @Input() subtitle = '';
  @Input() isLoading = false;

  get iconContainerClass(): string {
    switch (this.iconType) {
      case 'primary': return 'bg-indigo-50 text-indigo-700';
      case 'amber': return 'bg-amber-100 text-amber-700';
      case 'emerald': return 'bg-emerald-100 text-emerald-700';
      case 'secondary': return 'bg-purple-100 text-purple-700';
      case 'rose': return 'bg-rose-100 text-rose-700';
      default: return 'bg-indigo-50 text-indigo-700';
    }
  }

  get trendColorClass(): string {
    switch (this.trendType) {
      case 'positive': return 'text-emerald-600';
      case 'negative': return 'text-rose-600';
      default: return 'text-slate-600';
    }
  }

  get orbClass(): string {
    switch (this.iconType) {
      case 'primary': return 'bg-primary-container';
      case 'amber': return 'bg-amber-500';
      case 'emerald': return 'bg-emerald-500';
      case 'secondary': return 'bg-purple-500';
      case 'rose': return 'bg-rose-500';
      default: return 'bg-primary-container';
    }
  }
}

