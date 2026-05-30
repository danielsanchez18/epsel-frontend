import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '@core/utils/api';
import { ApiResponse } from '@core/interfaces/shared/api-response.interface';
import { PaginatedResponse } from '@core/interfaces/shared/paginated-response.interface';
import {
  CreateSupplyOperationDTO,
  SupplyOperationResponseDTO,
  SupplyOperationType,
} from '@interfaces/supplies-operations/supplies-operations.interface';

@Injectable({
  providedIn: 'root',
})
export class SuppliesOperationsService {
  private http = inject(HttpClient);
  private baseUrl = `${API_URL}/supply-operations`;

  getById(id: string): Observable<ApiResponse<SupplyOperationResponseDTO>> {
    return this.http.get<ApiResponse<SupplyOperationResponseDTO>>(
      `${this.baseUrl}/${id}`,
    );
  }

  search(
    page: number = 0,
    size: number = 10,
    supplyId?: string,
    type?: SupplyOperationType,
    startDate?: string,
    endDate?: string,
  ): Observable<
    ApiResponse<PaginatedResponse<SupplyOperationResponseDTO>['data']>
  > {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (supplyId) params = params.set('supplyId', supplyId);
    if (type) params = params.set('type', type);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<
      ApiResponse<PaginatedResponse<SupplyOperationResponseDTO>['data']>
    >(this.baseUrl, { params });
  }

  create(
    dto: CreateSupplyOperationDTO,
  ): Observable<ApiResponse<SupplyOperationResponseDTO>> {
    return this.http.post<ApiResponse<SupplyOperationResponseDTO>>(
      this.baseUrl,
      dto,
    );
  }
}
