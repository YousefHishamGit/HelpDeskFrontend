import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide"
      [ngClass]="badgeClass"
    >
      {{ formattedRole }}
    </span>
  `
})
export class RoleBadgeComponent {
  @Input() role: string | number = '';

  get formattedRole(): string {
    if (this.role === 0 || this.role === '0' || String(this.role).toLowerCase() === 'employee') return 'Employee';
    if (this.role === 1 || this.role === '1' || String(this.role).toLowerCase() === 'agent') return 'Agent';
    if (this.role === 2 || this.role === '2' || String(this.role).toLowerCase() === 'admin') return 'Admin';
    return String(this.role || 'User');
  }

  get badgeClass(): string {
    switch (this.formattedRole.toLowerCase()) {
      case 'admin':
        return 'bg-indigo-100 text-indigo-900 border border-indigo-200';
      case 'agent':
        return 'bg-purple-100 text-purple-900 border border-purple-200';
      case 'employee':
        return 'bg-slate-100 text-slate-800 border border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }
}

