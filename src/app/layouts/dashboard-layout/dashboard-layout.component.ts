import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent, ToastContainerComponent],
  template: `
    <div class="min-h-screen bg-slate-50/60 font-sans text-slate-800">
      <!-- Fixed Sidebar -->
      <app-sidebar [isCollapsed]="isSidebarCollapsed()" (collapsedChange)="onSidebarCollapseChange($event)" />

      <!-- Fixed Topbar -->
      <app-topbar [isCollapsed]="isSidebarCollapsed()" />

      <!-- Main Content Outlet -->
      <main
        class="pt-16 min-h-screen transition-all duration-300"
        [style.padding-left]="isSidebarCollapsed() ? '5rem' : '16rem'"
      >
        <div class="p-6 md:p-8 max-w-[1720px] mx-auto">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Global Toasts -->
      <app-toast-container />
    </div>
  `
})
export class DashboardLayoutComponent {
  isSidebarCollapsed = signal(false);

  onSidebarCollapseChange(collapsed: boolean): void {
    this.isSidebarCollapsed.set(collapsed);
  }
}

