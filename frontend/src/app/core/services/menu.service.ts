import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuItem, MenuFilterParams } from '../../models';

const API = 'http://localhost:5000/api/menu';

@Injectable({ providedIn: 'root' })
export class MenuService {
  constructor(private http: HttpClient) {}

  getMenuItems(filters?: MenuFilterParams): Observable<{ success: boolean; count: number; items: MenuItem[] }> {
    let params = new HttpParams();
    if (filters) {
      if (filters.category && filters.category !== 'All') params = params.set('category', filters.category);
      if (filters.minPrice !== undefined) params = params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params = params.set('maxPrice', filters.maxPrice.toString());
      if (filters.search) params = params.set('search', filters.search);
    }
    return this.http.get<any>(API, { params });
  }

  getCategories(): Observable<{ success: boolean; categories: string[] }> {
    return this.http.get<any>(`${API}/categories`);
  }

  createMenuItem(formData: FormData): Observable<any> {
    return this.http.post<any>(API, formData);
  }

  updateMenuItem(id: string, formData: FormData): Observable<any> {
    return this.http.put<any>(`${API}/${id}`, formData);
  }

  deleteMenuItem(id: string): Observable<any> {
    return this.http.delete<any>(`${API}/${id}`);
  }
}
