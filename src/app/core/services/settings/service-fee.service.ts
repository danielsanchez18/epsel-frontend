import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/utils/api';
import { ApiResponse } from '@core/interfaces/shared/api-response.interface';
import { PaginatedResponse } from '@core/interfaces/shared/paginated-response.interface';
import {
  ServiceFeeConfigurationResponse,
  CreateServiceFeeConfigurationRequest,
  UpdateServiceFeeConfigurationRequest,
  ServiceFeeType
} from '@core/interfaces/settings/settings.interface';

@Injectable({
  providedIn: 'root'
})
export class ServiceFeeService {
  private http = inject(HttpClient);
  private baseUrl = `${API_URL}/configurations/service-fees`;

  create(dto: CreateServiceFeeConfigurationRequest): Observable<ApiResponse<ServiceFeeConfigurationResponse>> {
    return this.http.post<ApiResponse<ServiceFeeConfigurationResponse>>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateServiceFeeConfigurationRequest): Observable<ApiResponse<ServiceFeeConfigurationResponse>> {
    return this.http.put<ApiResponse<ServiceFeeConfigurationResponse>>(`${this.baseUrl}/${id}`, dto);
  }

  getById(id: string): Observable<ApiResponse<ServiceFeeConfigurationResponse>> {
    return this.http.get<ApiResponse<ServiceFeeConfigurationResponse>>(`${this.baseUrl}/${id}`);
  }

  getAll(page: number = 0, size: number = 10, zoneId?: string, feeType?: ServiceFeeType, active?: boolean): Observable<ApiResponse<PaginatedResponse<ServiceFeeConfigurationResponse>['data']>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (zoneId) params = params.set('zoneId', zoneId);
    if (feeType) params = params.set('feeType', feeType);
    if (active !== undefined) params = params.set('active', active.toString());
    return this.http.get<ApiResponse<PaginatedResponse<ServiceFeeConfigurationResponse>['data']>>(this.baseUrl, { params });
  }

  disable(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/disable`, {});
  }
}
