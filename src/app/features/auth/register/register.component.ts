import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ToastContainerComponent } from '../../../shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ToastContainerComponent],
  template: `
    <div class="min-h-screen font-sans antialiased text-on-surface bg-surface flex items-center justify-center p-4 sm:p-6 md:p-8">
      <main class="w-full max-w-5xl bg-surface-container-lowest rounded-2xl shadow-card overflow-hidden border border-outline-variant/60">
        <div class="grid grid-cols-1 lg:grid-cols-12 lg:min-h-[680px]">

          <!-- ═══════════════ LEFT: brand panel (desktop only) ═══════════════ -->
          <section class="hidden lg:flex lg:col-span-5 relative bg-brand-950 text-white p-12 xl:p-14 flex-col justify-between overflow-hidden">
            <!-- Soft glows built from the primary palette -->
            <div class="absolute -top-28 -left-24 w-96 h-96 rounded-full bg-primary-container/40 blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-secondary-container/25 blur-3xl pointer-events-none"></div>

            <!-- Logo -->
            <div class="relative z-10 flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-container to-secondary-container p-px">
                <div class="w-full h-full bg-brand-950 rounded-[11px] flex items-center justify-center">
                  <svg class="w-5 h-5 text-inverse-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2L2 12l10 10 10-10L12 2zm0 4.24l5.76 5.76L12 17.76 6.24 12 12 6.24z"></path>
                  </svg>
                </div>
              </div>
              <span class="text-headline-md text-white">HelpDesk</span>
            </div>

            <!-- Statement -->
            <div class="relative z-10 max-w-sm">
              <h1 class="text-display text-white">Get the support you need, when you need it.</h1>
              <p class="mt-4 text-body-lg text-primary-fixed-dim">
                Submit tickets, follow their progress, and talk directly with your support team.
              </p>

              <ul class="mt-8 space-y-3">
                @for (feat of features; track feat) {
                  <li class="flex items-center gap-3 text-body-md text-inverse-on-surface">
                    <span class="material-symbols-outlined text-[20px] text-inverse-primary" aria-hidden="true">check_circle</span>
                    {{ feat }}
                  </li>
                }
              </ul>
            </div>

            <!-- Trust footer -->
            <div class="relative z-10 pt-6 border-t border-white/10 flex items-center gap-5 text-body-sm text-primary-fixed-dim">
              <span class="inline-flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]" aria-hidden="true">lock</span>
                TLS 1.3 encrypted
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px]" aria-hidden="true">verified_user</span>
                GDPR compliant
              </span>
            </div>
          </section>

          <!-- ═══════════════ RIGHT: form ═══════════════ -->
          <section class="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
            <div class="w-full max-w-md mx-auto">

              <!-- Compact brand (mobile / tablet only) -->
              <div class="lg:hidden flex items-center gap-2 mb-8 text-primary">
                <span class="material-symbols-outlined text-[26px]" aria-hidden="true">support_agent</span>
                <span class="text-headline-md text-on-surface">HelpDesk</span>
              </div>

              <header class="mb-8">
                <h2 class="text-headline-lg text-on-surface">Create your account</h2>
                <p class="mt-1.5 text-body-md text-on-surface-variant">
                  Register as an employee to submit and track support tickets.
                </p>
              </header>

              <!-- Error banner -->
              @if (errorMessage()) {
                <div role="alert" class="mb-6 p-3.5 rounded-xl bg-error-container text-on-error-container flex items-start gap-2.5">
                  <span class="material-symbols-outlined text-[20px] shrink-0" aria-hidden="true">error</span>
                  <p class="flex-1 text-body-md">
                    <span class="font-semibold">Registration failed.</span>
                    {{ errorMessage() }}
                  </p>
                </div>
              }

              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5" novalidate>

                <!-- Full name + phone -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-label-md text-on-surface mb-1.5" for="fullName">Full name</label>
                    <div class="relative">
                      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline pointer-events-none" aria-hidden="true">badge</span>
                      <input
                        id="fullName"
                        type="text"
                        formControlName="fullName"
                        autocomplete="name"
                        placeholder="Sarah Jenkins"
                        [attr.aria-invalid]="isFieldInvalid('fullName')"
                        [class]="inputClass"
                      />
                    </div>
                    @if (isFieldInvalid('fullName')) {
                      <p class="mt-1.5 flex items-center gap-1 text-body-sm text-error">
                        <span class="material-symbols-outlined text-[16px]" aria-hidden="true">error</span>
                        Full name is required.
                      </p>
                    }
                  </div>

                  <div>
                    <label class="block text-label-md text-on-surface mb-1.5" for="phone">Phone number</label>
                    <div class="relative">
                      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline pointer-events-none" aria-hidden="true">call</span>
                      <input
                        id="phone"
                        type="tel"
                        formControlName="phone"
                        autocomplete="tel"
                        placeholder="+1 555-0199"
                        [attr.aria-invalid]="isFieldInvalid('phone')"
                        [class]="inputClass"
                      />
                    </div>
                    @if (isFieldInvalid('phone')) {
                      <p class="mt-1.5 flex items-center gap-1 text-body-sm text-error">
                        <span class="material-symbols-outlined text-[16px]" aria-hidden="true">error</span>
                        Phone number is required.
                      </p>
                    }
                  </div>
                </div>

                <!-- Work email -->
                <div>
                  <label class="block text-label-md text-on-surface mb-1.5" for="email">Work email</label>
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline pointer-events-none" aria-hidden="true">mail</span>
                    <input
                      id="email"
                      type="email"
                      formControlName="email"
                      autocomplete="email"
                      placeholder="sarah.j@company.com"
                      [attr.aria-invalid]="isFieldInvalid('email')"
                      [class]="inputClass"
                    />
                  </div>
                  @if (isFieldInvalid('email')) {
                    <p class="mt-1.5 flex items-center gap-1 text-body-sm text-error">
                      <span class="material-symbols-outlined text-[16px]" aria-hidden="true">error</span>
                      Enter a valid work email.
                    </p>
                  }
                </div>

                <!-- Password -->
                <div>
                  <label class="block text-label-md text-on-surface mb-1.5" for="password">Password</label>
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline pointer-events-none" aria-hidden="true">lock</span>
                    <input
                      id="password"
                      [type]="showPassword() ? 'text' : 'password'"
                      formControlName="password"
                      autocomplete="new-password"
                      placeholder="At least 6 characters"
                      [attr.aria-invalid]="isFieldInvalid('password')"
                      [class]="passwordInputClass"
                    />
                    <button
                      type="button"
                      (click)="togglePasswordVisibility()"
                      [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                      class="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <span class="material-symbols-outlined text-[20px]" aria-hidden="true">
                        {{ showPassword() ? 'visibility_off' : 'visibility' }}
                      </span>
                    </button>
                  </div>

                  @if (isFieldInvalid('password')) {
                    <p class="mt-1.5 flex items-center gap-1 text-body-sm text-error">
                      <span class="material-symbols-outlined text-[16px]" aria-hidden="true">error</span>
                      Password must be at least 6 characters.
                    </p>
                  }

                  <!-- Strength indicator -->
                  @if (passwordScore() > 0) {
                    <div class="mt-2.5 flex items-center gap-3">
                      <div class="flex gap-1.5" aria-hidden="true">
                        @for (bar of [1, 2, 3]; track bar) {
                          <div
                            class="h-1.5 w-10 rounded-full transition-colors duration-300"
                            [ngClass]="getStrengthBarClass(bar)"
                          ></div>
                        }
                      </div>
                      <span class="text-label-md" [ngClass]="getStrengthLabelClass()">
                        {{ getStrengthLabel() }}
                      </span>
                    </div>
                  }
                </div>

                <!-- Terms -->
                <p class="text-body-sm text-on-surface-variant">
                  By creating an account, you agree to your organization's
                  <span class="text-primary cursor-pointer hover:underline">Terms of Service</span>
                  and
                  <span class="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
                </p>

                <!-- Submit -->
                <button
                  type="submit"
                  [disabled]="isLoading() || registerForm.invalid"
                  class="w-full h-11 inline-flex justify-center items-center gap-2 rounded-xl bg-primary text-on-primary text-body-md-medium shadow-sm transition
                         hover:bg-primary-container active:scale-[0.99]
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2
                         disabled:bg-surface-container-high disabled:text-outline disabled:shadow-none disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  @if (isLoading()) {
                    <span class="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" aria-hidden="true"></span>
                    <span>Creating account…</span>
                  } @else {
                    <span class="material-symbols-outlined text-[18px]" aria-hidden="true">person_add</span>
                    <span>Create account</span>
                  }
                </button>
              </form>

              <p class="mt-8 pt-6 border-t border-outline-variant/60 text-center text-body-md text-on-surface-variant">
                Already have an account?
                <a
                  routerLink="/auth/login"
                  class="ml-1 text-body-md-medium text-primary hover:text-primary-container hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Sign in
                </a>
              </p>
            </div>
          </section>

        </div>
      </main>

      <app-toast-container />
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);

  /** Benefits listed in the brand panel. */
  readonly features: string[] = [
    'Submit tickets in under a minute',
    'Track the status of every request',
    'Message your support team directly'
  ];

  // Shared input styling (full class names so Tailwind can detect them).
  private readonly inputBase =
    'w-full h-11 rounded-xl bg-surface-container-lowest border border-outline-variant text-body-lg text-on-surface placeholder:text-outline transition ' +
    'hover:border-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ' +
    'aria-[invalid=true]:border-error aria-[invalid=true]:focus:ring-error/20';
  readonly inputClass = `${this.inputBase} pl-10 pr-3.5`;
  readonly passwordInputClass = `${this.inputBase} pl-10 pr-11`;

  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  // ── Password strength: 0 (hidden) · 1 weak · 2 good · 3 strong ──
  passwordScore(): number {
    const value: string = this.registerForm.get('password')?.value ?? '';
    if (value.length < 6) return 0;

    const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter(r => r.test(value)).length;

    if (value.length >= 12 && kinds >= 3) return 3;
    if (value.length >= 8 && kinds >= 2) return 2;
    return 1;
  }

  getStrengthLabel(): string {
    return ['', 'Weak', 'Good', 'Strong'][this.passwordScore()];
  }

  getStrengthBarClass(bar: number): string {
    const score = this.passwordScore();
    if (bar > score) return 'bg-surface-container-highest';
    return ['', 'bg-error', 'bg-secondary-container', 'bg-primary'][score];
  }

  getStrengthLabelClass(): string {
    return ['', 'text-error', 'text-secondary', 'text-primary'][this.passwordScore()];
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toastService.success('Account created! Welcome to HelpDesk.');
        setTimeout(() => {
          this.router.navigate(['/dashboard/employee']);
        }, 150);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to register. Email may already be in use.');
      }
    });
  }
}