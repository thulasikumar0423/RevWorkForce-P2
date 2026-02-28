import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private api = 'http://localhost:8084/api';
  constructor(private http: HttpClient) {}

  getAllAnnouncements() { return this.http.get<any>(`${this.api}/announcements`).pipe(map((res: any) => res.data || res)); }
  getAnnouncementById(id: number) { return this.http.get<any>(`${this.api}/announcements/${id}`).pipe(map((res: any) => res.data || res)); }
  createAnnouncement(data: any) { return this.http.post<any>(`${this.api}/announcements`, data).pipe(map((res: any) => res.data || res)); }
  updateAnnouncement(id: number, data: any) { return this.http.put<any>(`${this.api}/announcements/${id}`, data).pipe(map((res: any) => res.data || res)); }
  deleteAnnouncement(id: number) { return this.http.delete<any>(`${this.api}/announcements/${id}`).pipe(map((res: any) => res.data || res)); }
}
