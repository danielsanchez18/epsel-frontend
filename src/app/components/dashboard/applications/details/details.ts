import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

import { CustomerService } from '@services/customers/customer.service';
import { PropertyService } from '@services/properties/property.service';
import { SupplyService } from '@services/supplies/supply.service';
import { InstallationRequestService } from '@services/supplies/installation-request.service';

import { CustomerResponse } from '@interfaces/customers/customer.interface';
import { PropertyResponse } from '@interfaces/properties/properties.interface';
import { InstallationRequestResponse } from '@interfaces/supplies/installation-request.interface';
import { SupplyDetailsDTO } from '@interfaces/supplies/supply.interface';

@Component({
  selector: 'component-dashboard-applications-details',
  imports: [CommonModule],
  templateUrl: './details.html',
})
export class ComponentDashboardApplicationsDetails implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private requestService = inject(InstallationRequestService);
  private customerService = inject(CustomerService);
  private propertyService = inject(PropertyService);
  private supplyService = inject(SupplyService);

  request: InstallationRequestResponse | null = null;
  customer: CustomerResponse | null = null;
  property: PropertyResponse | null = null;
  supply: SupplyDetailsDTO | null = null;

  isLoading = true;
  isActionLoading = false;

  private sub?: Subscription;

  ngOnInit(): void {
    const parentRoute = this.route.parent;
    if (parentRoute) {
      this.sub = parentRoute.paramMap.subscribe(params => {
        const id = params.get('id') || this.route.snapshot.paramMap.get('id');
        if (id) {
          this.loadRequest(id);
        }
      });
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.loadRequest(id);
      }
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadRequest(id: string): void {
    this.isLoading = true;
    this.requestService.getById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.request = res.data;
          this.resolveRelatedData(res.data);
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private resolveRelatedData(request: InstallationRequestResponse): void {
    const propertyId = request.propertyId;
    const customerId = request.customerId;

    if (propertyId) {
      this.propertyService.getById(propertyId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.property = res.data;
            this.loadCustomerById(customerId || res.data.customerId);
          } else {
            this.isLoading = false;
          }
        },
        error: () => {
          this.isLoading = false;
        }
      });
      return;
    }

    if (customerId) {
      this.loadCustomerById(customerId);
      return;
    }

    this.isLoading = false;
  }

  private loadCustomerById(id: string): void {
    this.customerService.getById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.customer = res.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'APPROVED': return 'Aprobada';
      case 'REJECTED': return 'Rechazada';
      case 'INSTALLED': return 'Instalada';
      default: return status || 'Sin estado';
    }
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'APPROVED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      case 'INSTALLED': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  getDocumentTypeLabel(type?: string): string {
    if (type === 'PERSON') return 'DNI';
    if (type === 'COMPANY') return 'RUC';
    return type || '-';
  }

  formatDate(value?: string | null): string {
    return value ? new Date(value).toLocaleDateString('es-PE') : '-';
  }

  approveRequest(): void {
    if (!this.request) return;

    Swal.fire({
      icon: 'question',
      title: 'Aprobar solicitud',
      text: '¿Deseas aprobar esta solicitud de instalación?',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb'
    }).then(result => {
      if (!result.isConfirmed) return;
      this.executeAction(() => this.requestService.approve(this.request!.id), 'Solicitud aprobada correctamente.');
    });
  }

  rejectRequest(): void {
    if (!this.request) return;

    Swal.fire({
      icon: 'warning',
      title: 'Rechazar solicitud',
      input: 'textarea',
      inputLabel: 'Observaciones',
      inputPlaceholder: 'Escribe el motivo del rechazo',
      inputAttributes: {
        maxlength: '500'
      },
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      preConfirm: (value) => {
        if (!value || !value.trim()) {
          Swal.showValidationMessage('Debes escribir una observación.');
          return;
        }
        return value.trim();
      }
    }).then(result => {
      if (!result.isConfirmed || !result.value) return;
      this.executeAction(() => this.requestService.reject(this.request!.id, result.value), 'Solicitud rechazada correctamente.');
    });
  }

  installRequest(): void {
    if (!this.request) return;

    Swal.fire({
      icon: 'question',
      title: 'Registrar instalación',
      input: 'text',
      inputLabel: 'Número de medidor',
      inputPlaceholder: 'Ingresa el número de medidor',
      inputAttributes: {
        maxlength: '50'
      },
      showCancelButton: true,
      confirmButtonText: 'Sí, instalar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#16a34a'
      ,
      preConfirm: (value) => {
        if (!value || !value.trim()) {
          Swal.showValidationMessage('El número de medidor es requerido.');
          return;
        }
        return value.trim();
      }
    }).then(result => {
      if (!result.isConfirmed || !result.value) return;
      this.executeAction(
        () => this.requestService.install(this.request!.id, { meterNumber: result.value }),
        'Solicitud marcada como instalada.'
      );
    });
  }

  private executeAction(action: () => any, successMessage: string): void {
    this.isActionLoading = true;
    action().subscribe({
      next: (res: any) => {
        this.isActionLoading = false;
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: res.message || successMessage,
            confirmButtonColor: '#2563eb'
          });
          if (this.request) {
            this.loadRequest(this.request.id);
          }
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.message || 'No se pudo completar la acción.',
            confirmButtonColor: '#d33'
          });
        }
      },
      error: (err: any) => {
        this.isActionLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Error de conexión con el servidor.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  canApproveOrReject(): boolean {
    return this.request?.status === 'PENDING';
  }

  canInstall(): boolean {
    return this.request?.status === 'APPROVED';
  }

  canViewSupply(): boolean {
    return this.request?.status === 'INSTALLED';
  }

  goToSupplies(): void {
    if (!this.request) return;

    this.isActionLoading = true;
    this.supplyService.getByInstallationRequestId(this.request.id).subscribe({
      next: (res) => {
        this.isActionLoading = false;
        if (res.success && res.data) {
          this.supply = res.data;
          this.router.navigate(['/dashboard/suministros', res.data.id]);
          return;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: res.message || 'No se pudo encontrar el suministro asociado a la solicitud.',
          confirmButtonColor: '#d33'
        });
      },
      error: (err: any) => {
        this.isActionLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Error de conexión con el servidor.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  getTimeline(): Array<{ label: string; date?: string | null; active: boolean; done: boolean }> {
    const status = this.request?.status;
    return [
      { label: 'Creada', date: this.request?.requestedDate, active: true, done: true },
      { label: 'Aprobada', date: this.request?.approvedDate, active: status === 'APPROVED' || status === 'INSTALLED', done: !!this.request?.approvedDate },
      { label: 'Realizada', date: this.request?.installationDate, active: status === 'INSTALLED', done: !!this.request?.installationDate },
      { label: 'Rechazada', date: this.request?.rejectedDate, active: status === 'REJECTED', done: !!this.request?.rejectedDate },
    ];
  }
}
