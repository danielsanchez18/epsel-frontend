import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '@core/utils/api';
import { ApiResponse } from '@core/interfaces/shared/api-response.interface';
import { PaginatedResponse } from '@core/interfaces/shared/paginated-response.interface';
import { CreatePaymentDTO, PaymentResponseDTO, PaymentMethod, PaymentStatus, CancelPaymentDTO } from '@interfaces/payments/payment.interface';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private http = inject(HttpClient);
  private baseUrl = `${API_URL}/payments`;

  create(dto: CreatePaymentDTO): Observable<ApiResponse<PaymentResponseDTO>> {
    return this.http.post<ApiResponse<PaymentResponseDTO>>(this.baseUrl, dto);
  }

  getById(id: string): Observable<ApiResponse<PaymentResponseDTO>> {
    return this.http.get<ApiResponse<PaymentResponseDTO>>(`${this.baseUrl}/${id}`);
  }

  cancel(id: string, dto: CancelPaymentDTO): Observable<ApiResponse<PaymentResponseDTO>> {
    return this.http.patch<ApiResponse<PaymentResponseDTO>>(`${this.baseUrl}/${id}/cancel`, dto);
  }

  search(
    page: number = 0,
    size: number = 10,
    receiptNumber?: string,
    billingNumber?: string,
    supplyNumber?: string,
    customerName?: string,
    paymentMethod?: PaymentMethod,
    status?: PaymentStatus,
    startDate?: string,
    endDate?: string,
  ): Observable<ApiResponse<PaginatedResponse<PaymentResponseDTO>['data']>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (receiptNumber) params = params.set('receiptNumber', receiptNumber);
    if (billingNumber) params = params.set('billingNumber', billingNumber);
    if (supplyNumber) params = params.set('supplyNumber', supplyNumber);
    if (customerName) params = params.set('customerName', customerName);
    if (paymentMethod) params = params.set('paymentMethod', paymentMethod);
    if (status) params = params.set('status', status);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<ApiResponse<PaginatedResponse<PaymentResponseDTO>['data']>>(
      this.baseUrl,
      { params },
    );
  }

  getByBilling(
    billingId: string,
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponse<PaginatedResponse<PaymentResponseDTO>['data']>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PaginatedResponse<PaymentResponseDTO>['data']>>(
      `${this.baseUrl}/billing/${billingId}`,
      { params },
    );
  }

  getByCustomer(
    customerId: string,
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponse<PaginatedResponse<PaymentResponseDTO>['data']>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<PaginatedResponse<PaymentResponseDTO>['data']>>(
      `${this.baseUrl}/customer/${customerId}`,
      { params },
    );
  }
}

