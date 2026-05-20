import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/utils/api';
import { ApiResponse } from '@core/interfaces/shared/api-response.interface';
import { PaginatedResponse } from '@core/interfaces/shared/paginated-response.interface';
import { PropertyResponse, CreatePropertyRequest, UpdatePropertyRequest } from '@core/interfaces/properties/properties.interface';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private http = inject(HttpClient);
  private baseUrl = `${API_URL}/properties`;

  create(dto: CreatePropertyRequest): Observable<ApiResponse<PropertyResponse>> {
    return this.http.post<ApiResponse<PropertyResponse>>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdatePropertyRequest): Observable<ApiResponse<PropertyResponse>> {
    return this.http.put<ApiResponse<PropertyResponse>>(`${this.baseUrl}/${id}`, dto);
  }

  getById(id: string): Observable<ApiResponse<PropertyResponse>> {
    return this.http.get<ApiResponse<PropertyResponse>>(`${this.baseUrl}/${id}`);
  }

  getAll(page: number = 0, size: number = 10, search?: string, type?: string, customerId?: string): Observable<ApiResponse<PaginatedResponse<PropertyResponse>['data']>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (search) params = params.set('search', search);
    if (type) params = params.set('type', type);
    if (customerId) params = params.set('customerId', customerId);
    return this.http.get<ApiResponse<PaginatedResponse<PropertyResponse>['data']>>(this.baseUrl, { params });
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}
