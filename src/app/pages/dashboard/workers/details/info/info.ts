import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, DoCheck, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideBadgeInfo, LucideCalendar1, LucideCalendarCheck, LucideCircleX, LucideTrash2 } from '@lucide/angular';
import { PageDashboardWorkersDetailsGeneral } from '../general/general';
import { UserService } from '@services/users/user.service';
import { RoleService } from '@services/users/role.service';
import { Router } from '@angular/router';
import { PublicUrlPipe } from '@core/pipes/public-url.pipe';
import { UpdateUser } from '@core/interfaces/users/user.interface';
import { RoleResponse } from '@core/interfaces/users/role.interface';
import Swal from 'sweetalert2';

interface LocalFormData {
  names: string;
  lastNames: string;
  dni: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'page-dashboard-workers-details-info',
  imports: [
    LucideBadgeInfo, LucideCalendar1, LucideCalendarCheck, LucideTrash2, LucideCircleX,
    DatePipe, PublicUrlPipe,
    FormsModule,
    CommonModule
  ],
  templateUrl: './info.html',
})
export class PageDashboardWorkersDetailsInfo implements DoCheck, OnInit {

  public parent = inject(PageDashboardWorkersDetailsGeneral);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private router = inject(Router);

  roles: RoleResponse[] = [];

  formData: LocalFormData = {
    names: '',
    lastNames: '',
    phone: '',
    email: '',
    dni: '',
  };

  selectedImage?: File | null = null;
  imagePreview?: string | null = null;
  isFormValid: boolean = true;
  hasChanges: boolean = false;
  isInitialized: boolean = false;
  originalData: any = null;

  touched: Record<keyof LocalFormData, boolean> = {
    names: false,
    lastNames: false,
    dni: false,
    email: false,
    phone: false,
  };

  ngOnInit(): void {
    this.roleService.getAll().subscribe({
      next: (res) => {
        this.roles = res.data ?? [];
      },
      error: (err) => console.error('Error cargando roles', err)
    });
  }

  ngDoCheck(): void {
    if (!this.isInitialized && this.parent.user) {
      this.originalData = {
        names: this.parent.user.names || '',
        lastNames: this.parent.user.lastNames || '',
        phone: this.parent.user.phone || '',
        email: this.parent.user.email || '',
        dni: this.parent.user.dni || '',
      };
      this.formData = { ...this.originalData };
      this.isInitialized = true;
    }
  }

  checkChanges(): void {
    if (!this.originalData) return;
    this.hasChanges =
      this.formData.names !== this.originalData.names ||
      this.formData.lastNames !== this.originalData.lastNames ||
      this.formData.phone !== this.originalData.phone ||
      this.formData.email !== this.originalData.email ||
      !!this.selectedImage;

    this.checkFormValid();
  }

  touch(field: keyof LocalFormData): void {
    this.touched[field] = true;
    this.checkFormValid();
  }

  private checkFormValid(): void {
    this.isFormValid = this.validateNames(this.formData.names)
      && this.validateLastNames(this.formData.lastNames)
      && this.validateEmail(this.formData.email)
      && this.validatePhone(this.formData.phone);
  }

  validateNames(value: string): boolean {
    return !!value && value.trim().length >= 2;
  }

  validateLastNames(value: string): boolean {
    return !!value && value.trim().length >= 2;
  }

  validateEmail(value: string): boolean {
    if (!value) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  }

  validatePhone(value: string): boolean {
    if (!value) return true;
    const re = /^\d{9}$/;
    return re.test(value);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedImage = null;
      this.imagePreview = null;
      this.checkChanges();
      return;
    }

    const file = input.files[0];
    const maxSize = 1_048_576;
    if (file.size > maxSize) {
      void Swal.fire('Imagen muy pesada', 'La imagen debe pesar máximo 1MB.', 'warning');
      input.value = '';
      this.selectedImage = null;
      this.imagePreview = null;
      this.checkChanges();
      return;
    }

    this.selectedImage = file;
    if (this.imagePreview) URL.revokeObjectURL(this.imagePreview);
    this.imagePreview = URL.createObjectURL(file);
    this.checkChanges();
  }

  copyToClipboard(text: string | null | undefined): void {
    if (text) {
      navigator.clipboard.writeText(text);
      void Swal.fire({ title: '¡Copiado!', text: 'El valor ha sido copiado al portapapeles.', icon: 'success', timer: 1500, showConfirmButton: false });
    }
  }

  async saveChanges(): Promise<void> {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se actualizarán los datos de este usuario en el sistema.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#155dfc',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sí, guardar cambios',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const payload: UpdateUser = {
        names: this.formData.names,
        lastNames: this.formData.lastNames,
        phone: this.formData.phone,
        email: this.formData.email,
      };

      // Ensure we send back the identical roleId to not wipe out or change the role
      if (this.parent.user?.role) {
        const found = this.roles.find(r => r.name === this.parent.user!.role);
        if (found) {
          payload.roleId = found.id;
        }
      }

      this.userService.update(this.parent.user!.id!, payload, this.selectedImage ?? undefined).subscribe({
        next: (resp) => {
          void Swal.fire({ title: '¡Actualizado!', text: 'Los datos del usuario han sido guardados.', icon: 'success', timer: 2000, showConfirmButton: true, confirmButtonColor: '#155dfc' });

          this.parent.user = resp.data;
          if (resp.data?.photoUrl) this.parent.user.photoUrl = resp.data.photoUrl;
          if (this.imagePreview) {
            URL.revokeObjectURL(this.imagePreview);
            this.imagePreview = null;
            this.selectedImage = null;
          }
          this.isInitialized = false;
          this.hasChanges = false;
          this.ngDoCheck();
        },
        error: (err) => {
          void Swal.fire('Ocurrió un error', err.error?.message || 'No se pudo actualizar', 'error');
        }
      });
    }
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (
      event.key !== 'Backspace' &&
      event.key !== 'Tab' &&
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      (charCode < 48 || charCode > 57)
    ) {
      event.preventDefault();
    }
  }

}
