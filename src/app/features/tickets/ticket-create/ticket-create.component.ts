import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TicketService } from '../../../core/services/ticket.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { TicketPriority } from '../../../core/constants/enums';
import { CategoryResponseDto } from '../../../core/models/category.models';

@Component({
  selector: 'app-ticket-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="space-y-6 max-w-4xl mx-auto">
      <!-- Top Breadcrumb & Page Header -->
      <section class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div class="space-y-1">
          <nav class="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <a routerLink="/tickets" class="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">confirmation_number</span>
              <span>Tickets</span>
            </a>
            <span class="text-slate-300">/</span>
            <span class="text-indigo-600 font-semibold">Create Ticket</span>
          </nav>
          <div class="flex items-center gap-3 mt-1">
            <h1 class="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">Create New Ticket</h1>
            <span class="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold">
              Triage Intake
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-500">
            Submit a new support or engineering request to be routed through triage.
          </p>
        </div>

        <div>
          <a
            routerLink="/tickets"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <span class="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Tickets</span>
          </a>
        </div>
      </section>

      <!-- Main Form Card -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <form [formGroup]="ticketForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Ticket Title -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" for="title">
              Ticket Subject / Title <span class="text-rose-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              formControlName="title"
              placeholder="e.g. SSO SAML Authentication Loop on Okta Integration"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
              [ngClass]="{ 'border-rose-400 focus:ring-rose-500': isFieldInvalid('title') }"
            />
            @if (isFieldInvalid('title')) {
              <p class="mt-1 text-[11px] text-rose-600">A clear title is required (minimum 5 characters).</p>
            }
          </div>

          <!-- Category Selection -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" for="categoryId">
              Category <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              @if (isLoadingCategories()) {
                <div class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm flex items-center gap-2">
                  <span class="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></span>
                  <span>Loading support categories...</span>
                </div>
              } @else {
                <select
                  id="categoryId"
                  formControlName="categoryId"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition appearance-none cursor-pointer pr-10"
                  [ngClass]="{ 'border-rose-400 focus:ring-rose-500': isFieldInvalid('categoryId') }"
                >
                  <option value="" disabled>-- Select a Category --</option>
                  @for (cat of activeCategories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <span class="material-symbols-outlined text-[20px]">expand_more</span>
                </div>
              }
            </div>

            @if (isFieldInvalid('categoryId')) {
              <p class="mt-1 text-[11px] text-rose-600">Please choose a category for this ticket.</p>
            } @else if (selectedCategory()?.description) {
              <p class="mt-1.5 text-xs text-slate-500 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[15px] text-indigo-500">info</span>
                <span>{{ selectedCategory()?.description }}</span>
              </p>
            }
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" for="description">
              Diagnostic Description & Details <span class="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              rows="5"
              formControlName="description"
              placeholder="Provide telemetry, error logs, steps to reproduce, or affected service details..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition font-sans"
              [ngClass]="{ 'border-rose-400 focus:ring-rose-500': isFieldInvalid('description') }"
            ></textarea>
            @if (isFieldInvalid('description')) {
              <p class="mt-1 text-[11px] text-rose-600">Please provide a descriptive explanation (minimum 10 characters).</p>
            }
          </div>

          <!-- Priority Selector (Radio Cards) -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Select Priority Severity <span class="text-rose-500">*</span>
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <!-- Low -->
              <label
                class="flex flex-col p-3 rounded-xl border cursor-pointer transition-all"
                [ngClass]="ticketForm.get('priority')?.value === 0
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'"
              >
                <input type="radio" [value]="0" formControlName="priority" class="sr-only" />
                <span class="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <span class="material-symbols-outlined text-[16px] text-slate-400">arrow_downward</span>
                  Low
                </span>
                <span class="text-[11px] text-slate-500 mt-1">Minor bugs or cosmetic questions</span>
              </label>

              <!-- Medium -->
              <label
                class="flex flex-col p-3 rounded-xl border cursor-pointer transition-all"
                [ngClass]="ticketForm.get('priority')?.value === 1
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'"
              >
                <input type="radio" [value]="1" formControlName="priority" class="sr-only" />
                <span class="flex items-center gap-1.5 text-xs font-bold text-sky-700">
                  <span class="material-symbols-outlined text-[16px] text-sky-500">drag_handle</span>
                  Medium
                </span>
                <span class="text-[11px] text-slate-500 mt-1">Standard workflow disruptions</span>
              </label>

              <!-- High -->
              <label
                class="flex flex-col p-3 rounded-xl border cursor-pointer transition-all"
                [ngClass]="ticketForm.get('priority')?.value === 2
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'"
              >
                <input type="radio" [value]="2" formControlName="priority" class="sr-only" />
                <span class="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <span class="material-symbols-outlined text-[16px] text-amber-500">arrow_upward</span>
                  High
                </span>
                <span class="text-[11px] text-slate-500 mt-1">Major feature impaired</span>
              </label>

              <!-- Critical -->
              <label
                class="flex flex-col p-3 rounded-xl border cursor-pointer transition-all"
                [ngClass]="ticketForm.get('priority')?.value === 3
                  ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'"
              >
                <input type="radio" [value]="3" formControlName="priority" class="sr-only" />
                <span class="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                  <span class="material-symbols-outlined text-[16px] text-rose-500">bolt</span>
                  Critical
                </span>
                <span class="text-[11px] text-slate-500 mt-1">System outage or blocker</span>
              </label>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <a
              routerLink="/tickets"
              class="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </a>
            <button
              type="submit"
              [disabled]="isSubmitting() || ticketForm.invalid || isLoadingCategories()"
              class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              @if (isSubmitting()) {
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Submitting Ticket...</span>
              } @else {
                <span class="material-symbols-outlined text-[18px]">send</span>
                <span>Submit Ticket</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class TicketCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  categories = signal<CategoryResponseDto[]>([]);
  isLoadingCategories = signal(true);

  activeCategories = computed(() => this.categories().filter(c => c.isActive));

  ticketForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    categoryId: ['', [Validators.required, Validators.min(1)]],
    priority: [TicketPriority.Medium, [Validators.required]]
  });

  selectedCategory = computed(() => {
    const selectedId = Number(this.ticketForm?.get('categoryId')?.value);
    if (!selectedId) return null;
    return this.categories().find(c => c.id === selectedId) || null;
  });

  isSubmitting = signal(false);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoadingCategories.set(true);
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.isLoadingCategories.set(false);

        // Auto-select first active category if available
        const active = data.filter(c => c.isActive);
        if (active.length > 0 && !this.ticketForm.value.categoryId) {
          this.ticketForm.patchValue({ categoryId: active[0].id });
        }
      },
      error: () => {
        this.isLoadingCategories.set(false);
        this.toastService.error('Failed to load categories list.');
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.ticketForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const payload = {
      title: this.ticketForm.value.title,
      description: this.ticketForm.value.description,
      categoryId: Number(this.ticketForm.value.categoryId),
      priority: Number(this.ticketForm.value.priority)
    };

    this.ticketService.createTicket(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.toastService.success(`Ticket #${res.id} created successfully!`);
        this.router.navigate(['/tickets', res.id]);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }
}
