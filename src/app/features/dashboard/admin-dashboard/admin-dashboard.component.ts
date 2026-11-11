import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TicketService } from '../../../core/services/ticket.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { TicketResponseDto } from '../../../core/models/ticket.models';
import { UserListItemDto } from '../../../core/models/user.models';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-admin-dashboard',
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
      <!-- Top Action & Welcome Bar -->
      <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <h1 class="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              Good day, {{ authService.currentUser()?.email?.split('@')?.[0] || 'Administrator' }}
            </h1>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200/60">
              Admin View
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-500">
            Real-time telemetry and overview of your enterprise support fleet.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <div class="flex items-center bg-white border border-slate-200/80 shadow-sm rounded-xl px-3 py-1.5 text-slate-700 text-xs font-medium">
            <span class="material-symbols-outlined text-[16px] text-slate-400 mr-2">calendar_today</span>
            <span>Live System Metrics</span>
          </div>
          <a
            routerLink="/tickets"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-700 transition-colors"
          >
            <span class="material-symbols-outlined text-[16px] text-slate-500">inbox</span>
            <span>View All Tickets</span>
          </a>
          <a
            routerLink="/users"
            class="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm hover:bg-indigo-700 transition-all"
          >
            <span class="material-symbols-outlined text-[16px]">group</span>
            <span>Manage Users</span>
          </a>
        </div>
      </section>

      <!-- 4-Up Metric Summary Cockpit -->
      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <app-kpi-card
          title="Total Tickets"
          [value]="totalTicketsCount()"
          icon="confirmation_number"
          iconType="primary"
          subtitle="All-time support tickets"
          [isLoading]="isLoadingMetrics()"
        />

        <app-kpi-card
          title="Open Tickets"
          [value]="openTicketsCount()"
          icon="schedule"
          iconType="amber"
          subtitle="Pending assignment or reply"
          [isLoading]="isLoadingMetrics()"
        />

        <app-kpi-card
          title="In Progress"
          [value]="inProgressTicketsCount()"
          icon="sync"
          iconType="secondary"
          subtitle="Active agent triage"
          [isLoading]="isLoadingMetrics()"
        />

        <app-kpi-card
          title="Resolved Tickets"
          [value]="resolvedTicketsCount()"
          icon="check_circle"
          iconType="emerald"
          subtitle="Successfully fulfilled"
          [isLoading]="isLoadingMetrics()"
        />
      </section>

      <!-- Analytics & Team Overview Section (Dual Cards) -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Ticket Volume Breakdown (7 Cols) -->
        <div class="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 class="text-base font-bold text-slate-900">Ticket Status Distribution</h2>
              <p class="text-xs text-slate-500">Real-time status breakdown across open fleet</p>
            </div>
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700">Live API</span>
          </div>

          <!-- Bar visualization based on actual counts -->
          <div class="my-6 space-y-4">
            <div>
              <div class="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-indigo-500"></span> Open
                </span>
                <span class="font-semibold text-slate-900">{{ openTicketsCount() }}</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div class="bg-indigo-600 h-full rounded-full transition-all duration-500" [style.width.%]="getPercentage(openTicketsCount())"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span> In Progress
                </span>
                <span class="font-semibold text-slate-900">{{ inProgressTicketsCount() }}</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div class="bg-amber-500 h-full rounded-full transition-all duration-500" [style.width.%]="getPercentage(inProgressTicketsCount())"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Resolved / Closed
                </span>
                <span class="font-semibold text-slate-900">{{ resolvedTicketsCount() }}</span>
              </div>
              <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" [style.width.%]="getPercentage(resolvedTicketsCount())"></div>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Calculated from total {{ totalTicketsCount() }} backend records</span>
            <a routerLink="/tickets" class="font-semibold text-indigo-600 hover:text-indigo-700">Open Tickets Table →</a>
          </div>
        </div>

        <!-- Support Team Overview (5 Cols) -->
        <div class="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 class="text-base font-bold text-slate-900">Support Team Roster</h2>
              <p class="text-xs text-slate-500">Active assigned triage agents</p>
            </div>
            <a routerLink="/users" class="text-xs font-semibold text-indigo-600 hover:underline">+ Add Agent</a>
          </div>

          <div class="my-4 divide-y divide-slate-100">
            @if (isLoadingAgents()) {
              <div class="space-y-3 py-2">
                <div class="h-10 bg-slate-100 rounded-lg animate-pulse"></div>
                <div class="h-10 bg-slate-100 rounded-lg animate-pulse"></div>
              </div>
            } @else if (agents().length === 0) {
              <div class="py-6 text-center text-xs text-slate-400">
                No active support agents found in directory.
              </div>
            } @else {
              @for (agent of agents().slice(0, 4); track agent.id) {
                <div class="py-3 flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                      {{ agent.fullName ? agent.fullName.substring(0, 2).toUpperCase() : 'AG' }}
                    </div>
                    <div>
                      <h4 class="text-xs font-semibold text-slate-900">{{ agent.fullName }}</h4>
                      <p class="text-[11px] text-slate-400">{{ agent.email }}</p>
                    </div>
                  </div>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        [ngClass]="agent.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-slate-100 text-slate-600'">
                    <span class="w-1.5 h-1.5 rounded-full" [ngClass]="agent.isActive ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                    {{ agent.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              }
            }
          </div>

          <div class="pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
            <span>{{ agents().length }} Agents Registered</span>
            <a routerLink="/users" class="font-semibold text-indigo-600 hover:text-indigo-700">View Roster →</a>
          </div>
        </div>
      </section>

      <!-- Recent Tickets Table Section -->
      <section class="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-bold text-slate-900">Recent Support Tickets</h2>
            <p class="text-xs text-slate-500">Latest tickets submitted to the platform</p>
          </div>
          <a
            routerLink="/tickets"
            class="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>View all tickets</span>
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>

        @if (isLoadingTickets()) {
          <app-loading-skeleton type="table" />
        } @else if (recentTickets().length === 0) {
          <app-empty-state
            icon="inbox"
            title="No tickets created yet"
            description="When tickets are submitted by employees, they will appear here in real time."
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
                  <th class="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs">
                @for (ticket of recentTickets(); track ticket.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors cursor-pointer" [routerLink]="['/tickets', ticket.id]">
                    <td class="py-3 px-4 font-medium text-slate-900">
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-[11px] text-slate-400 font-normal">#{{ ticket.id }}</span>
                        <span class="font-semibold text-slate-900 line-clamp-1 max-w-xs">{{ ticket.title }}</span>
                      </div>
                    </td>
                    <td class="py-3 px-4 text-slate-600">
                      {{ ticket.categoryName || 'Support' }}
                    </td>
                    <td class="py-3 px-4">
                      <app-priority-badge [priority]="ticket.priority" />
                    </td>
                    <td class="py-3 px-4">
                      <app-status-badge [status]="ticket.status" />
                    </td>
                    <td class="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {{ ticket.createdAt | date:'short' }}
                    </td>
                    <td class="py-3 px-4 text-right">
                      <button
                        type="button"
                        [routerLink]="['/tickets', ticket.id]"
                        class="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View Details"
                      >
                        <span class="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
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
export class AdminDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private ticketService = inject(TicketService);
  private userService = inject(UserService);

  totalTicketsCount = signal(0);
  openTicketsCount = signal(0);
  inProgressTicketsCount = signal(0);
  resolvedTicketsCount = signal(0);

  isLoadingMetrics = signal(true);
  isLoadingTickets = signal(true);
  isLoadingAgents = signal(true);

  recentTickets = signal<TicketResponseDto[]>([]);
  agents = signal<UserListItemDto[]>([]);

  ngOnInit(): void {
    this.loadMetricsAndTickets();
    this.loadAgents();
  }

  loadMetricsAndTickets(): void {
    this.isLoadingMetrics.set(true);
    this.isLoadingTickets.set(true);

    // Call getAllTickets to get recent tickets and totalCount
    this.ticketService.getAllTickets({ pageNumber: 1, pageSize: 6 }).pipe(
      catchError(() => of({ items: [], pageNumber: 1, pageSize: 6, totalCount: 0, totalPages: 0 }))
    ).subscribe(result => {
      this.recentTickets.set(result.items);
      this.totalTicketsCount.set(result.totalCount);
      this.isLoadingTickets.set(false);

      // Now query counts for status breakdowns (Open, InProgress, Resolved)
      forkJoin({
        open: this.ticketService.getAllTickets({ status: 'Open', pageSize: 1 }).pipe(catchError(() => of({ totalCount: 0 }))),
        inProgress: this.ticketService.getAllTickets({ status: 'InProgress', pageSize: 1 }).pipe(catchError(() => of({ totalCount: 0 }))),
        resolved: this.ticketService.getAllTickets({ status: 'Resolved', pageSize: 1 }).pipe(catchError(() => of({ totalCount: 0 })))
      }).subscribe(breakdowns => {
        this.openTicketsCount.set(breakdowns.open.totalCount);
        this.inProgressTicketsCount.set(breakdowns.inProgress.totalCount);
        this.resolvedTicketsCount.set(breakdowns.resolved.totalCount);
        this.isLoadingMetrics.set(false);
      });
    });
  }

  loadAgents(): void {
    this.isLoadingAgents.set(true);
    this.userService.getUsers({ role: 'Agent', pageSize: 10 }).pipe(
      catchError(() => of({ items: [], pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 0 }))
    ).subscribe(res => {
      this.agents.set(res.items);
      this.isLoadingAgents.set(false);
    });
  }

  getPercentage(count: number): number {
    const total = this.totalTicketsCount();
    if (!total || total === 0) return 0;
    return Math.min(100, Math.round((count / total) * 100));
  }
}

