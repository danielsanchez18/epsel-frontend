import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '@core/utils/api';
import { ApiResponse } from '@core/interfaces/shared/api-response.interface';
import { PaginatedResponse } from '@core/interfaces/shared/paginated-response.interface';
import {
  CreateSupplyWorkOrderDTO,
  AssignWorkOrderDTO,
  StartWorkOrderDTO,
  CompleteWorkOrderDTO,
  CancelWorkOrderDTO,
  SupplyWorkOrderResponseDTO,
  WorkOrderStatus,
  WorkOrderType,
} from '@interfaces/supply-work-orders/supply-work-orders.interface';

@Injectable({
  providedIn: 'root',
})
export class SupplyWorkOrdersService {
  private http = inject(HttpClient);
  private baseUrl = `${API_URL}/supply-work-orders`;

  create(
    dto: CreateSupplyWorkOrderDTO,
  ): Observable<ApiResponse<SupplyWorkOrderResponseDTO>> {
    return this.http.post<ApiResponse<SupplyWorkOrderResponseDTO>>(
      this.baseUrl,
      dto,
    );
  }

  getById(id: string): Observable<ApiResponse<SupplyWorkOrderResponseDTO>> {
    return this.http.get<ApiResponse<SupplyWorkOrderResponseDTO>>(
      `${this.baseUrl}/${id}`,
    );
  }

  search(
    page: number = 0,
    size: number = 10,
    supplyId?: string,
    type?: WorkOrderType,
    status?: WorkOrderStatus,
  ): Observable<
    ApiResponse<PaginatedResponse<SupplyWorkOrderResponseDTO>['data']>
  > {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (supplyId) params = params.set('supplyId', supplyId);
    if (type) params = params.set('type', type);
    if (status) params = params.set('status', status);

    return this.http.get<
      ApiResponse<PaginatedResponse<SupplyWorkOrderResponseDTO>['data']>
    >(this.baseUrl, { params });
  }

  assign(
    id: string,
    dto: AssignWorkOrderDTO,
  ): Observable<ApiResponse<SupplyWorkOrderResponseDTO>> {
    return this.http.put<ApiResponse<SupplyWorkOrderResponseDTO>>(
      `${this.baseUrl}/${id}/assign`,
      dto,
    );
  }

  start(
    id: string,
    dto: StartWorkOrderDTO,
  ): Observable<ApiResponse<SupplyWorkOrderResponseDTO>> {
    return this.http.put<ApiResponse<SupplyWorkOrderResponseDTO>>(
      `${this.baseUrl}/${id}/start`,
      dto,
    );
  }

  complete(
    id: string,
    dto: CompleteWorkOrderDTO,
  ): Observable<ApiResponse<SupplyWorkOrderResponseDTO>> {
    return this.http.put<ApiResponse<SupplyWorkOrderResponseDTO>>(
      `${this.baseUrl}/${id}/complete`,
      dto,
    );
  }

  cancel(
    id: string,
    dto: CancelWorkOrderDTO,
  ): Observable<ApiResponse<SupplyWorkOrderResponseDTO>> {
    return this.http.put<ApiResponse<SupplyWorkOrderResponseDTO>>(
      `${this.baseUrl}/${id}/cancel`,
      dto,
    );
  }
}
