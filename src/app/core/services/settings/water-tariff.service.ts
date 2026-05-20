import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/utils/api';
import { ApiResponse } from '@core/interfaces/shared/api-response.interface';
import { PaginatedResponse } from '@core/interfaces/shared/paginated-response.interface';
import {
  WaterTariffConfigurationResponse,
  CreateWaterTariffConfigurationRequest
} from '@core/interfaces/settings/settings.interface';

@Injectable({
  providedIn: 'root'
})
export class WaterTariffService {
  private http = inject(HttpClient);
  private baseUrl = `${API_URL}/configurations/water-tariffs`;

  create(dto: CreateWaterTariffConfigurationRequest): Observable<ApiResponse<WaterTariffConfigurationResponse>> {
    return this.http.post<ApiResponse<WaterTariffConfigurationResponse>>(this.baseUrl, dto);
  }

  getById(id: string): Observable<ApiResponse<WaterTariffConfigurationResponse>> {
    return this.http.get<ApiResponse<WaterTariffConfigurationResponse>>(`${this.baseUrl}/${id}`);
  }

  getAll(page: number = 0, size: number = 10, zoneName?: string, active?: boolean): Observable<ApiResponse<PaginatedResponse<WaterTariffConfigurationResponse>['data']>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (zoneName) params = params.set('zoneName', zoneName);
    if (active !== undefined) params = params.set('active', active.toString());
    return this.http.get<ApiResponse<PaginatedResponse<WaterTariffConfigurationResponse>['data']>>(this.baseUrl, { params });
  }

  disable(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/${id}/disable`, {});
  }
}
