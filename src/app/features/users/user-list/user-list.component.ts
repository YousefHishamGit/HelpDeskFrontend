import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserListItemDto, UserQueryParametersDto } from '../../../core/models/user.models';
import { RoleBadgeComponent } from '../../../shared/components/role-badge/role-badge.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RoleBadgeComponent,
    PaginationComponent,
    ConfirmDialogComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    KpiCardComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Top Action & Navigation Header -->
      <section class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>HelpDesk</span>
            <span>/</span>
            <span>Admin</span>
            <span>/</span>
            <span class="text-indigo-600 font-semibold">Users</span>
          </div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">Users Management</h1>
            <span class="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold">
              Admin Workspace
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-500">
            Manage employee access, register support triage agents, and control user statuses across your fleet.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="openCreateAgentModal()"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-all"
          >
            <span class="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Create Agent</span>
          </button>
        </div>
      </section>

      <!-- 4 Key Metric Cards Bento Grid -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-kpi-card
          title="Total Users"
          [value]="totalCount()"
          icon="group"
          iconType="primary"
          subtitle="Registered accounts"
          [isLoading]="isLoading()"
        />

        <app-kpi-card
          title="Active Users"
          [value]="activeUsersCount()"
          icon="verified_user"
          iconType="emerald"
          subtitle="Enabled accounts"
          [isLoading]="isLoading()"
        />

        <app-kpi-card
          title="Support Agents"
          [value]="agentCount()"
          icon="support_agent"
          iconType="secondary"
          subtitle="Triage specialists"
          [isLoading]="isLoading()"
        />

        <app-kpi-card
          title="Suspended / Inactive"
          [value]="inactiveUsersCount()"
          icon="person_off"
          iconType="rose"
          subtitle="Disabled access"
          [isLoading]="isLoading()"
        />
      </section>

      <!-- Filter Controls Strip -->
      <section class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <span class="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-[18px]">search</span>
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search by full name or email address..."
            class="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
          />
        </div>

        <!-- Filter Dropdowns -->
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-1.5 text-xs">
            <label class="font-medium text-slate-500">Role:</label>
            <select
              [ngModel]="selectedRole()"
              (ngModelChange)="onRoleChange($event)"
              class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600"
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Agent">Agent</option>
              <option value="Employee">Employee</option>
            </select>
          </div>

          <div class="flex items-center gap-1.5 text-xs">
            <label class="font-medium text-slate-500">Status:</label>
            <select
              [ngModel]="selectedActiveStatus()"
              (ngModelChange)="onActiveStatusChange($event)"
              class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600"
            >
              <option [ngValue]="null">All Statuses</option>
              <option [ngValue]="true">Active</option>
              <option [ngValue]="false">Inactive</option>
            </select>
          </div>

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

      <!-- Users Table -->
      <section class="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        @if (isLoading()) {
          <app-loading-skeleton type="table" />
        } @else if (users().length === 0) {
          <app-empty-state
            icon="person_search"
            title="No users match your criteria"
            description="Adjust your search terms or filters to locate registered employees and agents."
            actionLabel="+ Create Agent"
            (actionClicked)="openCreateAgentModal()"
          />
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                  <th class="py-3 px-4">User</th>
                  <th class="py-3 px-4">Role</th>
                  <th class="py-3 px-4">Phone</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4">Created Date</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs">
                @for (user of users(); track user.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors">
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {{ user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'U' }}
                        </div>
                        <div>
                          <div class="font-bold text-slate-900">{{ user.fullName || 'Unnamed' }}</div>
                          <div class="text-[11px] text-slate-400 font-mono">{{ user.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="py-3.5 px-4">
                      <app-role-badge [role]="user.role" />
                    </td>
                    <td class="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {{ user.phone || '—' }}
                    </td>
                    <td class="py-3.5 px-4">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                            [ngClass]="user.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-slate-100 text-slate-600 border border-slate-200'">
                        <span class="w-1.5 h-1.5 rounded-full" [ngClass]="user.isActive ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                        {{ user.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {{ user.createdAt | date:'short' }}
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <!-- Edit User Button -->
                        <button
                          type="button"
                          (click)="openEditUserModal(user)"
                          class="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit User Information"
                        >
                          <span class="material-symbols-outlined text-[18px]">edit</span>
                        </button>

                        <!-- Toggle Status Button -->
                        <button
                          type="button"
                          (click)="confirmToggleStatus(user)"
                          class="p-1.5 rounded-lg transition-colors"
                          [ngClass]="user.isActive ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'"
                          [title]="user.isActive ? 'Deactivate User' : 'Activate User'"
                        >
                          <span class="material-symbols-outlined text-[18px]">
                            {{ user.isActive ? 'block' : 'check_circle' }}
                          </span>
                        </button>
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

      <!-- Create Agent Modal -->
      @if (isCreateModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 overflow-hidden">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-indigo-600 text-[20px]">person_add</span>
                <h3 class="text-base font-bold text-slate-900">Create Support Agent</h3>
              </div>
              <button type="button" (click)="isCreateModalOpen.set(false)" class="text-slate-400 hover:text-slate-600">
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form [formGroup]="agentForm" (ngSubmit)="onCreateAgent()" class="mt-4 space-y-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1" for="agentName">
                  Full Name <span class="text-rose-500">*</span>
                </label>
                <input
                  id="agentName"
                  type="text"
                  formControlName="fullName"
                  placeholder="e.g. Alex Morgan"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1" for="agentEmail">
                  Email Address <span class="text-rose-500">*</span>
                </label>
                <input
                  id="agentEmail"
                  type="email"
                  formControlName="email"
                  placeholder="alex.m@support.io"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1" for="agentPhone">
                  Phone Number
                </label>
                <input
                  id="agentPhone"
                  type="tel"
                  formControlName="phone"
                  placeholder="+1 (555) 012-3456"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  (click)="isCreateModalOpen.set(false)"
                  class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="agentForm.invalid || isSubmitting()"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
                >
                  @if (isSubmitting()) {
                    <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  }
                  <span>Create Agent</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Edit User Modal -->
      @if (selectedUserForEdit()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 overflow-hidden">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="text-base font-bold text-slate-900">
                Edit User #{{ selectedUserForEdit()?.id }}
              </h3>
              <button type="button" (click)="selectedUserForEdit.set(null)" class="text-slate-400 hover:text-slate-600">
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form [formGroup]="editUserForm" (ngSubmit)="onUpdateUser()" class="mt-4 space-y-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1" for="editName">
                  Full Name <span class="text-rose-500">*</span>
                </label>
                <input
                  id="editName"
                  type="text"
                  formControlName="fullName"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1" for="editPhone">
                  Phone Number
                </label>
                <input
                  id="editPhone"
                  type="tel"
                  formControlName="phone"
                  class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  (click)="selectedUserForEdit.set(null)"
                  class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="editUserForm.invalid || isSubmitting()"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
                >
                  @if (isSubmitting()) {
                    <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  }
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Toggle Status Confirmation Dialog -->
      <app-confirm-dialog
        [isOpen]="isStatusDialogOpen()"
        [title]="userToToggleStatus()?.isActive ? 'Deactivate User Account' : 'Activate User Account'"
        [message]="userToToggleStatus()?.isActive
          ? 'Deactivating this user will revoke their workspace access and session. Are you sure?'
          : 'Activating this user will restore their workspace access.'"
        [confirmText]="userToToggleStatus()?.isActive ? 'Deactivate' : 'Activate'"
        [isDestructive]="userToToggleStatus()?.isActive ?? false"
        [isLoading]="isSubmitting()"
        (cancelled)="isStatusDialogOpen.set(false)"
        (confirmed)="onToggleStatus()"
      />
    </div>
  `
})
export class UserListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  users = signal<UserListItemDto[]>([]);
  totalCount = signal(0);
  totalPages = signal(1);
  pageNumber = signal(1);
  pageSize = signal(10);
  searchQuery = signal('');
  selectedRole = signal('');
  selectedActiveStatus = signal<boolean | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);

  // Derived counts for KPI metrics
  activeUsersCount = signal(0);
  inactiveUsersCount = signal(0);
  agentCount = signal(0);

  private searchSubject = new Subject<string>();

  // Create Agent Modal
  isCreateModalOpen = signal(false);
  agentForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['']
  });

  // Edit User Modal
  selectedUserForEdit = signal<UserListItemDto | null>(null);
  editUserForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['']
  });

  // Toggle Status Confirm Dialog
  isStatusDialogOpen = signal(false);
  userToToggleStatus = signal<UserListItemDto | null>(null);

  ngOnInit(): void {
    this.loadUsers();

    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.pageNumber.set(1);
      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.isLoading.set(true);

    const queryParams: UserQueryParametersDto = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
      search: this.searchQuery() || undefined,
      role: this.selectedRole() || undefined,
      isActive: this.selectedActiveStatus() !== null ? this.selectedActiveStatus()! : undefined
    };

    this.userService.getUsers(queryParams).pipe(
      catchError(err => {
        this.toastService.error('Failed to load users list');
        return of({ items: [], pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 0 });
      })
    ).subscribe(result => {
      this.users.set(result.items);
      this.totalCount.set(result.totalCount);
      this.totalPages.set(result.totalPages);
      this.isLoading.set(false);

      // Derive metrics from current page or background summary query
      this.activeUsersCount.set(result.items.filter(u => u.isActive).length);
      this.inactiveUsersCount.set(result.items.filter(u => !u.isActive).length);
      this.agentCount.set(result.items.filter(u => u.role?.toLowerCase() === 'agent').length);
    });
  }

  onSearchChange(val: string): void {
    this.searchSubject.next(val);
  }

  onRoleChange(val: string): void {
    this.selectedRole.set(val);
    this.pageNumber.set(1);
    this.loadUsers();
  }

  onActiveStatusChange(val: boolean | null): void {
    this.selectedActiveStatus.set(val);
    this.pageNumber.set(1);
    this.loadUsers();
  }

  onPageChange(newPage: number): void {
    this.pageNumber.set(newPage);
    this.loadUsers();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery() || this.selectedRole() || this.selectedActiveStatus() !== null);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedRole.set('');
    this.selectedActiveStatus.set(null);
    this.pageNumber.set(1);
    this.loadUsers();
  }

  openCreateAgentModal(): void {
    this.agentForm.reset();
    this.isCreateModalOpen.set(true);
  }

  onCreateAgent(): void {
    if (this.agentForm.invalid) return;

    this.isSubmitting.set(true);
    this.userService.createAgent(this.agentForm.value).subscribe({
      next: (agent) => {
        this.isSubmitting.set(false);
        this.isCreateModalOpen.set(false);
        this.toastService.success(`Agent ${agent.fullName} created successfully`);
        this.loadUsers();
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  openEditUserModal(user: UserListItemDto): void {
    this.selectedUserForEdit.set(user);
    this.editUserForm.patchValue({
      fullName: user.fullName,
      phone: user.phone || ''
    });
  }

  onUpdateUser(): void {
    const user = this.selectedUserForEdit();
    if (!user || this.editUserForm.invalid) return;

    this.isSubmitting.set(true);
    this.userService.updateUser(user.id, this.editUserForm.value).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.selectedUserForEdit.set(null);
        this.toastService.success(`User ${user.fullName} updated successfully`);
        this.loadUsers();
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  confirmToggleStatus(user: UserListItemDto): void {
    this.userToToggleStatus.set(user);
    this.isStatusDialogOpen.set(true);
  }

  onToggleStatus(): void {
    const user = this.userToToggleStatus();
    if (!user) return;

    const newStatus = !user.isActive;
    this.isSubmitting.set(true);

    this.userService.updateUserStatus(user.id, newStatus).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isStatusDialogOpen.set(false);
        this.userToToggleStatus.set(null);
        this.toastService.success(`User account status updated to ${newStatus ? 'Active' : 'Inactive'}`);
        this.loadUsers();
      },
      error: () => this.isSubmitting.set(false)
    });
  }
}

