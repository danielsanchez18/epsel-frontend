import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import {
  LucideUser,
  LucideDroplets,
  LucideAlertTriangle,
  LucideArrowLeft,
} from '@lucide/angular';

import { CustomerService } from '@services/customers/customer.service';
import { PropertyService } from '@services/properties/property.service';
import { SupplyService } from '@services/supplies/supply.service';
import { IncidentService } from '@services/incidents/incident.service';

import { CustomerResponse } from '@interfaces/customers/customer.interface';
import { PropertyResponse } from '@interfaces/properties/properties.interface';
import { SupplyDetailsDTO } from '@interfaces/supplies/supply.interface';
import {
  IncidentPriority,
  IncidentType,
} from '@interfaces/incidents/incident.interface';

@Component({
  selector: 'page-dashboard-incidents-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideUser,
    LucideDroplets,
    LucideAlertTriangle,
    LucideArrowLeft,
  ],
  templateUrl: './create.html',
})
export class PageDashboardIncidentsCreate implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private customerService = inject(CustomerService);
  private propertyService = inject(PropertyService);
  private supplyService = inject(SupplyService);
  private incidentService = inject(IncidentService);

  incidentForm!: FormGroup;
  searchCustomerForm!: FormGroup;

  customers: CustomerResponse[] = [];
  properties: PropertyResponse[] = [];
  supplies: any[] = [];

  selectedCustomer: CustomerResponse | null = null;
  selectedProperty: PropertyResponse | null = null;
  selectedSupply: any | null = null;

  isSearchingCustomer = false;
  isLoadingData = false;
  isSaving = false;

  isCustomerLocked = false;
  isSupplyLocked = false;

  incidentTypes: { value: IncidentType; label: string }[] = [
    { value: 'BILLING_COMPLAINT', label: 'Reclamo por recibo elevado' },
    { value: 'PAYMENT_COMPLAINT', label: 'Pago no reflejado' },
    { value: 'SERVICE_INTERRUPTION', label: 'Interrupción del servicio' },
    { value: 'LOW_PRESSURE', label: 'Baja presión de agua' },
    { value: 'WATER_LEAK', label: 'Fuga de agua en vía pública' },
    { value: 'METER_DAMAGE', label: 'Medidor dañado' },
    { value: 'METER_REPLACEMENT', label: 'Reemplazo de medidor' },
    { value: 'ABNORMAL_CONSUMPTION', label: 'Consumo anormal detectado' },
    { value: 'OCR_ANOMALY', label: 'Posible error de lectura OCR' },
    { value: 'READING_ANOMALY', label: 'Anomalía de lectura' },
    { value: 'SUPPLY_CUT_COMPLAINT', label: 'Reclamo por corte de suministro' },
    { value: 'OTHER', label: 'Otro' },
  ];

  priorities: { value: IncidentPriority; label: string }[] = [
    { value: 'LOW', label: 'Baja' },
    { value: 'MEDIUM', label: 'Media' },
    { value: 'HIGH', label: 'Alta' },
    { value: 'CRITICAL', label: 'Crítica' },
  ];

  ngOnInit() {
    this.initForms();
    this.setupCustomerSearch();
    this.parseQueryParams();
  }

  private initForms() {
    this.searchCustomerForm = this.fb.group({
      searchQuery: [''],
    });

    this.incidentForm = this.fb.group({
      customerId: ['', [Validators.required]],
      propertyId: [''],
      supplyId: [''],
      type: ['', [Validators.required]],
      priority: ['MEDIUM', [Validators.required]],
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(105),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(1005),
        ],
      ],
    });
  }

  private setupCustomerSearch() {
    this.searchCustomerForm
      .get('searchQuery')
      ?.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term && term.length >= 3) {
            this.isSearchingCustomer = true;
            return this.customerService.search(0, 5, '', term);
          } else {
            this.customers = [];
            return of(null);
          }
        }),
      )
      .subscribe({
        next: (res) => {
          this.isSearchingCustomer = false;
          if (res && res.success && res.data) {
            this.customers = res.data.content;
          }
        },
        error: () => {
          this.isSearchingCustomer = false;
          this.customers = [];
        },
      });
  }

  private parseQueryParams() {
    this.route.queryParams.subscribe((params) => {
      const customerId = params['customerId'];
      const supplyId = params['supplyId'];
      const type = params['type'] as IncidentType;
      const title = params['title'];
      const description = params['description'];

      if (type) {
        this.incidentForm.get('type')?.setValue(type);
      }
      if (title) {
        this.incidentForm.get('title')?.setValue(title);
      }
      if (description) {
        this.incidentForm.get('description')?.setValue(description);
      }

      if (supplyId) {
        this.isSupplyLocked = true;
        this.isCustomerLocked = true;
        this.loadBySupplyId(supplyId);
      } else if (customerId) {
        this.isCustomerLocked = true;
        this.loadByCustomerId(customerId);
      }
    });
  }

  private loadByCustomerId(customerId: string) {
    this.isLoadingData = true;
    this.customerService.getById(customerId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.selectCustomer(res.data);
        }
        this.isLoadingData = false;
      },
      error: () => {
        this.isLoadingData = false;
        void Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información del cliente.',
          confirmButtonColor: '#2563eb',
        });
      },
    });
  }

  private loadBySupplyId(supplyId: string) {
    this.isLoadingData = true;
    this.supplyService.getById(supplyId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const supply = res.data;
          this.selectedSupply = supply;
          this.incidentForm.patchValue({ supplyId: supply.id });

          this.customerService.search(0, 1, supply.customerDocument).subscribe({
            next: (custRes) => {
              if (
                custRes.success &&
                custRes.data &&
                custRes.data.content.length > 0
              ) {
                const customer = custRes.data.content[0];
                this.selectCustomer(customer);
                this.incidentForm.patchValue({ supplyId: supply.id });
              }
              this.isLoadingData = false;
            },
            error: () => {
              this.isLoadingData = false;
            },
          });
        } else {
          this.isLoadingData = false;
        }
      },
      error: () => {
        this.isLoadingData = false;
        void Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información del suministro.',
          confirmButtonColor: '#2563eb',
        });
      },
    });
  }

  selectCustomer(customer: CustomerResponse) {
    this.selectedCustomer = customer;
    this.incidentForm.patchValue({ customerId: customer.id });
    this.customers = [];
    this.searchCustomerForm
      .get('searchQuery')
      ?.setValue('', { emitEvent: false });

    this.loadCustomerProperties(customer.id);
    this.loadCustomerSupplies(customer.id);
  }

  resetCustomerSelection() {
    if (this.isCustomerLocked) return;
    this.selectedCustomer = null;
    this.selectedProperty = null;
    this.selectedSupply = null;
    this.properties = [];
    this.supplies = [];
    this.incidentForm.patchValue({
      customerId: '',
      propertyId: '',
      supplyId: '',
    });
    this.searchCustomerForm.reset();
  }

  private loadCustomerProperties(customerId: string) {
    this.propertyService
      .getAll(0, 100, 'createdAt,desc', undefined, undefined, customerId)
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.properties = res.data.content;

            if (this.properties.length === 1) {
              this.selectedProperty = this.properties[0];
              this.incidentForm.patchValue({
                propertyId: this.properties[0].id,
              });
            } else if (this.selectedSupply) {
              const matched = this.properties.find(
                (p) => p.address === this.selectedSupply?.propertyAddress,
              );
              if (matched) {
                this.selectedProperty = matched;
                this.incidentForm.patchValue({ propertyId: matched.id });
              }
            }
          }
        },
      });
  }

  private loadCustomerSupplies(customerId: string) {
    this.supplyService
      .findAll(0, 100, undefined, undefined, undefined, customerId)
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.supplies = res.data.content;

            if (this.selectedSupply) {
              const matched = this.supplies.find(
                (s) => s.id === this.selectedSupply.id,
              );
              if (matched) {
                this.incidentForm.patchValue({ supplyId: matched.id });
              }
            } else if (this.supplies.length === 1) {
              this.selectedSupply = this.supplies[0];
              this.incidentForm.patchValue({ supplyId: this.supplies[0].id });
            }
          }
        },
      });
  }

  onPropertyChange(propertyId: string) {
    this.selectedProperty =
      this.properties.find((p) => p.id === propertyId) || null;
  }

  onSupplyChange(supplyId: string) {
    this.selectedSupply = this.supplies.find((s) => s.id === supplyId) || null;
  }

  onSubmit() {
    if (this.incidentForm.invalid) {
      this.incidentForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const dto = this.incidentForm.value;

    this.incidentService.create(dto).subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res.success) {
          void Swal.fire({
            icon: 'success',
            title: '¡Registrado!',
            text: 'La incidencia ha sido registrada correctamente.',
            confirmButtonColor: '#2563eb',
          }).then(() => {
            this.goBack();
          });
        } else {
          void Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.message || 'No se pudo registrar la incidencia.',
            confirmButtonColor: '#2563eb',
          });
        }
      },
      error: (err) => {
        this.isSaving = false;
        void Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Error de conexión con el servidor.',
          confirmButtonColor: '#2563eb',
        });
      },
    });
  }

  goBack() {
    window.history.back();
  }
}
