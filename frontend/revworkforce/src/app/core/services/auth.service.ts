import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:8084/api/auth';
  private usersUrl = 'http://localhost:8084/api/users';

  currentUser = signal<any | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { this.currentUser.set(JSON.parse(stored)); } catch {}
    }
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        const loginData = response.data || response;
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData));
        this.currentUser.set(loginData);
      }),
      // After login, fetch /users/me to get the user ID
      switchMap(response => {
        const loginData = response.data || response;
        return this.http.get<any>(`${this.usersUrl}/me`).pipe(
          tap(meRes => {
            const me = meRes.data || meRes;
            const enriched = { ...loginData, id: me.id, ...me };
            localStorage.setItem('user', JSON.stringify(enriched));
            this.currentUser.set(enriched);
          }),
          catchError(() => of(response))
        );
      })
    );
  }

  logout() {
    localStorage.clear();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getRole(): string {

  const user = this.currentUser();
  if (user?.role) return user.role;

  const stored = localStorage.getItem('user');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.role || '';
    } catch {
      return '';
    }
  }

  return '';
}

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): any {
    return this.currentUser();
  }

  getCurrentUserId(): number {
    return this.currentUser()?.id || 0;
  }
}
