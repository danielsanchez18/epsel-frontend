import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/utils/api';
import { ApiResponse } from '@interfaces/shared/api-response.interface';
import { PaginatedResponse } from '@interfaces/shared/paginated-response.interface';
import {
  CustomerResponse,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerType,
} from '@interfaces/customers/customer.interface';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/customers`;

  create(
    dto: CreateCustomerRequest,
  ): Observable<ApiResponse<CustomerResponse>> {
    return this.http.post<ApiResponse<CustomerResponse>>(this.apiUrl, dto);
  }

  update(
    id: string,
    dto: UpdateCustomerRequest,
  ): Observable<ApiResponse<CustomerResponse>> {
    return this.http.put<ApiResponse<CustomerResponse>>(
      `${this.apiUrl}/${id}`,
      dto,
    );
  }

  getById(id: string): Observable<ApiResponse<CustomerResponse>> {
    return this.http.get<ApiResponse<CustomerResponse>>(`${this.apiUrl}/${id}`);
  }

  search(
    page: number = 0,
    size: number = 10,
    sort: string,
    search?: string,
    type?: CustomerType,
  ): Observable<ApiResponse<PaginatedResponse<CustomerResponse>['data']>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (search) {
      params = params.set('search', search);
    }
    if (type) {
      params = params.set('type', type);
    }

    return this.http.get<
      ApiResponse<PaginatedResponse<CustomerResponse>['data']>
    >(this.apiUrl, { params });
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getKpis(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/kpis`);
  }

  getDetailKpis(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}/kpis`);
  }
}
