import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.error instanceof ErrorEvent) {
        // Client-side network or script error
        errorMessage = `Client Error: ${error.error.message}`;
      } else {
        // Server-side error
        if (error.status === 0) {
          errorMessage = 'Unable to reach the server. Please check your network connection or server status.';
        } else if (error.status === 400) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.errors) {
            // Validation errors dictionary
            const validationErrors = Object.values(error.error.errors).flat();
            errorMessage = validationErrors.join(' ');
          } else {
            errorMessage = 'Bad request. Please verify the submitted data.';
          }
        } else if (error.status === 401) {
          // Handled or will trigger refresh / redirect
          errorMessage = error.error?.message || 'Session expired or invalid credentials.';
        } else if (error.status === 403) {
          errorMessage = 'Access denied. You do not have permission to perform this action.';
        } else if (error.status === 404) {
          errorMessage = error.error?.message || 'The requested resource was not found.';
        } else if (error.status === 409) {
          errorMessage = error.error?.message || 'Conflict detected. The resource might already exist.';
        } else if (error.status >= 500) {
          errorMessage = 'Server error encountered. Our team has been notified.';
        }
      }

      // We only show toast if not a background token refresh check
      if (!req.url.includes('/api/Auth/refresh')) {
        toastService.error(errorMessage);
      }

      return throwError(() => error);
    })
  );
};

