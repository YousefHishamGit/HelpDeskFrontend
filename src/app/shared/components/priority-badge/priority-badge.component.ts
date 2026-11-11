import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketPriority, TicketPriorityLabels } from '../../../core/constants/enums';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider"
      [ngClass]="badgeClass"
    >
      <span class="material-symbols-outlined text-[13px]">{{ iconName }}</span>
      {{ label }}
    </span>
  `
})
export class PriorityBadgeComponent {
  @Input() priority!: TicketPriority | number | string;

  get numericPriority(): TicketPriority {
    if (typeof this.priority === 'string') {
      const parsed = parseInt(this.priority, 10);
      if (!isNaN(parsed)) return parsed;
      switch (this.priority.toLowerCase()) {
        case 'low': return TicketPriority.Low;
        case 'medium': return TicketPriority.Medium;
        case 'high': return TicketPriority.High;
        case 'critical': return TicketPriority.Critical;
        default: return TicketPriority.Medium;
      }
    }
    return this.priority ?? TicketPriority.Medium;
  }

  get label(): string {
    return TicketPriorityLabels[this.numericPriority] ?? 'Medium';
  }

  get iconName(): string {
    switch (this.numericPriority) {
      case TicketPriority.Low:
        return 'arrow_downward';
      case TicketPriority.Medium:
        return 'drag_handle';
      case TicketPriority.High:
        return 'arrow_upward';
      case TicketPriority.Critical:
        return 'bolt';
      default:
        return 'drag_handle';
    }
  }

  get badgeClass(): string {
    switch (this.numericPriority) {
      case TicketPriority.Low:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
      case TicketPriority.Medium:
        return 'bg-sky-50 text-sky-700 border border-sky-200/60';
      case TicketPriority.High:
        return 'bg-amber-50 text-amber-800 border border-amber-200/60';
      case TicketPriority.Critical:
        return 'bg-rose-50 text-rose-700 border border-rose-200/60';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }
}

