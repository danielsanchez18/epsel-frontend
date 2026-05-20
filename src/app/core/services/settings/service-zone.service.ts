import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/utils/api';
import { ApiResponse } from '@core/interfaces/shared/api-response.interface';
import { PaginatedResponse } from '@core/interfaces/shared/paginated-response.interface';
import {
  ServiceZoneResponse,
  CreateServiceZoneRequest,
  UpdateServiceZoneRequest
} from '@core/interfaces/settings/settings.interface';

@Injectable({
  providedIn: 'root'
})
export class ServiceZoneService {
  private http = inject(HttpClient);
  private baseUrl = `${API_URL}/configurations/service-zones`;

  create(dto: CreateServiceZoneRequest): Observable<ApiResponse<ServiceZoneResponse>> {
    return this.http.post<ApiResponse<ServiceZoneResponse>>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateServiceZoneRequest): Observable<ApiResponse<ServiceZoneResponse>> {
    return this.http.put<ApiResponse<ServiceZoneResponse>>(`${this.baseUrl}/${id}`, dto);
  }

  changeStatus(id: string, active: boolean): Observable<ApiResponse<void>> {
    const params = new HttpParams().set('active', active.toString());
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/change-status`, {}, { params });
  }

  getById(id: string): Observable<ApiResponse<ServiceZoneResponse>> {
    return this.http.get<ApiResponse<ServiceZoneResponse>>(`${this.baseUrl}/${id}`);
  }

  getAll(page: number = 0, size: number = 10, search?: string, active?: boolean): Observable<ApiResponse<PaginatedResponse<ServiceZoneResponse>['data']>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (search) params = params.set('search', search);
    if (active !== undefined) params = params.set('active', active.toString());
    return this.http.get<ApiResponse<PaginatedResponse<ServiceZoneResponse>['data']>>(this.baseUrl, { params });
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}
