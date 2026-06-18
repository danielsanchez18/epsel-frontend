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
  async changePassword(): Promise<void> {
    if (!this.user) return;

    const result = await Swal.fire({
      title: 'Cambiar contraseña',
      html: `
        <input type="password" id="currentPassword" class="swal2-input" placeholder="Contraseña actual" style="width: 80%; max-width: 300px; display: flex; margin: 1em auto;">
        <input type="password" id="newPassword" class="swal2-input" placeholder="Nueva contraseña" style="width: 80%; max-width: 300px; display: flex; margin: 1em auto;">
        <input type="password" id="confirmPassword" class="swal2-input" placeholder="Confirmar contraseña" style="width: 80%; max-width: 300px; display: flex; margin: 1em auto;">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const currentPassword = (
          document.getElementById('currentPassword') as HTMLInputElement
        ).value;
        const newPassword = (
          document.getElementById('newPassword') as HTMLInputElement
        ).value;
        const confirmPassword = (
          document.getElementById('confirmPassword') as HTMLInputElement
        ).value;

        if (!currentPassword || !newPassword || !confirmPassword) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }

        if (newPassword !== confirmPassword) {
          Swal.showValidationMessage('Las contraseñas no coinciden');
          return false;
        }

        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
          Swal.showValidationMessage(
            'La nueva contraseña debe tener al menos 8 caracteres, incluir letras, números y caracteres especiales',
          );
          return false;
        }

        return { currentPassword, newPassword };
      },
    });

    if (result.isConfirmed) {
      this.userService.changePassword(result.value!).subscribe({
        next: () => {
          Swal.fire(
            'Contraseña actualizada',
            'Tu contraseña ha sido cambiada exitosamente.',
            'success',
          );
        },
        error: (err) => {
          Swal.fire(
            'Error',
            err.error?.message || 'No se pudo cambiar la contraseña',
            'error',
          );
        },
      });
    }
  }
}
