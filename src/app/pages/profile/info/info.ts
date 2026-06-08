import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth/auth.service';
import { UserService } from '@core/services/users/user.service';
import { RoleService } from '@services/users/role.service';
import { UserResponse } from '@core/interfaces/users/user.interface';
import { RoleResponse } from '@core/interfaces/users/role.interface';
import Swal from 'sweetalert2';
import { PublicUrlPipe } from '@core/pipes/public-url.pipe';

@Component({
  selector: 'page-profile-info',
  imports: [CommonModule, FormsModule, PublicUrlPipe],
  templateUrl: './info.html',
})
export class PageProfileInfo implements OnInit {
  isLoading = true;
  isSaving = false;
  isSavingPhoto = false;
  activeEditField: string | null = null;
  hasChanges = false;
  phonePattern = '^[0-9]{7,15}$';

  user: UserResponse | null = null;

  formData: any = {
    phone: '',
    email: '',
    photoUrl: '',
  };

  imagePreview: string | null = null;
  selectedFile: File | null = null;

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private roleService = inject(RoleService);

  roles: RoleResponse[] = [];

  ngOnInit() {
    this.roleService.getAll().subscribe({
      next: (res) => {
        this.roles = res.data ?? [];
      },
    });
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
            console.log('user loaded:', this.user);
            this.formData = {
              phone: this.user.phone || '',
              email: this.user.email || '',
              photoUrl: this.user.photoUrl || '',
            };
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
    } else {
      this.isLoading = false;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);

      this.isSavingPhoto = true;
      const payload = this.buildUpdatePayload();
      this.userService.update(this.user!.id, payload, file).subscribe({
        next: (res) => {
          this.isSavingPhoto = false;
          if (res.success && res.data) {
            this.user = res.data;
            // Update session info if needed
            const currentSession = this.authService.getUser();
            if (currentSession) {
              currentSession.photoUrl = this.user.photoUrl;
              this.authService.updateUser(currentSession);
            }

            Swal.fire({
              icon: 'success',
              title: 'Foto actualizada',
              text: 'Tu foto de perfil ha sido actualizada exitosamente.',
              confirmButtonColor: '#2563eb',
            });
          }
        },
        error: () => {
          this.isSavingPhoto = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al subir la foto de perfil.',
            confirmButtonColor: '#d33',
          });
        },
      });
    }
  }

  startEdit(field: string) {
    this.activeEditField = field;
    this.hasChanges = true;
  }

  cancelEdit() {
    this.activeEditField = null;
    this.hasChanges = false;
    if (this.user) {
      this.formData = {
        phone: this.user.phone || '',
        email: this.user.email || '',
        photoUrl: this.user.photoUrl || '',
      };
    }
  }

  private buildUpdatePayload(
    overrides: { phone?: string; email?: string } = {},
  ): any {
    const payload: any = {
      names: this.user!.names,
      lastNames: this.user!.lastNames,
      phone: this.user!.phone,
      email: this.user!.email,
    };

    if (overrides.phone !== undefined) payload.phone = overrides.phone;
    if (overrides.email !== undefined) payload.email = overrides.email;

    const foundRole = this.roles.find((r) => r.name === this.user!.role);
    if (foundRole) {
      payload.roleId = foundRole.id;
    }

    return payload;
  }

  saveField(field: string, form: any) {
    if (form.invalid) return;

    this.isSaving = true;
    const overrides: any = {};
    if (field === 'phone') overrides.phone = this.formData.phone;
    if (field === 'email') overrides.email = this.formData.email;

    const payload = this.buildUpdatePayload(overrides);

    this.userService.update(this.user!.id, payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res.success && res.data) {
          this.user = res.data;

          const currentSession = this.authService.getUser();
          if (currentSession) {
            if (payload.phone) currentSession.phone = payload.phone;
            if (payload.email) currentSession.email = payload.email;
            this.authService.updateUser(currentSession);
          }

          this.activeEditField = null;
          this.hasChanges = false;
          Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: 'Tu información ha sido actualizada exitosamente.',
            timer: 2000,
            showConfirmButton: false,
          });
        }
      },
      error: () => {
        this.isSaving = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al actualizar la información.',
          confirmButtonColor: '#d33',
        });
      },
    });
  }
}
