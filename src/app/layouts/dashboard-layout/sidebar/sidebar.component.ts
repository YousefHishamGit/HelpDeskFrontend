import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside
      class="fixed left-0 top-0 h-full bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between border-r border-slate-200/80 transition-all duration-300"
      [ngClass]="isCollapsed ? 'w-20' : 'w-64'"
    >
      <div class="flex flex-col">
        <!-- Logo / Brand Header -->
        <div class="h-16 px-4 flex items-center gap-3 border-b border-slate-100">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-cyan-400 p-[1px] shadow-sm shrink-0">
            <div class="w-full h-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center">
              <svg class="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 12l10 10 10-10L12 2zm0 4.24l5.76 5.76L12 17.76 6.24 12 12 6.24z"></path>
              </svg>
            </div>
          </div>
          @if (!isCollapsed) {
            <div class="flex items-center gap-1.5 overflow-hidden">
              <span class="font-bold text-lg text-slate-900 tracking-tight">HelpDesk</span>
              <span class="text-[10px] uppercase tracking-wider font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200/50">
                {{ authService.userRole() || 'Enterprise' }}
              </span>
            </div>
          }
        </div>

        <!-- Navigation Links -->
        <nav class="flex flex-col gap-1 p-3">
          <!-- ADMIN LINKS -->
          @if (authService.isAdmin()) {
            <a
              routerLink="/dashboard/admin"
              routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              [title]="isCollapsed ? 'Overview' : ''"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[20px]">grid_view</span>
                @if (!isCollapsed) { <span class="text-sm">Overview</span> }
              </div>
            </a>

            <a
              routerLink="/tickets"
              routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              [title]="isCollapsed ? 'Tickets Management' : ''"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[20px]">inbox</span>
                @if (!isCollapsed) { <span class="text-sm">Tickets</span> }
              </div>
            </a>

            <a
              routerLink="/users"
              routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              [title]="isCollapsed ? 'Users Management' : ''"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[20px]">group</span>
                @if (!isCollapsed) { <span class="text-sm">Users</span> }
              </div>
              @if (!isCollapsed) {
                <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">Admin</span>
              }
            </a>
          }

          <!-- AGENT LINKS -->
          @if (authService.isAgent()) {
            <a
              routerLink="/dashboard/agent"
              routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              [title]="isCollapsed ? 'My Workspace' : ''"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[20px]">dashboard</span>
                @if (!isCollapsed) { <span class="text-sm">My Workspace</span> }
              </div>
            </a>

            <a
              routerLink="/tickets/my"
              routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              [title]="isCollapsed ? 'Assigned Tickets' : ''"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[20px]">assignment_ind</span>
                @if (!isCollapsed) { <span class="text-sm">Assigned Tickets</span> }
              </div>
            </a>

            <a
              routerLink="/tickets"
              routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              [title]="isCollapsed ? 'Queue' : ''"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[20px]">inbox</span>
                @if (!isCollapsed) { <span class="text-sm">Queue</span> }
              </div>
            </a>
          }

          <!-- EMPLOYEE LINKS -->
          @if (authService.isEmployee()) {
            <a
              routerLink="/dashboard/employee"
              routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              [title]="isCollapsed ? 'My Requests' : ''"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[20px]">receipt_long</span>
                @if (!isCollapsed) { <span class="text-sm">My Requests</span> }
              </div>
            </a>

            <a
              routerLink="/tickets/create"
              routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              [title]="isCollapsed ? 'Create Ticket' : ''"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[20px]">add_task</span>
                @if (!isCollapsed) { <span class="text-sm">Submit Ticket</span> }
              </div>
            </a>
          }
        </nav>
      </div>

      <!-- Footer: Operational status & collapse button -->
      <div class="p-3 flex flex-col gap-2 border-t border-slate-100">
        @if (!isCollapsed) {
          <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-xs text-slate-600 font-medium">All Systems Operational</span>
          </div>
        }

        <button
          type="button"
          (click)="toggleCollapse()"
          class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors text-xs font-medium"
        >
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">
              {{ isCollapsed ? 'right_panel_open' : 'left_panel_close' }}
            </span>
            @if (!isCollapsed) { <span>Collapse Sidebar</span> }
          </div>
          @if (!isCollapsed) {
            <kbd class="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-mono text-[10px]">⌘[</kbd>
          }
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  authService = inject(AuthService);

  @Input() isCollapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }
}

