import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceFeeService } from '@services/settings/service-fee.service';
import { ServiceFeeConfigurationResponse, ServiceFeeType } from '@core/interfaces/settings/settings.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'component-dashboard-settings-service-costs-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit.html',
})
export class ComponentDashboardSettingsServiceCostsEdit {

  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;

  private serviceFeeService = inject(ServiceFeeService);
  private fb = inject(FormBuilder);

  editForm: FormGroup;
  isLoading = false;
  currentFeeId: string | null = null;
  initialValues: any = null;

  constructor() {
    this.editForm = this.fb.group({
      zoneName: [{ value: '', disabled: true }],
      feeTypeLabel: [{ value: '', disabled: true }],
      amount: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  getFeeTypeLabel(feeType: ServiceFeeType): string {
    const types: Record<string, string> = {
      'CONNECTION': 'Conexión',
      'RECONNECTION': 'Reconexión',
      'MAINTENANCE': 'Mantenimiento',
      'OTHER': 'Otro'
    };
    return types[feeType] || feeType;
  }

  get hasChanges(): boolean {
    if (!this.initialValues) return false;
    return this.editForm.value.amount !== this.initialValues.amount;
  }

  open(fee: ServiceFeeConfigurationResponse) {
    this.currentFeeId = fee.id;
    this.initialValues = {
      zoneName: fee.zoneName,
      feeTypeLabel: this.getFeeTypeLabel(fee.feeType),
      amount: fee.amount
    };
    this.editForm.patchValue(this.initialValues);
  }

  onSubmit() {
    if (this.editForm.invalid || !this.currentFeeId) return;

    this.isLoading = true;
    const payload = { amount: this.editForm.value.amount };

    this.serviceFeeService.update(this.currentFeeId, payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: res.message || 'Costo actualizado exitosamente',
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
            text: res.message || 'Ocurrió un error al actualizar el costo',
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
