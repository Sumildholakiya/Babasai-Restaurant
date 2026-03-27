import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:5000/api/reviews';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  constructor(private http: HttpClient) {}

  getReviews(): Observable<any> {
    return this.http.get<any>(API);
  }

  createReview(data: { message: string; rating: number }): Observable<any> {
    return this.http.post<any>(API, data);
  }

  deleteReview(id: string): Observable<any> {
    return this.http.delete<any>(`${API}/${id}`);
  }
}
