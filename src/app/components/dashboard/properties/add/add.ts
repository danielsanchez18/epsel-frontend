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
import { LucideLoader, LucideMapPin, LucideKeyboard, LucideSearch } from '@lucide/angular';
import * as L from 'leaflet';

@Component({
  selector: 'component-dashboard-properties-add',
  imports: [CommonModule, ReactiveFormsModule, LucideLoader, LucideMapPin, LucideKeyboard, LucideSearch],
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
  isSearchingAddress = false;

  mapMode = false;
  private map: L.Map | undefined;
  private marker: L.Marker | undefined;

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
    this.fixLeafletIcons();
  }

  fixLeafletIcons() {
    const iconDefault = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  toggleMapMode() {
    this.mapMode = !this.mapMode;
    if (this.mapMode) {
      setTimeout(() => {
        this.initMap();
      }, 100);
    }
  }

  initMap() {
    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    // Default to Chiclayo
    const defaultLat = -6.77137;
    const defaultLng = -79.84088;

    const lat = this.propertyForm.get('latitude')?.value || defaultLat;
    const lng = this.propertyForm.get('longitude')?.value || defaultLng;

    this.map = L.map('property-map').setView([lat, lng], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(this.map);

    if (this.propertyForm.get('latitude')?.value && this.propertyForm.get('longitude')?.value) {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    }

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      if (this.marker) {
        this.marker.setLatLng([lat, lng]);
      } else {
        this.marker = L.marker([lat, lng]).addTo(this.map!);
      }

      this.propertyForm.patchValue({
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lng.toFixed(6))
      });
    });
  }

  searchAddressOnMap() {
    const address = this.propertyForm.get('address')?.value;
    if (!address) return;

    this.isSearchingAddress = true;
    
    // Agregamos "Peru" para mejorar la precisión para Epsel
    const query = encodeURIComponent(`${address}, Peru`);
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
      .then(res => res.json())
      .then(data => {
        this.isSearchingAddress = false;
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          
          this.propertyForm.patchValue({ latitude: lat, longitude: lng });
          
          if (!this.mapMode) {
            this.mapMode = true;
            setTimeout(() => {
              this.initMap();
              if (this.map) {
                this.map.setView([lat, lng], 16);
              }
            }, 100);
          } else {
            if (this.map) {
              this.map.setView([lat, lng], 16);
              if (this.marker) {
                this.marker.setLatLng([lat, lng]);
              } else {
                this.marker = L.marker([lat, lng]).addTo(this.map);
              }
            }
          }
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Sin resultados',
            text: 'No se pudo ubicar la dirección ingresada en el mapa.',
            confirmButtonColor: '#2563eb',
          });
        }
      })
      .catch(err => {
        this.isSearchingAddress = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al buscar la dirección.',
          confirmButtonColor: '#d33',
        });
      });
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
