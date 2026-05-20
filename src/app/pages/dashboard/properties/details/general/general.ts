import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PropertyService } from '@core/services/properties/property.service';
import { PropertyResponse } from '@interfaces/properties/properties.interface';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'page-dashboard-properties-details-general',
  imports: [
    RouterModule,
    CommonModule
  ],
  templateUrl: './general.html',
})
export class PageDashboardPropertiesDetailsGeneral {

  routes = [
    { name: 'Clientes Asociados', path: 'clientes-asociados' },
    { name: 'Suministros', path: 'suministros' },
    { name: 'Consumo', path: 'consumo' },
    { name: 'Facturación', path: 'facturacion' },
    { name: 'Incidencias', path: 'incidencias' },
    { name: 'Órdenes de Trabajo', path: 'ordenes-de-trabajo' },
    { name: 'Documentos', path: 'documentos' },
    { name: 'Historial', path: 'historial' },
  ]

  private propertyService = inject(PropertyService);
  private route = inject(ActivatedRoute);

  private propertySubject = new BehaviorSubject<PropertyResponse | null>(null);
  public property$ = this.propertySubject.asObservable();
  public property: PropertyResponse | null = null;

  propertyId: string | null = null;
  isLoading = true;

  ngOnInit() {
    this.propertyId = this.route.snapshot.paramMap.get('id') || null;
    if (this.propertyId) {
      this.loadProperty();
    }
  }

  private loadProperty() {
    this.isLoading = true;
    this.propertyService.getById(this.propertyId!).subscribe({
      next: (res) => {
        this.property = res.data;
        this.propertySubject.next(res.data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading property:', error);
        this.isLoading = false;
      }
    });
  }

  updatePropertyData(data: PropertyResponse) {
    this.property = data;
    this.propertySubject.next(data);
  }

}
