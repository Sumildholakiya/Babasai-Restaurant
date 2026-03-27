import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:5000/api/contact';

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  constructor(private http: HttpClient) {}

  // Public — anyone can submit the contact form
  submitContact(data: ContactPayload): Observable<any> {
    return this.http.post<any>(API, data);
  }

  // Admin — get all messages, optionally filter by status
  getAllContacts(status?: string): Observable<any> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<any>(API, { params });
  }

  // Admin — update message status (Unread / Read / Replied)
  updateStatus(id: string, status: string): Observable<any> {
    return this.http.put<any>(`${API}/${id}/status`, { status });
  }

  // Admin — delete a message
  deleteContact(id: string): Observable<any> {
    return this.http.delete<any>(`${API}/${id}`);
  }
}
