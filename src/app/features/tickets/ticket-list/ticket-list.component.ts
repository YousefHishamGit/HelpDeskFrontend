import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
import { TicketService } from '../../../core/services/ticket.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { TicketResponseDto, TicketQueryParametersDto } from '../../../core/models/ticket.models';
import { UserListItemDto } from '../../../core/models/user.models';
import { TicketPriority, TicketStatus } from '../../../core/constants/enums';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    PaginationComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Breadcrumb & Top Page Header -->
      <section class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>Operations</span>
            <span>/</span>
            <span class="text-indigo-600 font-semibold">Tickets</span>
          </div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">Tickets Management</h1>
            <span class="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold">
              Live Fleet
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-500">
            Search, filter, prioritize, and manage support tickets across your enterprise in real time.
          </p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          @if (authService.isEmployee()) {
            <a
              routerLink="/tickets/create"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md hover:bg-indigo-700 transition-colors"
            >
              <span class="material-symbols-outlined text-[18px]">add</span>
              <span>Create Ticket</span>
            </a>
          }
        </div>
      </section>

      <!-- Filter Controls & Search Strip -->
      <section class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <span class="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-[18px]">search</span>
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search tickets by title or description..."
            class="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
          />
        </div>

        <!-- Filter Dropdowns -->
        <div class="flex items-center gap-3 flex-wrap">
          <!-- Status Filter -->
          <div class="flex items-center gap-1.5 text-xs">
            <label class="font-medium text-slate-500">Status:</label>
            <select
              [ngModel]="selectedStatus()"
              (ngModelChange)="onStatusChange($event)"
              class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="InProgress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <!-- Priority Filter -->
          <div class="flex items-center gap-1.5 text-xs">
            <label class="font-medium text-slate-500">Priority:</label>
            <select
              [ngModel]="selectedPriority()"
              (ngModelChange)="onPriorityChange($event)"
              class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <!-- Reset Filter -->
          @if (hasActiveFilters()) {
            <button
              type="button"
              (click)="resetFilters()"
              class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Reset
            </button>
          }
        </div>
      </section>

      <!-- Tickets Data Table -->
      <section class="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        @if (isLoading()) {
          <app-loading-skeleton type="table" />
        } @else if (tickets().length === 0) {
          <app-empty-state
            icon="search_off"
            title="No tickets match your query"
            description="Try adjusting your search terms or clearing your status/priority filters."
            [actionLabel]="authService.isEmployee() ? 'Create Ticket' : ''"
            (actionClicked)="goToCreate()"
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
                @for (ticket of tickets(); track ticket.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors cursor-pointer" [routerLink]="['/tickets', ticket.id]">
                    <td class="py-3.5 px-4 font-medium text-slate-900">
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-[11px] text-slate-400 font-normal">#{{ ticket.id }}</span>
                        <div>
                          <div class="font-semibold text-slate-900 line-clamp-1 max-w-md">{{ ticket.title }}</div>
                          <div class="text-[11px] text-slate-400 line-clamp-1 max-w-md">{{ ticket.description }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="py-3.5 px-4 text-slate-600">
                      <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {{ ticket.categoryName || 'Support' }}
                      </span>
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
                    <td class="py-3.5 px-4 text-right" (click)="$event.stopPropagation()">
                      <div class="flex items-center justify-end gap-1">
                        @if (authService.isAdmin() && ticket.status !== 4) {
                          <button
                            type="button"
                            (click)="openAssignModal(ticket)"
                            class="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                            title="Assign Agent"
                          >
                            Assign
                          </button>
                        }
                        <a
                          [routerLink]="['/tickets', ticket.id]"
                          class="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View Details"
                        >
                          <span class="material-symbols-outlined text-[18px]">chevron_right</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <app-pagination
            [pageNumber]="pageNumber()"
            [pageSize]="pageSize()"
            [totalCount]="totalCount()"
            [totalPages]="totalPages()"
            (pageChanged)="onPageChange($event)"
          />
        }
      </section>

      <!-- Assign Agent Modal (Admin only) -->
      @if (selectedTicketForAssign()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 overflow-hidden">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="text-base font-bold text-slate-900">
                Assign Agent to Ticket #{{ selectedTicketForAssign()?.id }}
              </h3>
              <button type="button" (click)="selectedTicketForAssign.set(null)" class="text-slate-400 hover:text-slate-600">
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p class="text-xs text-slate-500 mt-2 mb-4">
              Select an active support agent to take ownership of this ticket.
            </p>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Available Agents
                </label>
                <select
                  [(ngModel)]="selectedAgentId"
                  class="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  <option [ngValue]="null">Select an agent...</option>
                  @for (agent of agentsList(); track agent.id) {
                    <option [ngValue]="agent.id">{{ agent.fullName }} ({{ agent.email }})</option>
                  }
                </select>
              </div>

              <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  (click)="selectedTicketForAssign.set(null)"
                  class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  (click)="confirmAssign()"
                  [disabled]="!selectedAgentId || isSubmittingAssign()"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  @if (isSubmittingAssign()) {
                    <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  }
                  <span>Confirm Assignment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class TicketListComponent implements OnInit {
  authService = inject(AuthService);
  private ticketService = inject(TicketService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  tickets = signal<TicketResponseDto[]>([]);
  totalCount = signal(0);
  totalPages = signal(1);
  pageNumber = signal(1);
  pageSize = signal(10);
  searchQuery = signal('');
  selectedStatus = signal('');
  selectedPriority = signal('');
  isLoading = signal(true);

  private searchSubject = new Subject<string>();

  // Assign agent modal state
  selectedTicketForAssign = signal<TicketResponseDto | null>(null);
  agentsList = signal<UserListItemDto[]>([]);
  selectedAgentId: number | null = null;
  isSubmittingAssign = signal(false);

  ngOnInit(): void {
    // Read query params from URL if present
    this.route.queryParams.subscribe(params => {
      if (params['page']) this.pageNumber.set(Number(params['page']));
      if (params['search']) this.searchQuery.set(params['search']);
      if (params['status']) this.selectedStatus.set(params['status']);
      if (params['priority']) this.selectedPriority.set(params['priority']);
      this.loadTickets();
    });

    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.pageNumber.set(1);
      this.updateUrlAndReload();
    });

    // Preload agents if Admin
    if (this.authService.isAdmin()) {
      this.userService.getUsers({ role: 'Agent', pageSize: 50 }).pipe(
        catchError(() => of({ items: [], pageNumber: 1, pageSize: 50, totalCount: 0, totalPages: 0 }))
      ).subscribe(res => {
        this.agentsList.set(res.items.filter(a => a.isActive));
      });
    }
  }

  loadTickets(): void {
    this.isLoading.set(true);

    const queryParams: TicketQueryParametersDto = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
      search: this.searchQuery() || undefined,
      status: this.selectedStatus() || undefined,
      priority: this.selectedPriority() || undefined
    };

    // If Admin, call getAllTickets (PagedResultDto)
    // If Agent/Employee without admin permissions, call getMyTickets
    if (this.authService.isAdmin()) {
      this.ticketService.getAllTickets(queryParams).pipe(
        catchError(err => {
          this.toastService.error('Failed to load tickets list');
          return of({ items: [], pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 0 });
        })
      ).subscribe(result => {
        this.tickets.set(result.items);
        this.totalCount.set(result.totalCount);
        this.totalPages.set(result.totalPages);
        this.isLoading.set(false);
      });
    } else {
      this.ticketService.getMyTickets().pipe(
        catchError(err => {
          this.toastService.error('Failed to load your tickets');
          return of([]);
        })
      ).subscribe(items => {
        let filtered = items;
        if (this.searchQuery()) {
          const q = this.searchQuery().toLowerCase();
          filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
        }
        if (this.selectedStatus()) {
          filtered = filtered.filter(t => TicketStatus[t.status]?.toLowerCase() === this.selectedStatus().toLowerCase());
        }
        if (this.selectedPriority()) {
          filtered = filtered.filter(t => TicketPriority[t.priority]?.toLowerCase() === this.selectedPriority().toLowerCase());
        }
        this.tickets.set(filtered);
        this.totalCount.set(filtered.length);
        this.totalPages.set(1);
        this.isLoading.set(false);
      });
    }
  }

  onSearchChange(val: string): void {
    this.searchSubject.next(val);
  }

  onStatusChange(val: string): void {
    this.selectedStatus.set(val);
    this.pageNumber.set(1);
    this.updateUrlAndReload();
  }

  onPriorityChange(val: string): void {
    this.selectedPriority.set(val);
    this.pageNumber.set(1);
    this.updateUrlAndReload();
  }

  onPageChange(newPage: number): void {
    this.pageNumber.set(newPage);
    this.updateUrlAndReload();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery() || this.selectedStatus() || this.selectedPriority());
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('');
    this.selectedPriority.set('');
    this.pageNumber.set(1);
    this.updateUrlAndReload();
  }

  private updateUrlAndReload(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.pageNumber() > 1 ? this.pageNumber() : null,
        search: this.searchQuery() || null,
        status: this.selectedStatus() || null,
        priority: this.selectedPriority() || null
      },
      queryParamsHandling: 'merge'
    });
  }

  openAssignModal(ticket: TicketResponseDto): void {
    this.selectedTicketForAssign.set(ticket);
    this.selectedAgentId = null;
  }

  confirmAssign(): void {
    const ticket = this.selectedTicketForAssign();
    if (!ticket || !this.selectedAgentId) return;

    this.isSubmittingAssign.set(true);
    this.ticketService.assignTicket(ticket.id, this.selectedAgentId).subscribe({
      next: () => {
        this.isSubmittingAssign.set(false);
        this.selectedTicketForAssign.set(null);
        this.toastService.success(`Ticket #${ticket.id} assigned successfully`);
        this.loadTickets();
      },
      error: () => {
        this.isSubmittingAssign.set(false);
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/tickets/create']);
  }
}

