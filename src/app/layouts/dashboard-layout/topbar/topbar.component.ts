import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header
      class="fixed top-0 right-0 h-16 bg-white/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.03)] z-40 flex items-center justify-between px-6 border-b border-slate-200/80 transition-all duration-300"
      [style.left]="isCollapsed ? '5rem' : '16rem'"
    >
      <!-- Left side: Breadcrumb & Search Bar -->
      <div class="flex items-center gap-6">
        <nav class="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span class="hover:text-slate-800 cursor-pointer">HelpDesk</span>
          <span class="text-slate-300">/</span>
          <span class="text-slate-900 font-semibold">{{ currentSection }}</span>
        </nav>

        <div class="relative flex items-center">
          <span class="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search tickets, customers, users..."
            class="w-64 md:w-80 h-9 pl-9 pr-12 rounded-xl bg-slate-50 text-slate-800 placeholder:text-slate-400 text-xs border border-transparent focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
            (keydown.meta.k)="$event.preventDefault()"
          />
          <kbd class="absolute right-2 px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-mono text-[10px]">⌘K</kbd>
        </div>
      </div>

      <!-- Right side: New ticket CTA, Notifications & User Profile -->
      <div class="flex items-center gap-3">
        @if (authService.isEmployee()) {
          <a
            routerLink="/tickets/create"
            class="h-9 px-3.5 rounded-xl bg-primary-container text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-primary transition-colors shadow-sm"
          >
            <span class="material-symbols-outlined text-[18px]">add</span>
            <span>New Ticket</span>
          </a>
        }

        <button
          type="button"
          class="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          title="Notifications"
        >
          <span class="material-symbols-outlined text-[20px]">notifications</span>
          <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
        </button>

        <!-- User Dropdown Menu -->
        <div class="relative">
          <button
            type="button"
            (click)="toggleMenu()"
            class="flex items-center gap-3 pl-2 py-1 rounded-xl hover:bg-slate-50 transition-colors text-left"
          >
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-semibold text-xs flex items-center justify-center shadow-sm">
              {{ userInitials }}
            </div>
            <div class="hidden md:flex flex-col">
              <span class="text-xs font-semibold text-slate-900 leading-tight">
                {{ authService.currentUser()?.email || 'User' }}
              </span>
              <span class="text-[11px] text-slate-500 capitalize">
                {{ authService.userRole() || 'Member' }}
              </span>
            </div>
            <span class="material-symbols-outlined text-[18px] text-slate-400">keyboard_arrow_down</span>
          </button>

          @if (isMenuOpen()) {
            <div
              class="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-100 p-1.5 z-50 flex flex-col gap-0.5 animate-fade-in"
              (click)="isMenuOpen.set(false)"
            >
              <div class="px-3 py-2 border-b border-slate-100 mb-1">
                <p class="text-xs font-bold text-slate-900 truncate">{{ authService.currentUser()?.email }}</p>
                <p class="text-[11px] text-slate-500">ID: #{{ authService.currentUser()?.userId }}</p>
              </div>

              <button
                type="button"
                (click)="onLogout()"
                class="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `
})
export class TopbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  @Input() isCollapsed = false;

  isMenuOpen = signal(false);

  get currentSection(): string {
    const url = this.router.url;
    if (url.includes('/admin')) return 'Admin Overview';
    if (url.includes('/agent')) return 'Agent Workspace';
    if (url.includes('/employee')) return 'Employee Portal';
    if (url.includes('/tickets/create')) return 'Create Ticket';
    if (url.includes('/tickets/my')) return 'My Tickets';
    if (url.includes('/tickets')) return 'Tickets Management';
    if (url.includes('/users')) return 'Users Management';
    return 'Dashboard';
  }

  get userInitials(): string {
    const email = this.authService.currentUser()?.email || '';
    if (!email) return 'HD';
    return email.substring(0, 2).toUpperCase();
  }

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  onLogout(): void {
    this.isMenuOpen.set(false);
    this.authService.logout();
  }
}

