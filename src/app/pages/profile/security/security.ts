import { Component, inject, OnInit } from '@angular/core';
import { UserResponse } from '@interfaces/users/user.interface';
import { AuthService } from '@services/auth/auth.service';
import { UserService } from '@services/users/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'page-profile-security',
  imports: [],
  templateUrl: './security.html',
})
export class PageProfileSecurity implements OnInit {
  user: UserResponse | null = null;
  isLoading = true;
  private authService = inject(AuthService);
  private userService = inject(UserService);
  ngOnInit() {
    this.loadUser();
  }
  loadUser() {
    this.isLoading = true;
    const authUser = this.authService.getUser();
    if (authUser && authUser.userId) {
      this.userService.getById(authUser.userId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.user = res.data;
          }
          this.isLoading = false;
        },
        error: () => (this.isLoading = false),
      });
    } else {
      this.isLoading = false;
    }
  }
  async suspendAccount(): Promise<void> {
    if (!this.user) return;
    const result = await Swal.fire({
      title: '¿Suspender cuenta?',
      text: 'Tu cuenta pasará a estado suspendido y perderás el acceso. Tendrás que contactar al administrador para reactivarla.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, suspender',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    });
    if (result.isConfirmed) {
      this.userService.changeStatus(this.user.id, 'SUSPENDED').subscribe({
        next: () => {
          Swal.fire(
            'Cuenta suspendida',
            'Tu cuenta ha sido suspendida exitosamente. Cerrando sesión...',
            'success',
          ).then(() => {
            this.authService.logout(true);
          });
        },
        error: (err) =>
          Swal.fire(
            'Error',
            err.error?.message || 'No se pudo suspender la cuenta',
            'error',
          ),
      });
    }
  }
}
