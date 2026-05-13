import { APP_INITIALIZER, ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { AuthService } from '@services/auth/auth.service';

import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { catchError, of } from 'rxjs';


// Registrar los datos del idioma español
registerLocaleData(localeEs, 'es');


export function initializeApp(authService: AuthService) {
  return () => {
    if (authService.getToken()) {
      try {
        const userResult = authService.getUser();
        // If getUser() returns an Observable use pipe, otherwise wrap the result in an Observable
        if (userResult && typeof (userResult as any).pipe === 'function') {
          return (userResult as any).pipe(
            catchError(() => {
              authService.logout();
              return of(null);
            })
          );
        }
        return of(userResult || null);
      } catch (e) {
        authService.logout();
        return of(null);
      }
    }
    return of(null);
  };
}


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    {
      provide: LOCALE_ID, useValue: 'es'
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService],
      multi: true
    }
  ],
};
