import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleResponse } from '@interfaces/users/role.interface';
import { UserService } from '@services/users/user.service';
import { RoleService } from '@services/users/role.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'component-dashboard-workers-add',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './add.html',
})
export class ComponentDashboardWorkersAdd {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userService = inject(UserService);

  isSubmitting = false;

  roles: RoleResponse[] = [];
  private roleService = inject(RoleService);
  selectedImage?: File | null = null;
  imagePreview?: string | null = null;

  form = this.fb.nonNullable.group({
    names: ['', [Validators.required, Validators.minLength(2)]],
    lastNames: ['', [Validators.required, Validators.minLength(2)]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
    ]],
    roleId: ['' as string, [Validators.required]],
  });

  ngOnInit(): void {
    this.loadRoles();
  }

  private loadRoles(): void {
    this.roleService.getAll().subscribe({
      next: (res) => {
        this.roles = res.data ?? [];
      },
      error: (err) => {
        console.error('Error cargando roles', err);
      }
    });
  }


  onSubmit() : void {

    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();

      void Swal.fire({
        title: 'Formulario incompleto',
        text: 'Revisa los campos obligatorios antes de continuar.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    this.isSubmitting = true;

    const value = this.form.getRawValue();

    const dto = {
      dni: value.dni,
      names: value.names,
      lastNames: value.lastNames,
      phone: value.phone,
      email: value.email,
      password: value.password,
      roleId: String(value.roleId),
    };

    this.userService.create(dto, this.selectedImage ?? undefined)
      .pipe()
      .subscribe({
        next: () => {
          void Swal.fire({
            title: 'Usuario creado',
            text: 'El usuario se ha registrado correctamente.',
            icon: 'success',
            confirmButtonText: 'Ok',
          }).then(() => this.router.navigate(['/dashboard/personal']));
        },
        error: (err) => {
          console.error(err);
          void Swal.fire({
            title: 'Error',
            text: err?.error?.message ?? 'Ocurrió un error al registrar el usuario.',
            icon: 'error',
            confirmButtonText: 'Entendido',
          });
        }
      }).add(() => this.isSubmitting = false);

  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedImage = null;
      this.imagePreview = null;
      return;
    }

    const file = input.files[0];
    const maxSize = 1_048_576; // 1MB
    if (file.size > maxSize) {
      void Swal.fire({
        title: 'Imagen muy pesada',
        text: 'La imagen debe pesar máximo 1MB.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
      });
      input.value = '';
      this.selectedImage = null;
      this.imagePreview = null;
      return;
    }

    this.selectedImage = file;
    this.imagePreview = URL.createObjectURL(file);
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

  allowOnlyLetters(event: KeyboardEvent) {
    const key = event.key;
    // Allow control/navigation keys
    const allowedControls = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (allowedControls.includes(key)) return;
    // Prevent digits
    if (/\d/.test(key)) {
      event.preventDefault();
    }
  }

}

