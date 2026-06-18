import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '@core/utils/api';
import { ApiResponse } from '@core/interfaces/shared/api-response.interface';

export interface CollectionKpiDTO {
  pendingCount: number;
  overdueCount: number;
  totalPendingAmount: number;
  totalOverdueAmount: number;
  delinquentCustomersCount: number;
  suppliesToCutCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private http = inject(HttpClient);
  private baseUrl = `${API_URL}/collections`;

  getKpis(
    startDate?: string,
    endDate?: string,
  ): Observable<ApiResponse<CollectionKpiDTO>> {
    let params = new HttpParams();

    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<ApiResponse<CollectionKpiDTO>>(`${this.baseUrl}/kpis`, {
      params,
    });
  }
}
