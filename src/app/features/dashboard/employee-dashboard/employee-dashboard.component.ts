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
  selector: 'app-employee-dashboard',
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
      <!-- Header & Create Action -->
      <section class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-slate-400">HelpDesk / Employee /</span>
            <span class="text-xs font-semibold text-indigo-600">My Requests</span>
          </div>
          <h1 class="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
            My Support Requests
          </h1>
          <p class="text-xs sm:text-sm text-slate-500">
            Track the progress of your technical requests and communicate with support specialists.
          </p>
        </div>

        <div>
          <a
            routerLink="/tickets/create"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md transition-all duration-150"
          >
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Submit New Ticket</span>
          </a>
        </div>
      </section>

      <!-- Summary Metric Cards -->
      <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <app-kpi-card
          title="Total Requests"
          [value]="myTickets().length"
          icon="receipt_long"
          iconType="primary"
          subtitle="Tickets created by you"
          [isLoading]="isLoading()"
        />

        <app-kpi-card
          title="Active Requests"
          [value]="activeRequestsCount()"
          icon="pending_actions"
          iconType="amber"
          subtitle="Open or in-progress triage"
          [isLoading]="isLoading()"
        />

        <app-kpi-card
          title="Resolved / Closed"
          [value]="resolvedRequestsCount()"
          icon="task_alt"
          iconType="emerald"
          subtitle="Completed requests"
          [isLoading]="isLoading()"
        />
      </section>

      <!-- Support Requests Table -->
      <section class="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-slate-900">Submitted Tickets History</h2>
            <p class="text-xs text-slate-500">Real-time resolution updates from engineering & support</p>
          </div>
          <span class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
            {{ myTickets().length }} Total Records
          </span>
        </div>

        @if (isLoading()) {
          <app-loading-skeleton type="table" />
        } @else if (myTickets().length === 0) {
          <app-empty-state
            icon="support_agent"
            title="No support requests yet"
            description="Whenever you encounter an IT or engineering problem, submit a ticket and our team will resolve it promptly."
            actionLabel="Submit Your First Ticket"
            [routerLink]="['/tickets/create']"
          />
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                  <th class="py-3 px-4">Ticket ID</th>
                  <th class="py-3 px-4">Subject</th>
                  <th class="py-3 px-4">Category</th>
                  <th class="py-3 px-4">Priority</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4">Submitted Date</th>
                  <th class="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs">
                @for (ticket of myTickets(); track ticket.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors cursor-pointer" [routerLink]="['/tickets', ticket.id]">
                    <td class="py-3.5 px-4 font-mono font-semibold text-indigo-600">
                      #{{ ticket.id }}
                    </td>
                    <td class="py-3.5 px-4 font-semibold text-slate-900 max-w-sm">
                      <span class="line-clamp-1">{{ ticket.title }}</span>
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
                        <span>View Status</span>
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
export class EmployeeDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private ticketService = inject(TicketService);

  myTickets = signal<TicketResponseDto[]>([]);
  isLoading = signal(true);

  get activeRequestsCount(): () => number {
    return () => this.myTickets().filter(t => t.status !== TicketStatus.Resolved && t.status !== TicketStatus.Closed).length;
  }

  get resolvedRequestsCount(): () => number {
    return () => this.myTickets().filter(t => t.status === TicketStatus.Resolved || t.status === TicketStatus.Closed).length;
  }

  ngOnInit(): void {
    this.loadMyTickets();
  }

  loadMyTickets(): void {
    this.isLoading.set(true);
    this.ticketService.getMyTickets().pipe(
      catchError(() => of([]))
    ).subscribe(tickets => {
      this.myTickets.set(tickets);
      this.isLoading.set(false);
    });
  }
}

