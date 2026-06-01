import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '@core/utils/api';
import { ApiResponse } from '@core/interfaces/shared/api-response.interface';
import { PaginatedResponse } from '@core/interfaces/shared/paginated-response.interface';
import {
  CreateIncidentDTO,
  IncidentResponseDTO,
  ResolveIncidentDTO,
  IncidentStatus,
  IncidentPriority,
  IncidentType
} from '@interfaces/incidents/incident.interface';

@Injectable({
  providedIn: 'root',
})
export class IncidentService {
  private http = inject(HttpClient);
  private baseUrl = `${API_URL}/incidents`;

  create(dto: CreateIncidentDTO): Observable<ApiResponse<IncidentResponseDTO>> {
    return this.http.post<ApiResponse<IncidentResponseDTO>>(this.baseUrl, dto);
  }

  getById(id: string): Observable<ApiResponse<IncidentResponseDTO>> {
    return this.http.get<ApiResponse<IncidentResponseDTO>>(`${this.baseUrl}/${id}`);
  }

  search(
    page: number = 0,
    size: number = 10,
    status?: IncidentStatus,
    priority?: IncidentPriority,
    type?: IncidentType,
    customerId?: string,
    supplyId?: string,
    startDate?: string,
    endDate?: string
  ): Observable<ApiResponse<PaginatedResponse<IncidentResponseDTO>['data']>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) params = params.set('status', status);
    if (priority) params = params.set('priority', priority);
    if (type) params = params.set('type', type);
    if (customerId) params = params.set('customerId', customerId);
    if (supplyId) params = params.set('supplyId', supplyId);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<ApiResponse<PaginatedResponse<IncidentResponseDTO>['data']>>(
      this.baseUrl,
      { params }
    );
  }

  startProgress(id: string): Observable<ApiResponse<IncidentResponseDTO>> {
    return this.http.put<ApiResponse<IncidentResponseDTO>>(`${this.baseUrl}/${id}/start-progress`, {});
  }

  resolve(id: string, dto: ResolveIncidentDTO): Observable<ApiResponse<IncidentResponseDTO>> {
    return this.http.put<ApiResponse<IncidentResponseDTO>>(`${this.baseUrl}/${id}/resolve`, dto);
  }

  reject(id: string, dto: ResolveIncidentDTO): Observable<ApiResponse<IncidentResponseDTO>> {
    return this.http.put<ApiResponse<IncidentResponseDTO>>(`${this.baseUrl}/${id}/reject`, dto);
  }

  close(id: string): Observable<ApiResponse<IncidentResponseDTO>> {
    return this.http.put<ApiResponse<IncidentResponseDTO>>(`${this.baseUrl}/${id}/close`, {});
  }
}
