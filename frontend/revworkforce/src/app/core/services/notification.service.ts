import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = 'http://localhost:8084/api';
  constructor(private http: HttpClient) {}

  getMyNotifications() { return this.http.get<any>(`${this.api}/notifications/me`).pipe(map((res: any) => res.data || res)); }
  markAsRead(id: number) { return this.http.put<any>(`${this.api}/notifications/${id}/read`, {}).pipe(map((res: any) => res.data || res)); }
  getUnreadCount() { return this.http.get<any>(`${this.api}/notifications/me/unread-count`).pipe(map((res: any) => res.data || res)); }
  // Backend has no /read-all endpoint — mark-all-read is not supported, removed
}
