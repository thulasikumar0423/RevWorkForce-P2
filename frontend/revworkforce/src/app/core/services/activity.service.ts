import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private api = 'http://localhost:8084/api';
  
  constructor(private http: HttpClient) {}

  getAllActivities() {
    return this.http.get<any>(`${this.api}/activity`)
      .pipe(map((res: any) => res.data || res));
  }

  getUserActivities(userId: number) {
    return this.http.get<any>(`${this.api}/activity/${userId}`)
      .pipe(map((res: any) => res.data || res));
  }
}
