import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceZoneService } from '@services/settings/service-zone.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'component-dashboard-settings-operating-zones-add',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add.html',
})
export class ComponentDashboardSettingsOperatingZonesAdd {

  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;

  private serviceZoneService = inject(ServiceZoneService);
  private fb = inject(FormBuilder);

  addForm: FormGroup;
  isLoading = false;

  constructor() {
    this.addForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.addForm.invalid) return;

    this.isLoading = true;
    const payload = this.addForm.value;

    this.serviceZoneService.create(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: res.message || 'Zona creada exitosamente',
            confirmButtonColor: '#2563eb'
          }).then(() => {
            if (this.closeButton) {
              this.closeButton.nativeElement.click();
            }
            window.location.reload();
          });
          this.addForm.reset();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.message || 'Ocurrió un error al registrar la zona',
            confirmButtonColor: '#2563eb'
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Error de conexión con el servidor.',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }

}
