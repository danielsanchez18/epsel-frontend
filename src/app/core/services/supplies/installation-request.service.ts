import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '@core/utils/api';
import { ApiResponse } from '@core/interfaces/shared/api-response.interface';
import { PaginatedResponse } from '@core/interfaces/shared/paginated-response.interface';
import { CreateInstallationRequest, InstallSupplyDTO, InstallationRequestResponse, InstallationRequestStatus } from '@interfaces/supplies/installation-request.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InstallationRequestService {

  private http = inject(HttpClient);
  private baseUrl = `${API_URL}/installation-requests`;

  create(dto: CreateInstallationRequest): Observable<ApiResponse<InstallationRequestResponse>> {
    return this.http.post<ApiResponse<InstallationRequestResponse>>(this.baseUrl, dto);
  }

  approve(id: string): Observable<ApiResponse<InstallationRequestResponse>> {
    return this.http.patch<ApiResponse<InstallationRequestResponse>>(`${this.baseUrl}/${id}/approve`, {});
  }

  reject(id: string, observations: string): Observable<ApiResponse<InstallationRequestResponse>> {
    let params = new HttpParams().set('observations', observations);
    return this.http.patch<ApiResponse<InstallationRequestResponse>>(`${this.baseUrl}/${id}/reject`, {}, { params });
  }

  install(id: string, dto: InstallSupplyDTO): Observable<ApiResponse<InstallationRequestResponse>> {
    return this.http.patch<ApiResponse<InstallationRequestResponse>>(`${this.baseUrl}/${id}/install`, dto);
  }

  findAll(
    page: number = 0,
    size: number = 10,
    search?: string,
    status?: InstallationRequestStatus,
    zoneName?: string
  ): Observable<ApiResponse<PaginatedResponse<InstallationRequestResponse>>> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (zoneName) params = params.set('zoneName', zoneName);

    return this.http.get<ApiResponse<PaginatedResponse<InstallationRequestResponse>>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<ApiResponse<InstallationRequestResponse>> {
    return this.http.get<ApiResponse<InstallationRequestResponse>>(`${this.baseUrl}/${id}`);
  }

  getKpis(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/kpis`);
  }
}

