import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:5000/api/reports';

export interface ReportKPI {
  totalRevenue:   number;
  totalOrders:    number;
  totalUsers:     number;
  avgRating:      string;
  totalReviews:   number;
  totalMenuItems: number;
}

export interface StatusData   { status: string; count: number; }
export interface MonthlyData  { month: string; revenue: number; orderCount: number; delivered: number; cancelled: number; }
export interface CategoryData { category: string; count: number; }
export interface ItemData     { name: string; count: number; }
export interface RatingData   { star: number; count: number; }
export interface RecentOrder  { id: string; customer: string; total: number; status: string; items: number; date: string; }

export interface ReportSummary {
  success:       boolean;
  kpi:           ReportKPI;
  ordersByStatus: StatusData[];
  monthly:       MonthlyData[];
  topCategories: CategoryData[];
  topItems:      ItemData[];
  ratingDist:    RatingData[];
  recentOrders:  RecentOrder[];
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private http: HttpClient) {}

  getSummary(): Observable<ReportSummary> {
    return this.http.get<ReportSummary>(`${API}/summary`);
  }
}
