import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '@core/utils/api';
import { ApiResponse } from '@core/interfaces/shared/api-response.interface';
import { PaginatedResponse } from '@core/interfaces/shared/paginated-response.interface';
import { BillingResponseDTO, BillingKpiDTO } from '@interfaces/billings/billing.interface';

@Injectable({
  providedIn: 'root',
})
export class BillingService {
  private http = inject(HttpClient);
  private baseUrl = `${API_URL}/billings`;

  getKpis(
    startDate?: string,
    endDate?: string,
  ): Observable<ApiResponse<BillingKpiDTO>> {
    let params = new HttpParams();

    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<ApiResponse<BillingKpiDTO>>(`${this.baseUrl}/kpis`, {
      params,
    });
  }

  generate(readingId: string): Observable<ApiResponse<BillingResponseDTO>> {
    return this.http.post<ApiResponse<BillingResponseDTO>>(
      `${this.baseUrl}/generate/${readingId}`,
      null,
    );
  }

  getById(id: string): Observable<ApiResponse<BillingResponseDTO>> {
    return this.http.get<ApiResponse<BillingResponseDTO>>(
      `${this.baseUrl}/${id}`,
    );
  }

  getBySupply(
    supplyId: string,
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponse<PaginatedResponse<BillingResponseDTO>['data']>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PaginatedResponse<BillingResponseDTO>['data']>>(
      `${this.baseUrl}/supply/${supplyId}`,
      { params },
    );
  }

  search(
    page: number = 0,
    size: number = 10,
    billingNumber?: string,
    customerName?: string,
    status?: string | string[],
    startDate?: string,
    endDate?: string,
    overdue?: boolean,
  ): Observable<ApiResponse<PaginatedResponse<BillingResponseDTO>['data']>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (billingNumber) params = params.set('billingNumber', billingNumber);
    if (customerName) params = params.set('customerName', customerName);
    
    if (status) {
      if (Array.isArray(status)) {
        status.forEach(s => params = params.append('status', s));
      } else {
        params = params.set('status', status);
      }
    }
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (overdue !== undefined) params = params.set('overdue', overdue.toString());

    return this.http.get<ApiResponse<PaginatedResponse<BillingResponseDTO>['data']>>(
      this.baseUrl,
      { params },
    );
  }
}
