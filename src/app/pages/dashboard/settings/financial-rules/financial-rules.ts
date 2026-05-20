import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BillingConfigurationService } from '@services/settings/billing-configuration.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'page-dashboard-settings-financial-rules',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './financial-rules.html',
})
export class PageDashboardSettingsFinancialRules implements OnInit {
  private billingService = inject(BillingConfigurationService);
  private fb = inject(FormBuilder);

  configForm: FormGroup;
  initialValues: any = null;
  isLoading = true;
  isSaving = false;
  isEditing = false;

  constructor() {
    this.configForm = this.fb.group({
      monthsBeforeCut: [{ value: 0, disabled: true }, [Validators.required, Validators.min(1)]],
      lateInterestPercentage: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0), Validators.max(100)]],
      graceDays: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadConfig();
  }

  loadConfig() {
    this.isLoading = true;
    this.billingService.getCurrent().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const data = res.data;
          this.initialValues = {
            monthsBeforeCut: data.monthsBeforeCut,
            lateInterestPercentage: data.lateInterestPercentage,
            graceDays: data.graceDays
          };
          this.configForm.patchValue(this.initialValues);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la configuración',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }

  get hasChanges(): boolean {
    if (!this.initialValues) return false;
    return this.configForm.getRawValue().monthsBeforeCut !== this.initialValues.monthsBeforeCut ||
           this.configForm.getRawValue().lateInterestPercentage !== this.initialValues.lateInterestPercentage ||
           this.configForm.getRawValue().graceDays !== this.initialValues.graceDays;
  }

  enableEdit() {
    this.isEditing = true;
    this.configForm.enable();
  }

  cancelEdit() {
    this.isEditing = false;
    this.configForm.patchValue(this.initialValues);
    this.configForm.disable();
  }

  onSubmit() {
    if (this.configForm.invalid || !this.hasChanges) return;

    this.isSaving = true;
    const payload = this.configForm.getRawValue();
    this.configForm.disable();

    this.billingService.update(payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res.success) {
          this.initialValues = payload;
          this.isEditing = false;
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: res.message || 'Configuración actualizada exitosamente',
            confirmButtonColor: '#2563eb'
          });
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.configForm.enable();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'No se pudo actualizar la configuración.',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }
}
