import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User } from '../../models';

const API = 'http://localhost:5000/api/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(this.loadUser());

  user = this.currentUser.asReadonly();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): User | null {
    try {
      const u = localStorage.getItem('bs_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  }

  getToken(): string | null {
    return localStorage.getItem('bs_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.currentUser();
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${API}/register`, data).pipe(
      tap(res => this.saveSession(res))
    );
  }

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${API}/login`, data).pipe(
      tap(res => this.saveSession(res))
    );
  }

  private saveSession(res: any): void {
    if (res.success) {
      localStorage.setItem('bs_token', res.token);
      localStorage.setItem('bs_user', JSON.stringify(res.user));
      this.currentUser.set(res.user);
    }
  }

  logout(): void {
    localStorage.removeItem('bs_token');
    localStorage.removeItem('bs_user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
