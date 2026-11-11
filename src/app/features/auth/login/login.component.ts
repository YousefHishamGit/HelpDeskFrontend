import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ToastContainerComponent } from '../../../shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ToastContainerComponent],
  template: `
    <div class="min-h-screen font-sans antialiased text-slate-800 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-100">
      <!-- Main Split Card Container -->
      <main class="w-full max-w-5xl bg-white rounded-3xl shadow-card overflow-hidden border border-slate-200/80 transition-all duration-300">
        <div class="grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          <!-- Left Hero Pane (Dark Indigo Brand Panel) -->
          <section class="lg:col-span-6 relative bg-[#090D16] text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between overflow-hidden">
            <!-- Background Glow Orbs & Mesh -->
            <div class="absolute inset-0 pointer-events-none glow-radial-indigo"></div>
            <div class="absolute inset-0 pointer-events-none glow-radial-teal"></div>
            <div class="absolute inset-0 pointer-events-none glow-radial-fuchsia"></div>
            <div class="absolute inset-0 bg-gradient-to-b from-[#0B0F19]/40 via-transparent to-[#0B0F19]/80 pointer-events-none"></div>

            <!-- Brand Header -->
            <div class="relative z-10">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-900/40">
                  <div class="w-full h-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center">
                    <svg class="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 12l10 10 10-10L12 2zm0 4.24l5.76 5.76L12 17.76 6.24 12 12 6.24z"></path>
                    </svg>
                  </div>
                </div>
                <span class="text-xl font-bold tracking-tight text-white">HelpDesk</span>
                <span class="text-[10px] uppercase tracking-wider font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/20 ml-1">
                  Enterprise
                </span>
              </div>
            </div>

            <!-- Core Statement -->
            <div class="relative z-10 my-10 lg:my-0 max-w-md">
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-[1.25] text-slate-50">
                The workspace where support, engineering and operations finally resolve issues in real time.
              </h1>
              <p class="mt-4 text-sm sm:text-base text-slate-400 font-normal leading-relaxed">
                High-throughput event coordination, automated routing, and deep telemetry for mission-critical services.
              </p>
            </div>

            <!-- Social Proof Quote -->
            <div class="relative z-10 pt-6 border-t border-slate-800/80">
              <blockquote class="text-sm font-medium text-slate-300 italic mb-4 leading-normal">
                “We cut our average resolution time by 58% in the first quarter alone.”
              </blockquote>
              <div class="flex items-center gap-3.5">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-indigo-400/30 shadow-md">
                  YH
                </div>
                <div class="text-xs">
                  <div class="font-semibold text-slate-200">Yousef Hisham</div>
                  <div class="text-slate-400 font-normal">VP of Infrastructure & DevOps · Stripe Corp</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Right Form Pane -->
          <section class="lg:col-span-6 bg-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
            <div>
              <div class="mb-6">
                <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
                <p class="mt-1.5 text-sm text-slate-500">Sign in to manage your support workspace.</p>
              </div>

              <!-- Error Alert Banner -->
              @if (errorMessage()) {
                <div class="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 transition-all">
                  <svg class="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                  <div class="flex-1">
                    <span class="font-semibold text-rose-900">Authentication Failed:</span>
                    {{ errorMessage() }}
                  </div>
                </div>
              }

              <!-- Login Form -->
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
                <!-- Work Email -->
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5" for="work-email">
                    Work email
                  </label>
                  <div class="relative">
                    <input
                      id="work-email"
                      type="email"
                      formControlName="email"
                      placeholder="sarah.j@helpdesk.io"
                      class="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                      [ngClass]="{ 'border-rose-400 focus:ring-rose-500': isFieldInvalid('email') }"
                    />
                  </div>
                  @if (isFieldInvalid('email')) {
                    <p class="mt-1 text-[11px] text-rose-600">Please provide a valid work email address.</p>
                  }
                </div>

                <!-- Password -->
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700" for="password">
                      Password
                    </label>
                    <a href="javascript:void(0)" class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div class="relative">
                    <input
                      id="password"
                      [type]="showPassword() ? 'text' : 'password'"
                      formControlName="password"
                      placeholder="••••••••••••"
                      class="w-full px-3.5 py-2.5 pr-11 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                      [ngClass]="{ 'border-rose-400 focus:ring-rose-500': isFieldInvalid('password') }"
                    />
                    <button
                      type="button"
                      (click)="togglePasswordVisibility()"
                      class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      <span class="material-symbols-outlined text-[18px]">
                        {{ showPassword() ? 'visibility_off' : 'visibility' }}
                      </span>
                    </button>
                  </div>
                  @if (isFieldInvalid('password')) {
                    <p class="mt-1 text-[11px] text-rose-600">Password is required.</p>
                  }
                </div>

                <!-- Remember Device -->
                <div class="flex items-center pt-1">
                  <input
                    id="remember-me"
                    type="checkbox"
                    formControlName="rememberMe"
                    class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label for="remember-me" class="ml-2 block text-xs text-slate-600 cursor-pointer select-none">
                    Remember this device for 30 days
                  </label>
                </div>

                <!-- Submit Button -->
                <div class="pt-2">
                  <button
                    type="submit"
                    [disabled]="isLoading() || loginForm.invalid"
                    class="w-full inline-flex justify-center items-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    @if (isLoading()) {
                      <svg class="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                      </svg>
                      <span>Signing in...</span>
                    } @else {
                      <span>Sign In to Workspace</span>
                    }
                  </button>
                </div>
              </form>

              <!-- Quick Account Helper (for testing with actual backend seeded accounts) -->
              <div class="mt-6 pt-4 border-t border-dashed border-slate-200">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Quick Test Credentials</span>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    (click)="fillCredentials('admin@example.com', 'Admin@123')"
                    class="px-2.5 py-1 text-xs font-medium rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    (click)="fillCredentials('agent@example.com', 'Agent@123')"
                    class="px-2.5 py-1 text-xs font-medium rounded bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                  >
                    Agent
                  </button>
                  <button
                    type="button"
                    (click)="fillCredentials('employee@example.com', 'Employee@123')"
                    class="px-2.5 py-1 text-xs font-medium rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                  >
                    Employee
                  </button>
                </div>
              </div>
            </div>

            <!-- Footer: Register link & Trust Badges -->
            <footer class="mt-8 pt-6 border-t border-slate-100 text-center">
              <p class="text-xs text-slate-500 mb-3">
                Need an account?
                <a routerLink="/auth/register" class="font-medium text-indigo-600 hover:text-indigo-700 hover:underline ml-0.5">
                  Register as Employee
                </a>
              </p>
              <div class="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-[11px] text-slate-400">
                <span class="inline-flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path clip-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fill-rule="evenodd"></path>
                  </svg>
                  2FA & SAML 2.0 Enforced
                </span>
                <span class="hidden sm:inline text-slate-300">•</span>
                <span class="inline-flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                  TLS 1.3 Encryption
                </span>
              </div>
            </footer>
          </section>
        </div>
      </main>

      <app-toast-container />
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    rememberMe: [false]
  });

  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  fillCredentials(email: string, pass: string): void {
    this.loginForm.patchValue({ email, password: pass });
    this.errorMessage.set(null);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toastService.success('Logged in successfully');

        // Check if there was a returnUrl
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else {
          // Navigate to appropriate default dashboard based on role
          setTimeout(() => {
            const dest = this.authService.getDefaultRouteForRole();
            this.router.navigate([dest]);
          }, 150);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || 'Invalid credentials. Please verify your work email and password.';
        this.errorMessage.set(msg);
      }
    });
  }
}

