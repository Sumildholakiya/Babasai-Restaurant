import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Cart } from '../../models';

const API = 'http://localhost:5000/api/cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartCount = signal<number>(0);
  cartItemCount = this.cartCount.asReadonly();

  constructor(private http: HttpClient) {}

  getCart(): Observable<{ success: boolean; cart: Cart }> {
    return this.http.get<any>(API).pipe(
      tap(res => this.cartCount.set(res.cart?.items?.length || 0))
    );
  }

  addToCart(menuItemId: string, quantity = 1): Observable<any> {
    return this.http.post<any>(`${API}/add`, { menuItemId, quantity }).pipe(
      tap(res => this.cartCount.set(res.cart?.items?.length || 0))
    );
  }

  updateCartItem(menuItemId: string, quantity: number): Observable<any> {
    return this.http.put<any>(`${API}/update`, { menuItemId, quantity }).pipe(
      tap(res => this.cartCount.set(res.cart?.items?.length || 0))
    );
  }

  removeFromCart(menuItemId: string): Observable<any> {
    return this.http.delete<any>(`${API}/remove/${menuItemId}`).pipe(
      tap(res => this.cartCount.set(res.cart?.items?.length || 0))
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete<any>(`${API}/clear`).pipe(
      tap(() => this.cartCount.set(0))
    );
  }

  setCount(n: number) { this.cartCount.set(n); }
}
