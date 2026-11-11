import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TicketService } from '../../../core/services/ticket.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { TicketDetailsDto, TicketCommentDto } from '../../../core/models/ticket.models';
import { UserListItemDto } from '../../../core/models/user.models';
import { TicketStatus } from '../../../core/constants/enums';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    ConfirmDialogComponent,
    LoadingSkeletonComponent
  ],
  template: `
    <div class="space-y-6">
      @if (isLoading()) {
        <app-loading-skeleton type="details" />
      } @else if (!ticket()) {
        <div class="p-12 text-center bg-white rounded-xl border border-slate-200">
          <span class="material-symbols-outlined text-[40px] text-slate-400">error</span>
          <h2 class="text-base font-bold text-slate-800 mt-2">Ticket Not Found</h2>
          <p class="text-xs text-slate-500 mt-1">The requested ticket does not exist or you do not have permission to view it.</p>
          <a routerLink="/tickets" class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
            Return to Tickets
          </a>
        </div>
      } @else {
        <!-- Top Action Strip & Breadcrumb -->
        <section class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div class="flex items-center gap-2 text-xs font-medium text-slate-500">
            <a routerLink="/tickets" class="text-indigo-600 hover:underline flex items-center gap-1 font-semibold">
              <span class="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Tickets</span>
            </a>
            <span class="text-slate-300">/</span>
            <span>Ticket Details</span>
            <span class="text-slate-300">/</span>
            <span class="font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">#HD-{{ ticket()!.id }}</span>
          </div>

          <!-- Dynamic Lifecycle Actions -->
          <div class="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              (click)="copyTicketId()"
              class="h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span class="material-symbols-outlined text-[16px] text-slate-400">content_copy</span>
              <span>Copy ID</span>
            </button>

            <!-- Agent: Start Ticket -->
            @if (canStartTicket()) {
              <button
                type="button"
                (click)="onStartTicket()"
                [disabled]="isExecutingAction()"
                class="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              >
                <span class="material-symbols-outlined text-[18px]">play_arrow</span>
                <span>Start Ticket</span>
              </button>
            }

            <!-- Agent: Resolve Ticket -->
            @if (canResolveTicket()) {
              <button
                type="button"
                (click)="onResolveTicket()"
                [disabled]="isExecutingAction()"
                class="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              >
                <span class="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Resolve Ticket</span>
              </button>
            }

            <!-- Admin: Assign / Reassign Agent -->
            @if (authService.isAdmin() && ticket()!.status !== 4) {
              <button
                type="button"
                (click)="isAssignModalOpen.set(true)"
                class="h-9 px-3.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold border border-purple-200 transition-colors flex items-center gap-1.5"
              >
                <span class="material-symbols-outlined text-[16px]">person_add</span>
                <span>{{ ticket()!.assignedToId ? 'Reassign' : 'Assign Agent' }}</span>
              </button>
            }

            <!-- Admin: Unassign Agent -->
            @if (authService.isAdmin() && ticket()!.assignedToId && ticket()!.status !== 4) {
              <button
                type="button"
                (click)="onUnassignTicket()"
                [disabled]="isExecutingAction()"
                class="h-9 px-3.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <span class="material-symbols-outlined text-[16px]">person_remove</span>
                <span>Unassign</span>
              </button>
            }

            <!-- Close Ticket (Employee or Admin) -->
            @if (canCloseTicket()) {
              <button
                type="button"
                (click)="isConfirmCloseOpen.set(true)"
                class="h-9 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span class="material-symbols-outlined text-[16px]">lock</span>
                <span>Close Ticket</span>
              </button>
            }
          </div>
        </section>

        <!-- Ticket Title & Meta Chips -->
        <section class="space-y-2">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
              HD-{{ ticket()!.id }}
            </span>
            <app-status-badge [status]="ticket()!.status" />
            <app-priority-badge [priority]="ticket()!.priority" />
            <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-medium">
              {{ ticket()!.categoryName || 'Support' }}
            </span>
            <span class="text-xs text-slate-400">
              Opened by <strong class="text-slate-700">{{ ticket()!.createdByName || 'Requester' }}</strong>
            </span>
          </div>

          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
            {{ ticket()!.title }}
          </h1>
        </section>

        <!-- Lifecycle Progression Pipeline (5 Steps) -->
        <section class="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 items-center">
            <!-- 1. Open -->
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                   [ngClass]="ticket()!.status >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'">
                <span class="material-symbols-outlined text-[14px]">check</span>
              </div>
              <span class="text-xs font-medium" [ngClass]="ticket()!.status === 0 ? 'text-indigo-600 font-bold' : 'text-slate-700'">
                1. Open
              </span>
            </div>

            <!-- 2. Assigned -->
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                   [ngClass]="ticket()!.status >= 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'">
                <span class="material-symbols-outlined text-[14px]">{{ ticket()!.status >= 1 ? 'check' : 'radio_button_unchecked' }}</span>
              </div>
              <span class="text-xs font-medium" [ngClass]="ticket()!.status === 1 ? 'text-indigo-600 font-bold' : 'text-slate-700'">
                2. Assigned
              </span>
            </div>

            <!-- 3. In Progress -->
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                   [ngClass]="ticket()!.status >= 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'">
                <span class="material-symbols-outlined text-[14px]">{{ ticket()!.status >= 2 ? 'check' : 'radio_button_unchecked' }}</span>
              </div>
              <span class="text-xs font-medium" [ngClass]="ticket()!.status === 2 ? 'text-indigo-600 font-bold' : 'text-slate-700'">
                3. In Progress
              </span>
            </div>

            <!-- 4. Resolved -->
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                   [ngClass]="ticket()!.status >= 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'">
                <span class="material-symbols-outlined text-[14px]">{{ ticket()!.status >= 3 ? 'check' : 'radio_button_unchecked' }}</span>
              </div>
              <span class="text-xs font-medium" [ngClass]="ticket()!.status === 3 ? 'text-indigo-600 font-bold' : 'text-slate-700'">
                4. Resolved
              </span>
            </div>

            <!-- 5. Closed -->
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                   [ngClass]="ticket()!.status >= 4 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'">
                <span class="material-symbols-outlined text-[14px]">{{ ticket()!.status >= 4 ? 'check' : 'radio_button_unchecked' }}</span>
              </div>
              <span class="text-xs font-medium" [ngClass]="ticket()!.status === 4 ? 'text-indigo-600 font-bold' : 'text-slate-700'">
                5. Closed
              </span>
            </div>
          </div>
        </section>

        <!-- Main Content (2 Columns: Left Thread & Right Context Sidebar) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Left Column: Description & Comments Timeline (8 Cols) -->
          <div class="lg:col-span-8 space-y-6">
            <!-- Ticket Description Card -->
            <div class="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Diagnostic Description</h3>
              <p class="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {{ ticket()!.description }}
              </p>
            </div>

            <!-- Internal Comments Timeline -->
            <div class="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div class="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-indigo-600 text-[20px]">chat</span>
                  <h3 class="text-sm font-bold text-slate-900">Internal Comments & Activity</h3>
                </div>
                <span class="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  {{ comments().length }} Notes
                </span>
              </div>

              <!-- Comments List -->
              <div class="p-6 space-y-4">
                @if (comments().length === 0) {
                  <div class="py-6 text-center text-xs text-slate-400">
                    No comments yet on this ticket. Add the first internal update below.
                  </div>
                } @else {
                  @for (c of comments(); track c.id) {
                    <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                            {{ c.userName ? c.userName.substring(0, 2).toUpperCase() : 'U' }}
                          </div>
                          <span class="text-xs font-bold text-slate-900">{{ c.userName || 'Staff' }}</span>
                        </div>
                        <span class="text-[11px] font-mono text-slate-400">
                          {{ c.createdAt | date:'short' }}
                        </span>
                      </div>
                      <p class="text-xs text-slate-700 leading-relaxed pl-8 whitespace-pre-wrap">
                        {{ c.content }}
                      </p>
                    </div>
                  }
                }
              </div>

              <!-- Add Comment Input Form -->
              @if (ticket()!.status !== 4) {
                <div class="p-4 sm:p-6 bg-slate-50/70 border-t border-slate-100 space-y-3">
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-700" for="newComment">
                    Add Internal Note
                  </label>
                  <textarea
                    id="newComment"
                    rows="3"
                    [(ngModel)]="newCommentText"
                    placeholder="Write internal notes or resolution update..."
                    class="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white font-sans"
                  ></textarea>

                  <div class="flex justify-end">
                    <button
                      type="button"
                      (click)="onAddComment()"
                      [disabled]="!newCommentText.trim() || isSubmittingComment()"
                      class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      @if (isSubmittingComment()) {
                        <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      }
                      <span>Post Comment</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Right Column: Metadata Context Drawer (4 Cols) -->
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
                Ticket Metadata
              </h3>

              <div class="space-y-3 text-xs">
                <div class="flex justify-between items-center">
                  <span class="text-slate-500">Status</span>
                  <app-status-badge [status]="ticket()!.status" />
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-slate-500">Priority</span>
                  <app-priority-badge [priority]="ticket()!.priority" />
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-slate-500">Category</span>
                  <span class="font-semibold text-slate-800">{{ ticket()!.categoryName || 'Support' }}</span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-slate-500">Requester</span>
                  <span class="font-semibold text-slate-800">{{ ticket()!.createdByName }}</span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-slate-500">Assigned Agent</span>
                  <span class="font-semibold text-slate-800">
                    {{ ticket()!.assignedToName || 'Unassigned' }}
                  </span>
                </div>

                <div class="pt-2 border-t border-slate-100 space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-slate-500">Created At</span>
                    <span class="font-mono text-[11px] text-slate-700">{{ ticket()!.createdAt | date:'short' }}</span>
                  </div>

                  @if (ticket()!.updatedAt) {
                    <div class="flex justify-between items-center">
                      <span class="text-slate-500">Updated At</span>
                      <span class="font-mono text-[11px] text-slate-700">{{ ticket()!.updatedAt | date:'short' }}</span>
                    </div>
                  }

                  @if (ticket()!.resolvedAt) {
                    <div class="flex justify-between items-center">
                      <span class="text-slate-500">Resolved At</span>
                      <span class="font-mono text-[11px] text-emerald-600 font-semibold">{{ ticket()!.resolvedAt | date:'short' }}</span>
                    </div>
                  }

                  @if (ticket()!.closedAt) {
                    <div class="flex justify-between items-center">
                      <span class="text-slate-500">Closed At</span>
                      <span class="font-mono text-[11px] text-slate-500">{{ ticket()!.closedAt | date:'short' }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Assign Agent Modal -->
      @if (isAssignModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 overflow-hidden">
            <h3 class="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Assign Agent to Ticket
            </h3>
            <div class="my-4 space-y-3">
              <label class="block text-xs font-semibold text-slate-700">Select Support Agent</label>
              <select
                [(ngModel)]="selectedAgentId"
                class="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
              >
                <option [ngValue]="null">Select an agent...</option>
                @for (a of agentsList(); track a.id) {
                  <option [ngValue]="a.id">{{ a.fullName }} ({{ a.email }})</option>
                }
              </select>
            </div>
            <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                (click)="isAssignModalOpen.set(false)"
                class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="onAssignAgent()"
                [disabled]="!selectedAgentId"
                class="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Confirm Close Dialog -->
      <app-confirm-dialog
        [isOpen]="isConfirmCloseOpen()"
        title="Close Ticket #{{ ticket()?.id }}"
        message="Closing this ticket marks the issue as finalized. Are you sure you wish to close this ticket?"
        confirmText="Close Ticket"
        [isDestructive]="true"
        [isLoading]="isExecutingAction()"
        (cancelled)="isConfirmCloseOpen.set(false)"
        (confirmed)="onCloseTicket()"
      />
    </div>
  `
})
export class TicketDetailsComponent implements OnInit {
  authService = inject(AuthService);
  private ticketService = inject(TicketService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  ticketId = signal<number>(0);
  ticket = signal<TicketDetailsDto | null>(null);
  comments = signal<TicketCommentDto[]>([]);
  isLoading = signal(true);
  isExecutingAction = signal(false);

  newCommentText = '';
  isSubmittingComment = signal(false);

  // Assign modal state
  isAssignModalOpen = signal(false);
  agentsList = signal<UserListItemDto[]>([]);
  selectedAgentId: number | null = null;

  // Close confirm dialog
  isConfirmCloseOpen = signal(false);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (id) {
        this.ticketId.set(id);
        this.loadTicketDetails(id);
        this.loadComments(id);
      }
    });

    if (this.authService.isAdmin()) {
      this.userService.getUsers({ role: 'Agent', pageSize: 50 }).pipe(
        catchError(() => of({ items: [], pageNumber: 1, pageSize: 50, totalCount: 0, totalPages: 0 }))
      ).subscribe(res => {
        this.agentsList.set(res.items.filter(a => a.isActive));
      });
    }
  }

  loadTicketDetails(id: number): void {
    this.isLoading.set(true);
    this.ticketService.getTicketById(id).pipe(
      catchError(err => {
        this.toastService.error('Failed to load ticket details.');
        return of(null);
      })
    ).subscribe(data => {
      this.ticket.set(data);
      this.isLoading.set(false);
    });
  }

  loadComments(id: number): void {
    this.ticketService.getComments(id).pipe(
      catchError(() => of([]))
    ).subscribe(data => {
      this.comments.set(data);
    });
  }

  canStartTicket(): boolean {
    const t = this.ticket();
    if (!t) return false;
    // Agent can start if Assigned (status === 1)
    return this.authService.isAgent() && t.status === TicketStatus.Assigned;
  }

  canResolveTicket(): boolean {
    const t = this.ticket();
    if (!t) return false;
    // Agent can resolve if InProgress (status === 2)
    return this.authService.isAgent() && t.status === TicketStatus.InProgress;
  }

  canCloseTicket(): boolean {
    const t = this.ticket();
    if (!t) return false;
    // Employee or Admin can close if not already closed
    const isEmpOrAdmin = this.authService.isEmployee() || this.authService.isAdmin();
    return isEmpOrAdmin && t.status !== TicketStatus.Closed;
  }

  onStartTicket(): void {
    this.isExecutingAction.set(true);
    this.ticketService.startTicket(this.ticketId()).subscribe({
      next: () => {
        this.isExecutingAction.set(false);
        this.toastService.success('Ticket marked as In Progress');
        this.loadTicketDetails(this.ticketId());
      },
      error: () => this.isExecutingAction.set(false)
    });
  }

  onResolveTicket(): void {
    this.isExecutingAction.set(true);
    this.ticketService.resolveTicket(this.ticketId()).subscribe({
      next: () => {
        this.isExecutingAction.set(false);
        this.toastService.success('Ticket marked as Resolved');
        this.loadTicketDetails(this.ticketId());
      },
      error: () => this.isExecutingAction.set(false)
    });
  }

  onCloseTicket(): void {
    this.isExecutingAction.set(true);
    this.ticketService.closeTicket(this.ticketId()).subscribe({
      next: () => {
        this.isExecutingAction.set(false);
        this.isConfirmCloseOpen.set(false);
        this.toastService.success('Ticket closed successfully');
        this.loadTicketDetails(this.ticketId());
      },
      error: () => {
        this.isExecutingAction.set(false);
        this.isConfirmCloseOpen.set(false);
      }
    });
  }

  onAssignAgent(): void {
    if (!this.selectedAgentId) return;
    this.isExecutingAction.set(true);
    this.ticketService.assignTicket(this.ticketId(), this.selectedAgentId).subscribe({
      next: () => {
        this.isExecutingAction.set(false);
        this.isAssignModalOpen.set(false);
        this.toastService.success('Agent assigned successfully');
        this.loadTicketDetails(this.ticketId());
      },
      error: () => this.isExecutingAction.set(false)
    });
  }

  onUnassignTicket(): void {
    this.isExecutingAction.set(true);
    this.ticketService.unassignTicket(this.ticketId()).subscribe({
      next: () => {
        this.isExecutingAction.set(false);
        this.toastService.success('Agent unassigned from ticket');
        this.loadTicketDetails(this.ticketId());
      },
      error: () => this.isExecutingAction.set(false)
    });
  }

  onAddComment(): void {
    if (!this.newCommentText.trim()) return;

    this.isSubmittingComment.set(true);
    this.ticketService.addComment(this.ticketId(), { content: this.newCommentText }).subscribe({
      next: (c) => {
        this.isSubmittingComment.set(false);
        this.newCommentText = '';
        this.toastService.success('Comment posted');
        this.comments.update(list => [...list, c]);
      },
      error: () => {
        this.isSubmittingComment.set(false);
      }
    });
  }

  copyTicketId(): void {
    navigator.clipboard.writeText(`HD-${this.ticketId()}`);
    this.toastService.info(`Ticket ID #HD-${this.ticketId()} copied to clipboard`);
  }
}

