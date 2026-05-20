import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '@core/utils/api';
import { ApiResponse } from '@core/interfaces/shared/api-response.interface';
import { PaginatedResponse } from '@core/interfaces/shared/paginated-response.interface';
import { ReconnectSupplyDTO, SupplyDetailsDTO, SupplyResponseDTO, SupplyStatus, SuspendSupplyDTO } from '@core/interfaces/supplies/supply.interface';

@Injectable({
  providedIn: 'root'
})
export class SupplyService {

  private http = inject(HttpClient);
  private baseUrl = `${API_URL}/supplies`;

  findAll(
    page: number = 0,
    size: number = 10,
    search?: string,
    status?: SupplyStatus,
    zoneId?: string
  ): Observable<ApiResponse<PaginatedResponse<SupplyResponseDTO>['data']>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (zoneId) params = params.set('zoneId', zoneId);

    return this.http.get<ApiResponse<PaginatedResponse<SupplyResponseDTO>['data']>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<ApiResponse<SupplyDetailsDTO>> {
    return this.http.get<ApiResponse<SupplyDetailsDTO>>(`${this.baseUrl}/${id}`);
  }

  suspend(id: string, dto: SuspendSupplyDTO): Observable<ApiResponse<SupplyResponseDTO>> {
    return this.http.patch<ApiResponse<SupplyResponseDTO>>(`${this.baseUrl}/${id}/suspend`, dto);
  }

  cutOff(id: string, dto: SuspendSupplyDTO): Observable<ApiResponse<SupplyResponseDTO>> {
    return this.http.patch<ApiResponse<SupplyResponseDTO>>(`${this.baseUrl}/${id}/cut-off`, dto);
  }

  reconnect(id: string, dto: ReconnectSupplyDTO): Observable<ApiResponse<SupplyResponseDTO>> {
    return this.http.patch<ApiResponse<SupplyResponseDTO>>(`${this.baseUrl}/${id}/reconnect`, dto);
  }
}
