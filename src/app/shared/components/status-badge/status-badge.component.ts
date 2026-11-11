import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketStatus, TicketStatusLabels } from '../../../core/constants/enums';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider"
      [ngClass]="badgeClass"
    >
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="dotClass"></span>
      {{ label }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() status!: TicketStatus | number | string;

  get numericStatus(): TicketStatus {
    if (typeof this.status === 'string') {
      const parsed = parseInt(this.status, 10);
      if (!isNaN(parsed)) return parsed;
      // String name fallback
      switch (this.status.toLowerCase()) {
        case 'open': return TicketStatus.Open;
        case 'assigned': return TicketStatus.Assigned;
        case 'inprogress':
        case 'in progress': return TicketStatus.InProgress;
        case 'resolved': return TicketStatus.Resolved;
        case 'closed': return TicketStatus.Closed;
        default: return TicketStatus.Open;
      }
    }
    return this.status ?? TicketStatus.Open;
  }

  get label(): string {
    return TicketStatusLabels[this.numericStatus] ?? 'Unknown';
  }

  get badgeClass(): string {
    switch (this.numericStatus) {
      case TicketStatus.Open:
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200/60';
      case TicketStatus.Assigned:
        return 'bg-purple-50 text-purple-700 border border-purple-200/60';
      case TicketStatus.InProgress:
        return 'bg-amber-50 text-amber-700 border border-amber-200/60';
      case TicketStatus.Resolved:
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
      case TicketStatus.Closed:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  get dotClass(): string {
    switch (this.numericStatus) {
      case TicketStatus.Open:
        return 'bg-indigo-600';
      case TicketStatus.Assigned:
        return 'bg-purple-600';
      case TicketStatus.InProgress:
        return 'bg-amber-500 animate-pulse';
      case TicketStatus.Resolved:
        return 'bg-emerald-500';
      case TicketStatus.Closed:
        return 'bg-slate-400';
      default:
        return 'bg-slate-400';
    }
  }
}

