import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:5000/api/orders';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient) {}

  placeOrder(deliveryAddress?: string): Observable<any> {
    return this.http.post<any>(`${API}/place`, { deliveryAddress });
  }

  getUserOrders(): Observable<any> {
    return this.http.get<any>(API);
  }

  getOrder(id: string): Observable<any> {
    return this.http.get<any>(`${API}/${id}`);
  }
}
