import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { IncidentService } from '@core/services/incidents/incident.service';
import { CustomerService } from '@services/customers/customer.service';
import { PropertyService } from '@services/properties/property.service';
import { SupplyService } from '@services/supplies/supply.service';

import { IncidentResponseDTO, IncidentPriority, IncidentStatus, IncidentType } from '@interfaces/incidents/incident.interface';
import { CustomerResponse } from '@interfaces/customers/customer.interface';
import { PropertyResponse } from '@interfaces/properties/properties.interface';
import { SupplyDetailsDTO } from '@interfaces/supplies/supply.interface';

@Component({
  selector: 'page-dashboard-incidents-details',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './details.html',
})
export class PageDashboardIncidentsDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private incidentService = inject(IncidentService);
  private customerService = inject(CustomerService);
  private propertyService = inject(PropertyService);
  private supplyService = inject(SupplyService);

  incidentId: string | null = null;
  incident: IncidentResponseDTO | null = null;
  
  customer: CustomerResponse | null = null;
  property: PropertyResponse | null = null;
  supply: SupplyDetailsDTO | null = null;

  isLoading = true;

  ngOnInit(): void {
    this.incidentId = this.route.snapshot.paramMap.get('id');
    if (this.incidentId) {
      this.loadIncident(this.incidentId);
    }
  }

  loadIncident(id: string): void {
    this.isLoading = true;
    this.incidentService.getById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.incident = res.data;
          
          if (res.data.customerId) {
            this.loadCustomer(res.data.customerId);
          }
          if (res.data.propertyId) {
            this.loadProperty(res.data.propertyId);
          }
          if (res.data.supplyId) {
            this.loadSupply(res.data.supplyId);
          }
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  loadCustomer(id: string): void {
    this.customerService.getById(id).subscribe({
      next: (res) => {
        if (res.success) this.customer = res.data;
      }
    });
  }

  loadProperty(id: string): void {
    this.propertyService.getById(id).subscribe({
      next: (res) => {
        if (res.success) this.property = res.data;
      }
    });
  }

  loadSupply(id: string): void {
    this.supplyService.getById(id).subscribe({
      next: (res) => {
        if (res.success) this.supply = res.data;
      }
    });
  }

  getTypeLabel(type?: IncidentType): string {
    switch (type) {
      case 'BILLING_COMPLAINT': return 'Reclamo por recibo elevado';
      case 'PAYMENT_COMPLAINT': return 'Pago no reflejado';
      case 'SERVICE_INTERRUPTION': return 'Interrupción del servicio';
      case 'LOW_PRESSURE': return 'Baja presión de agua';
      case 'WATER_LEAK': return 'Fuga de agua en vía pública';
      case 'METER_DAMAGE': return 'Medidor dañado';
      case 'METER_REPLACEMENT': return 'Reemplazo de medidor';
      case 'ABNORMAL_CONSUMPTION': return 'Consumo anormal detectado';
      case 'OCR_ANOMALY': return 'Posible error de lectura OCR';
      case 'READING_ANOMALY': return 'Anomalía de lectura';
      case 'SUPPLY_CUT_COMPLAINT': return 'Reclamo por corte de suministro';
      case 'OTHER': return 'Otro';
      default: return type || '-';
    }
  }

  getPriorityLabel(priority?: IncidentPriority): string {
    switch (priority) {
      case 'LOW': return 'Baja';
      case 'MEDIUM': return 'Media';
      case 'HIGH': return 'Alta';
      case 'CRITICAL': return 'Crítica';
      default: return priority || '-';
    }
  }

  getPriorityClass(priority?: IncidentPriority): string {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-700 border-green-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'HIGH': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200 font-bold';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  getStatusLabel(status?: IncidentStatus): string {
    switch (status) {
      case 'OPEN': return 'Abierta';
      case 'IN_PROGRESS': return 'En proceso';
      case 'RESOLVED': return 'Resuelta';
      case 'CLOSED': return 'Cerrada';
      case 'REJECTED': return 'Rechazada';
      default: return status || '-';
    }
  }

  getStatusClass(status?: IncidentStatus): string {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'RESOLVED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  formatDate(value?: string | null): string {
    if (!value) return '-';
    if (value.includes('T')) {
      const [year, month, day] = value.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    }
    const parts = value.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return new Date(value).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  onStartProgress(): void {
    if (!this.incidentId) return;
    Swal.fire({
      title: 'Iniciar Atención',
      text: '¿Está seguro de iniciar la atención de esta incidencia? El estado cambiará a "En proceso".',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Sí, iniciar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb'
    }).then((result) => {
      if (result.isConfirmed) {
        this.incidentService.startProgress(this.incidentId!).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire('Atención Iniciada', 'La incidencia se encuentra en proceso.', 'success');
              this.loadIncident(this.incidentId!);
            } else {
              Swal.fire('Error', res.message || 'No se pudo actualizar el estado.', 'error');
            }
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'Error al iniciar la atención.', 'error');
          }
        });
      }
    });
  }

  onResolve(): void {
    if (!this.incidentId) return;
    Swal.fire({
      title: 'Resolver Incidencia',
      text: 'Detalle la resolución de la incidencia (mínimo 10 caracteres):',
      input: 'textarea',
      inputPlaceholder: 'Ingrese la resolución aquí...',
      showCancelButton: true,
      confirmButtonText: 'Resolver',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#16a34a',
      preConfirm: (value) => {
        if (!value || value.trim().length < 10) {
          Swal.showValidationMessage('El detalle de la resolución es obligatorio y debe tener al menos 10 caracteres');
          return false;
        }
        return value;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.incidentService.resolve(this.incidentId!, { resolution: result.value }).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire('Incidencia Resuelta', 'La incidencia ha sido resuelta.', 'success');
              this.loadIncident(this.incidentId!);
            } else {
              Swal.fire('Error', res.message || 'No se pudo resolver la incidencia.', 'error');
            }
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'Error al resolver la incidencia.', 'error');
          }
        });
      }
    });
  }

  onClose(): void {
    if (!this.incidentId) return;
    Swal.fire({
      title: 'Cerrar Incidencia',
      text: '¿Está seguro de cerrar definitivamente esta incidencia? El estado cambiará a "Cerrada".',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4b5563'
    }).then((result) => {
      if (result.isConfirmed) {
        this.incidentService.close(this.incidentId!).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire('Incidencia Cerrada', 'La incidencia ha sido cerrada definitivamente.', 'success');
              this.loadIncident(this.incidentId!);
            } else {
              Swal.fire('Error', res.message || 'No se pudo cerrar la incidencia.', 'error');
            }
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'Error al cerrar la incidencia.', 'error');
          }
        });
      }
    });
  }

  onReject(): void {
    if (!this.incidentId) return;
    Swal.fire({
      title: 'Rechazar Incidencia',
      text: 'Ingrese el motivo del rechazo de la incidencia:',
      input: 'text',
      inputPlaceholder: 'Ingrese el motivo aquí...',
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      preConfirm: (value) => {
        if (!value || value.trim() === '') {
          Swal.showValidationMessage('El motivo de rechazo es obligatorio');
          return false;
        }
        return value;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.incidentService.reject(this.incidentId!, { resolution: result.value }).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire('Incidencia Rechazada', 'La incidencia ha sido rechazada.', 'success');
              this.loadIncident(this.incidentId!);
            } else {
              Swal.fire('Error', res.message || 'No se pudo rechazar la incidencia.', 'error');
            }
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'Error al rechazar la incidencia.', 'error');
          }
        });
      }
    });
  }
}
