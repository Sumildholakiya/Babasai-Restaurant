import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:5000/api/admin';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get<any>(`${API}/stats`);
  }

  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${API}/users`);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${API}/users/${id}`);
  }

  getAllOrders(): Observable<any> {
    return this.http.get<any>(`${API}/orders`);
  }

  updateOrderStatus(id: string, status: string): Observable<any> {
    return this.http.put<any>(`${API}/orders/${id}/status`, { status });
  }

  getAllReviews(): Observable<any> {
    return this.http.get<any>(`${API}/reviews`);
  }
}
