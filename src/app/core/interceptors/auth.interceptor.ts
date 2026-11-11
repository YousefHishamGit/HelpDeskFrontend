import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

function withBearerToken<T>(req: HttpRequest<T>, token: string): HttpRequest<T> {
  const rawToken = token.replace(/^Bearer\s+/i, '').trim();
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${rawToken}`
    }
  });
}

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const isAuthEndpoint = req.url.includes('/api/Auth/login') ||
    req.url.includes('/api/Auth/register') ||
    req.url.includes('/api/Auth/refresh');

  const authReq = token && !isAuthEndpoint ? withBearerToken(req, token) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || isAuthEndpoint) {
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject = new BehaviorSubject<string | null>(null);

        return authService.refreshToken().pipe(
          switchMap(response => {
            const refreshedToken = authService.getAccessToken() || response.accessToken;
            if (!refreshedToken) {
              throw new Error('Token refresh succeeded without an access token');
            }

            isRefreshing = false;
            refreshTokenSubject.next(refreshedToken);
            return next(withBearerToken(req, refreshedToken));
          }),
          catchError(refreshError => {
            isRefreshing = false;
            refreshTokenSubject.error(refreshError);
            refreshTokenSubject = new BehaviorSubject<string | null>(null);
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return refreshTokenSubject.pipe(
        filter((newToken): newToken is string => newToken !== null),
        take(1),
        switchMap(newToken => next(withBearerToken(req, newToken)))
      );
    })
  );
};
