import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAtSign, LucideLock } from '@lucide/angular';
import { AuthService } from '@services/auth/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'page-auth-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAtSign, LucideLock
  ],
  templateUrl: './login.html',
})
export class PageAuthLogin {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isSubmitting = false;
  errorMessage = '';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {

    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.login(this.form.getRawValue())
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {

          if (!response.success || !response.data?.token) {
            this.errorMessage = 'No se pudo iniciar sesion. Intenta nuevamente.';
            return;
          }
            this.authService.saveSession(response.data);
            this.authService.debugTokenPayload();
          void this.router.navigateByUrl('/dashboard');
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'Credenciales invalidas';
        }
      });
  }

}
