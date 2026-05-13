import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();
  const isAuthRequest = req.url.includes('/auth');

  // console.log('[AuthInterceptor] request', {
  //   method: req.method,
  //   url: req.url,
  //   isAuthRequest,
  //   hasToken: !!token,
  // });

  const requestWithAuthHeader = token && !isAuthRequest
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  if (!isAuthRequest) {
    const authHeader = requestWithAuthHeader.headers.get('Authorization');
    // console.log('[AuthInterceptor] auth header attached', {
    //   hasAuthorizationHeader: !!authHeader,
    //   tokenPreview: authHeader ? `${authHeader.slice(0, 20)}...` : null,
    // });
  }

  return next(requestWithAuthHeader).pipe(
    catchError((error: HttpErrorResponse) => {
      // console.error('[AuthInterceptor] response error', {
      //   url: req.url,
      //   status: error.status,
      //   message: error.message,
      //   error: error.error,
      // });

      if (error.status === 401) {
        // console.warn('[AuthInterceptor] 401 detected, clearing session and redirecting to login');
        auth.clearSession();
        void router.navigateByUrl('/');
      }

      return throwError(() => error);
    })
  );
};
