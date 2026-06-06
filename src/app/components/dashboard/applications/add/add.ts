import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

import { CustomerService } from '@services/customers/customer.service';
import { PropertyService } from '@services/properties/property.service';
import { InstallationRequestService } from '@services/supplies/installation-request.service';

import { CustomerResponse } from '@interfaces/customers/customer.interface';
import { PropertyResponse } from '@interfaces/properties/properties.interface';
import { CreateInstallationRequest } from '@interfaces/supplies/installation-request.interface';
import { LucideLoader } from '@lucide/angular';

@Component({
  selector: 'component-dashboard-applications-add',
  imports: [CommonModule, ReactiveFormsModule, LucideLoader],
  templateUrl: './add.html',
})
export class ComponentDashboardApplicationsAdd implements OnInit {
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;

  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private propertyService = inject(PropertyService);
  private requestService = inject(InstallationRequestService);

  requestForm: FormGroup;
  searchCustomerForm: FormGroup;

  customers: CustomerResponse[] = [];
  properties: PropertyResponse[] = [];
  selectedCustomer: CustomerResponse | null = null;
  propertiesLoaded = false;
  todayString = new Date().toISOString().slice(0, 10);

  isSearching = false;
  isLoading = false;

  constructor() {
    this.searchCustomerForm = this.fb.group({
      documentNumber: [''],
    });

    this.requestForm = this.fb.group({
      customerId: ['', [Validators.required]],
      internalReference: ['', [Validators.required, Validators.maxLength(100)]],
      propertyId: ['', [Validators.required]],
      requestedDate: ['', [Validators.required, this.minDateValidator()]],
      observations: ['', [Validators.maxLength(500)]],
    });
  }

  private minDateValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) return null;
      const input = new Date(value);
      input.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return input < today
        ? { minDate: { required: today.toISOString().slice(0, 10) } }
        : null;
    };
  }

  ngOnInit() {
    this.onCustomerSearch();
  }

  onCustomerSearch() {
    this.searchCustomerForm
      .get('documentNumber')
      ?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term && term.length >= 3) {
            this.isSearching = true;
            return this.customerService.search(0, 5, 'createdAt', term);
          } else {
            this.customers = [];
            return of(null);
          }
        }),
      )
      .subscribe({
        next: (res) => {
          this.isSearching = false;
          if (res && res.success && res.data) {
            this.customers = res.data.content;
          }
        },
        error: () => {
          this.isSearching = false;
          this.customers = [];
        },
      });
  }

  selectCustomer(customer: CustomerResponse) {
    this.selectedCustomer = customer;
    this.requestForm.patchValue({ customerId: customer.id, propertyId: '' });
    this.customers = [];
    this.searchCustomerForm
      .get('documentNumber')
      ?.setValue(customer.documentNumber, { emitEvent: false });
    this.propertiesLoaded = false;
    this.loadProperties(customer.id);
  }

  resetCustomerSelection() {
    this.selectedCustomer = null;
    this.requestForm.patchValue({ customerId: '', propertyId: '' });
    this.searchCustomerForm.reset();
    this.properties = [];
    this.propertiesLoaded = false;
  }

  loadProperties(customerId: string) {
    this.propertyService.getAll(0, 50, '', '', '', customerId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.properties = res.data.content;
        } else {
          this.properties = [];
        }
        this.propertiesLoaded = true;
      },
      error: () => {
        this.properties = [];
        this.propertiesLoaded = true;
      },
    });
  }

  onSubmit() {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const payload: CreateInstallationRequest = {
      customerId: this.requestForm.value.customerId,
      internalReference: this.requestForm.value.internalReference,
      propertyId: this.requestForm.value.propertyId,
      requestedDate: this.requestForm.value.requestedDate,
      observations: this.requestForm.value.observations,
    };

    this.requestService.create(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text:
              res.message ||
              'Solicitud de instalación registrada exitosamente.',
            confirmButtonColor: '#2563eb',
          }).then(() => {
            this.closeButton.nativeElement.click();
            window.location.reload();
          });
          this.requestForm.reset();
          this.resetCustomerSelection();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              res.message ||
              'Ocurrió un error inesperado al registrar la solicitud.',
            confirmButtonColor: '#d33',
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Error de conexión con el servidor.',
          confirmButtonColor: '#d33',
        });
      },
    });
  }
}
