import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/utils/api';
import { ApiResponse } from '@core/interfaces/shared/api-response.interface';
import {
  BillingConfigurationResponse,
  UpdateBillingConfigurationRequest
} from '@core/interfaces/settings/settings.interface';

@Injectable({
  providedIn: 'root'
})
export class BillingConfigurationService {
  private http = inject(HttpClient);
  private baseUrl = `${API_URL}/configurations/billing`;

  getCurrent(): Observable<ApiResponse<BillingConfigurationResponse>> {
    return this.http.get<ApiResponse<BillingConfigurationResponse>>(this.baseUrl);
  }

  update(dto: UpdateBillingConfigurationRequest): Observable<ApiResponse<BillingConfigurationResponse>> {
    return this.http.put<ApiResponse<BillingConfigurationResponse>>(this.baseUrl, dto);
  }
}
