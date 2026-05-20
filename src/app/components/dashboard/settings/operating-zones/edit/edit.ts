import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceZoneService } from '@services/settings/service-zone.service';
import { ServiceZoneResponse } from '@core/interfaces/settings/settings.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'component-dashboard-settings-operating-zones-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit.html',
})
export class ComponentDashboardSettingsOperatingZonesEdit {

  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;

  private serviceZoneService = inject(ServiceZoneService);
  private fb = inject(FormBuilder);

  editForm: FormGroup;
  isLoading = false;
  currentZoneId: string | null = null;
  initialValues: any = null;

  constructor() {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]]
    });
  }

  get hasChanges(): boolean {
    if (!this.initialValues) return false;
    return this.editForm.value.name !== this.initialValues.name ||
           this.editForm.value.description !== this.initialValues.description;
  }

  open(zone: ServiceZoneResponse) {
    this.currentZoneId = zone.id;
    this.initialValues = {
      name: zone.name,
      description: zone.description
    };
    this.editForm.patchValue(this.initialValues);
  }

  onSubmit() {
    if (this.editForm.invalid || !this.currentZoneId) return;

    this.isLoading = true;
    const payload = this.editForm.value;

    this.serviceZoneService.update(this.currentZoneId, payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: res.message || 'Zona actualizada exitosamente',
            confirmButtonColor: '#2563eb'
          }).then(() => {
            if (this.closeButton) {
              this.closeButton.nativeElement.click();
            }
            window.location.reload();
          });
          this.editForm.reset();
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
