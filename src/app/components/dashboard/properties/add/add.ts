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
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

import { CustomerService } from '@services/customers/customer.service';
import { PropertyService } from '@services/properties/property.service';
import { ServiceZoneService } from '@services/settings/service-zone.service';

import { CustomerResponse } from '@interfaces/customers/customer.interface';
import { ServiceZoneResponse } from '@interfaces/settings/settings.interface';
import { LucideLoader } from '@lucide/angular';

@Component({
  selector: 'component-dashboard-properties-add',
  imports: [CommonModule, ReactiveFormsModule, LucideLoader],
  templateUrl: './add.html',
})
export class ComponentDashboardPropertiesAdd implements OnInit {
  @ViewChild('closeButton') closeButton!: ElementRef<HTMLButtonElement>;

  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private propertyService = inject(PropertyService);
  private serviceZoneService = inject(ServiceZoneService);

  propertyForm: FormGroup;
  searchCustomerForm: FormGroup;

  customers: CustomerResponse[] = [];
  zones: ServiceZoneResponse[] = [];
  selectedCustomer: CustomerResponse | null = null;

  isSearching = false;
  isLoading = false;

  constructor() {
    this.searchCustomerForm = this.fb.group({
      documentNumber: [''],
    });

    this.propertyForm = this.fb.group({
      customerId: ['', [Validators.required]],
      type: ['', [Validators.required]],
      address: ['', [Validators.required]],
      cadastralCode: ['', [Validators.required, Validators.maxLength(50)]],
      latitude: [null],
      longitude: [null],
      reference: [''],
      zoneId: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.loadZones();
    this.onCustomerSearch();
  }

  loadZones() {
    this.serviceZoneService.getAll(0, 1000, '', true).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.zones = res.data.content;
        }
      },
    });
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
            return this.customerService.search(0, 5, 'createdAt,desc', term);
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
    this.propertyForm.patchValue({ customerId: customer.id });
    this.customers = [];
    this.searchCustomerForm
      .get('documentNumber')
      ?.setValue(customer.documentNumber, { emitEvent: false });
  }

  resetCustomerSelection() {
    this.selectedCustomer = null;
    this.propertyForm.patchValue({ customerId: '' });
    this.searchCustomerForm.reset();
  }

  onSubmit() {
    if (this.propertyForm.invalid) {
      this.propertyForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const payload = this.propertyForm.value;

    this.propertyService.create(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Predio registrado exitosamente.',
            confirmButtonColor: '#2563eb',
          }).then(() => {
            this.closeButton.nativeElement.click();
            window.location.reload();
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text:
            err.error?.message || 'Ocurrió un error al registrar el predio.',
          confirmButtonColor: '#d33',
        });
      },
    });
  }
}
