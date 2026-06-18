import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '@core/utils/api';
import { ApiResponse } from '@core/interfaces/shared/api-response.interface';
import { DashboardResponse } from '@interfaces/dashboard/dashboard.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private baseUrl = `${API_URL}/dashboard`;

  getDashboard(
    month?: number,
    year?: number,
  ): Observable<ApiResponse<DashboardResponse>> {
    let params = new HttpParams();
    if (month) params = params.set('month', month.toString());
    if (year) params = params.set('year', year.toString());

    return this.http.get<ApiResponse<DashboardResponse>>(this.baseUrl, {
      params,
    });
  }
}
