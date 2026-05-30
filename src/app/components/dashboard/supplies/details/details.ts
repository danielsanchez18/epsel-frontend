import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { SupplyDetailsDTO } from '@core/interfaces/supplies/supply.interface';
import { SupplyService } from '@core/services/supplies/supply.service';

@Component({
  selector: 'component-dashboard-supplies-details',
  imports: [CommonModule],
  templateUrl: './details.html',
})
export class ComponentDashboardSuppliesDetails implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private supplyService = inject(SupplyService);

  supply: SupplyDetailsDTO | null = null;
  isLoading = true;

  private sub?: Subscription;

  ngOnInit(): void {
    const parentRoute = this.route.parent;
    if (parentRoute) {
      this.sub = parentRoute.paramMap.subscribe(params => {
        const id = params.get('id') || this.route.snapshot.paramMap.get('id');
        if (id) {
          this.loadSupply(id);
        }
      });
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSupply(id);
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadSupply(id: string): void {
    this.isLoading = true;
    this.supplyService.getById(id).subscribe({
      next: (res) => {
        this.supply = res.success ? res.data : null;
        this.isLoading = false;
      },
      error: () => {
        this.supply = null;
        this.isLoading = false;
      }
    });
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'ACTIVE': return 'Activo';
      case 'SUSPENDED': return 'Suspendido';
      case 'CUT_OFF': return 'Cortado';
      case 'RECONNECTED': return 'Reconectado';
      default: return status || 'Sin estado';
    }
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700 border-green-200';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CUT_OFF': return 'bg-red-100 text-red-700 border-red-200';
      case 'RECONNECTED': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  formatDate(value?: string | null): string {
    return value ? new Date(value).toLocaleDateString('es-PE') : '-';
  }

  onSuspend(): void {
    if (!this.supply) return;
    const id = this.supply.id;

    Swal.fire({
      title: 'Suspender Suministro',
      text: `¿Está seguro de suspender el suministro ${this.supply.supplyNumber}?`,
      input: 'text',
      inputPlaceholder: 'Ingrese el motivo de la suspensión (obligatorio)...',
      showCancelButton: true,
      confirmButtonText: 'Suspender',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d97706',
      preConfirm: (reason) => {
        if (!reason || reason.trim() === '') {
          Swal.showValidationMessage('El motivo es obligatorio');
          return false;
        }
        return reason;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.supplyService.suspend(id, { reason: result.value }).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire({
                title: 'Suministro Suspendido',
                text: 'El suministro ha sido suspendido exitosamente.',
                icon: 'success',
                confirmButtonColor: '#2563eb'
              });
              this.loadSupply(id);
            } else {
              Swal.fire('Error', res.message || 'No se pudo suspender el suministro.', 'error');
            }
          },
          error: () => {
            Swal.fire('Error', 'Ocurrió un error al suspender el suministro.', 'error');
          }
        });
      }
    });
  }

  onCutOff(): void {
    if (!this.supply) return;
    const id = this.supply.id;

    Swal.fire({
      title: 'Cortar Suministro',
      text: `¿Está seguro de cortar el suministro ${this.supply.supplyNumber}?`,
      input: 'text',
      inputPlaceholder: 'Ingrese el motivo del corte (obligatorio)...',
      showCancelButton: true,
      confirmButtonText: 'Cortar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      preConfirm: (reason) => {
        if (!reason || reason.trim() === '') {
          Swal.showValidationMessage('El motivo es obligatorio');
          return false;
        }
        return reason;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.supplyService.cutOff(id, { reason: result.value }).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire({
                title: 'Suministro Cortado',
                text: 'El suministro ha sido cortado exitosamente.',
                icon: 'success',
                confirmButtonColor: '#2563eb'
              });
              this.loadSupply(id);
            } else {
              Swal.fire('Error', res.message || 'No se pudo cortar el suministro.', 'error');
            }
          },
          error: () => {
            Swal.fire('Error', 'Ocurrió un error al cortar el suministro.', 'error');
          }
        });
      }
    });
  }

  onReconnect(): void {
    if (!this.supply) return;
    const id = this.supply.id;

    Swal.fire({
      title: 'Reconectar Suministro',
      html: `
        <div class="text-left space-y-3">
          <p class="text-xs text-gray-500">Suministro: <strong>${this.supply.supplyNumber}</strong></p>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-gray-700">Motivo de Reconexión:</label>
            <input id="swal-reconnect-reason" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-hidden" placeholder="Ej: Pago de deuda pendiente" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-gray-700">Observaciones (Opcional):</label>
            <textarea id="swal-reconnect-obs" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-hidden" placeholder="Ingrese observaciones..."></textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Reconectar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#16a34a',
      preConfirm: () => {
        const reasonInput = document.getElementById('swal-reconnect-reason') as HTMLInputElement;
        const obsInput = document.getElementById('swal-reconnect-obs') as HTMLTextAreaElement;

        const reason = reasonInput.value;
        if (!reason || reason.trim() === '') {
          Swal.showValidationMessage('El motivo es obligatorio');
          return false;
        }

        return {
          reason: reason,
          observations: obsInput.value || undefined
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.supplyService.reconnect(id, result.value).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire({
                title: 'Suministro Reconectado',
                text: 'El suministro ha sido reconectado exitosamente.',
                icon: 'success',
                confirmButtonColor: '#2563eb'
              });
              this.loadSupply(id);
            } else {
              Swal.fire('Error', res.message || 'No se pudo reconectar el suministro.', 'error');
            }
          },
          error: () => {
            Swal.fire('Error', 'Ocurrió un error al reconectar el suministro.', 'error');
          }
        });
      }
    });
  }
}