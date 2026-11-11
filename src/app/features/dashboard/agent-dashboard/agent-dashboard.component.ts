import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { TicketResponseDto } from '../../../core/models/ticket.models';
import { TicketStatus } from '../../../core/constants/enums';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    KpiCardComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Operational Header -->
      <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
        <div class="space-y-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-slate-400">HelpDesk / Agent /</span>
            <span class="text-xs font-semibold text-indigo-600">My Workspace</span>
          </div>
          <div class="flex items-center gap-3 flex-wrap">
            <h1 class="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              Agent Workbench
            </h1>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/50 text-indigo-700 text-xs font-medium shadow-sm">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Shift Active • Available for Triage</span>
            </div>
          </div>
          <p class="text-xs sm:text-sm text-slate-500">
            Manage your active ticket queue, customer communications, and resolution progression.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <a
            routerLink="/tickets"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span class="material-symbols-outlined text-[18px] text-slate-500">inbox</span>
            <span>View Full Queue</span>
          </a>
        </div>
      </section>

      <!-- 4-Up Operational KPI Cards -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-kpi-card
          title="Assigned to Me"
          [value]="assignedTickets().length"
          icon="assignment_ind"
          iconType="primary"
          subtitle="Tickets in your personal queue"
          [isLoading]="isLoading()"
        />

        <app-kpi-card
          title="In Progress"
          [value]="inProgressCount()"
          icon="sync"
          iconType="secondary"
          subtitle="Currently working on"
          [isLoading]="isLoading()"
        />

        <app-kpi-card
          title="Awaiting Start"
          [value]="awaitingStartCount()"
          icon="schedule"
          iconType="amber"
          subtitle="Assigned but not started"
          [isLoading]="isLoading()"
        />

        <app-kpi-card
          title="Resolved by You"
          [value]="resolvedCount()"
          icon="check_circle"
          iconType="emerald"
          subtitle="Completed tickets"
          [isLoading]="isLoading()"
        />
      </section>

      <!-- Active Work Queue -->
      <section class="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-bold text-slate-900">My Assigned Tickets Queue</h2>
            <p class="text-xs text-slate-500">Tickets assigned to your user account from triage</p>
          </div>
          <span class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
            {{ assignedTickets().length }} Active in Queue
          </span>
        </div>

        @if (isLoading()) {
          <app-loading-skeleton type="table" />
        } @else if (assignedTickets().length === 0) {
          <app-empty-state
            icon="task_alt"
            title="Queue is all clear!"
            description="You currently have no pending tickets assigned to you. Check the unassigned queue to claim tickets."
            actionLabel="View Queue"
            (actionClicked)="goToQueue()"
          />
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                  <th class="py-3 px-4">Ticket</th>
                  <th class="py-3 px-4">Category</th>
                  <th class="py-3 px-4">Priority</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4">Created Date</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs">
                @for (ticket of assignedTickets(); track ticket.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors cursor-pointer" [routerLink]="['/tickets', ticket.id]">
                    <td class="py-3.5 px-4 font-medium text-slate-900">
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-[11px] text-slate-400 font-normal">#{{ ticket.id }}</span>
                        <span class="font-semibold text-slate-900 line-clamp-1 max-w-sm">{{ ticket.title }}</span>
                      </div>
                    </td>
                    <td class="py-3.5 px-4 text-slate-600">
                      {{ ticket.categoryName || 'Support' }}
                    </td>
                    <td class="py-3.5 px-4">
                      <app-priority-badge [priority]="ticket.priority" />
                    </td>
                    <td class="py-3.5 px-4">
                      <app-status-badge [status]="ticket.status" />
                    </td>
                    <td class="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {{ ticket.createdAt | date:'short' }}
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <a
                        [routerLink]="['/tickets', ticket.id]"
                        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs transition-colors"
                      >
                        <span>Open Details</span>
                        <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </div>
  `
})
export class AgentDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private ticketService = inject(TicketService);

  assignedTickets = signal<TicketResponseDto[]>([]);
  isLoading = signal(true);

  get inProgressCount(): () => number {
    return () => this.assignedTickets().filter(t => t.status === TicketStatus.InProgress).length;
  }

  get awaitingStartCount(): () => number {
    return () => this.assignedTickets().filter(t => t.status === TicketStatus.Assigned || t.status === TicketStatus.Open).length;
  }

  get resolvedCount(): () => number {
    return () => this.assignedTickets().filter(t => t.status === TicketStatus.Resolved || t.status === TicketStatus.Closed).length;
  }

  ngOnInit(): void {
    this.loadAssignedTickets();
  }

  loadAssignedTickets(): void {
    this.isLoading.set(true);
    this.ticketService.getMyTickets().pipe(
      catchError(() => of([]))
    ).subscribe(tickets => {
      console.log(tickets);
      this.assignedTickets.set(tickets);
      this.isLoading.set(false);
    });
  }

  goToQueue(): void {
    // Navigate to /tickets
  }
}

