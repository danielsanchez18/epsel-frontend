import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { LucideUser, LucideBadgeX, LucideUserCheck, LucideBuilding, LucideLoader } from "@lucide/angular";
import { PropertyService } from '@services/properties/property.service';
import { CustomerService } from '@services/customers/customer.service';
import { CustomerResponse } from '@interfaces/customers/customer.interface';

// Interface adaptada para la vista si en un futuro hay historial
export interface AffiliatedClientView {
  customer: CustomerResponse;
  status: 'ACTUAL' | 'ANTERIOR';
  assignedAt: Date;
}

@Component({
  selector: 'page-dashboard-properties-details-affiliated-clients',
  imports: [
    CommonModule,
    LucideUser,
    LucideBadgeX,
    LucideUserCheck,
    LucideBuilding,
    LucideLoader,
    RouterLink
],
  templateUrl: './affiliated-clients.html',
})
export class PageDashboardPropertiesDetailsAffiliatedClients implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private propertyService = inject(PropertyService);
  private customerService = inject(CustomerService);

  private sub!: Subscription;

  isLoading = true;
  clients: AffiliatedClientView[] = [];

  ngOnInit() {
    this.sub = this.route.parent!.paramMap.subscribe(params => {
      const propertyId = params.get('id');
      if (propertyId) {
        this.loadAffiliatedClients(propertyId);
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  private loadAffiliatedClients(propertyId: string) {
    this.isLoading = true;

    // Como actualmente la API provee solo el cliente actual dentro del detalle de Property:
    this.propertyService.getById(propertyId).subscribe({
      next: (res) => {
        if (res.success && res.data?.customerId) {
          // Buscamos el detalle completo del cliente para mostrar su tipo (PERSON/COMPANY) exacto
          this.customerService.getById(res.data.customerId).subscribe({
            next: (customerRes) => {
              this.isLoading = false;
              if (customerRes.success && customerRes.data) {
                this.clients = [{
                  customer: customerRes.data,
                  status: 'ACTUAL',
                  // simulamos la fecha de asignación con la de creación del cliente o propiedad
                  assignedAt: new Date(customerRes.data.createdAt || new Date())
                }];
              }
            },
            error: () => {
              this.isLoading = false;
            }
          });
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  removeClient(client: AffiliatedClientView) {
    // Aquí podrías implementar la desvinculación o pase a "historial" si la API lo permite
    console.log('Remover cliente:', client.customer.id);
  }
}
