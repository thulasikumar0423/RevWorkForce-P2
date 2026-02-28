import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private api = 'http://localhost:8084/api';

  constructor(private http: HttpClient) {}

  // ─── Self-service ────────────────────────────────────────────
  getMyProfile()         { return this.http.get<any>(`${this.api}/users/me`).pipe(map(r => r.data ?? r)); }
  updateMyProfile(data: any) { return this.http.put<any>(`${this.api}/users/me`, data).pipe(map(r => r.data ?? r)); }

  // ─── All users ───────────────────────────────────────────────
  getAllEmployees()              { return this.http.get<any>(`${this.api}/users`).pipe(map(r => r.data ?? r)); }
  getEmployeeById(id: number)   { return this.http.get<any>(`${this.api}/users/${id}`).pipe(map(r => r.data ?? r)); }
  addEmployee(data: any)        { return this.http.post<any>(`${this.api}/users`, data).pipe(map(r => r.data ?? r)); }
  updateEmployee(id: number, data: any) { return this.http.put<any>(`${this.api}/users/${id}`, data).pipe(map(r => r.data ?? r)); }
  deactivateEmployee(id: number) { return this.http.put<any>(`${this.api}/users/${id}/deactivate`, {}).pipe(map(r => r.data ?? r)); }
  reactivateEmployee(id: number) { return this.http.put<any>(`${this.api}/users/${id}/reactivate`, {}).pipe(map(r => r.data ?? r)); }
  assignManager(userId: number, managerId: number) {
    return this.http.put<any>(`${this.api}/users/assign-manager`, { userId, managerId }).pipe(map(r => r.data ?? r));
  }

  getMyTeam() {
    const user = this.getStoredUser();
    return this.http.get<any>(`${this.api}/users/manager/${user?.id}`).pipe(map(r => r.data ?? r));
  }

  getUsersByManager(managerId: number) {
    return this.http.get<any>(`${this.api}/users/manager/${managerId}`).pipe(map(r => r.data ?? r));
  }

  filterUsers(params: any) {
    return this.http.get<any>(`${this.api}/users/filter`, { params }).pipe(map(r => r.data ?? r));
  }

  getAdminMetrics() {
    return this.http.get<any>(`${this.api}/users/metrics`).pipe(map(r => r.data ?? r));
  }

  // ─── Departments ─────────────────────────────────────────────
  getDepartments()              { return this.http.get<any>(`${this.api}/departments`).pipe(map(r => r.data ?? r)); }
  addDepartment(data: any)      { return this.http.post<any>(`${this.api}/departments`, data).pipe(map(r => r.data ?? r)); }
  updateDepartment(id: number, data: any) { return this.http.put<any>(`${this.api}/departments/${id}`, data).pipe(map(r => r.data ?? r)); }
  deleteDepartment(id: number)  { return this.http.delete<any>(`${this.api}/departments/${id}`).pipe(map(r => r.data ?? r)); }

  // ─── Designations ────────────────────────────────────────────
  getDesignations()             { return this.http.get<any>(`${this.api}/designations`).pipe(map(r => r.data ?? r)); }
  addDesignation(data: any)     { return this.http.post<any>(`${this.api}/designations`, data).pipe(map(r => r.data ?? r)); }
  updateDesignation(id: number, data: any) { return this.http.put<any>(`${this.api}/designations/${id}`, data).pipe(map(r => r.data ?? r)); }
  deleteDesignation(id: number) { return this.http.delete<any>(`${this.api}/designations/${id}`).pipe(map(r => r.data ?? r)); }

  // ─── Holidays (via leave controller) ─────────────────────────
  getHolidays()                 { return this.http.get<any>(`${this.api}/leaves/holidays`).pipe(map(r => r.data ?? r)); }
  addHoliday(data: any)         { return this.http.post<any>(`${this.api}/leaves/holidays`, data).pipe(map(r => r.data ?? r)); }
  updateHoliday(id: number, data: any) { return this.http.put<any>(`${this.api}/leaves/holidays/${id}`, data).pipe(map(r => r.data ?? r)); }
  deleteHoliday(id: number)     { return this.http.delete<any>(`${this.api}/leaves/holidays/${id}`).pipe(map(r => r.data ?? r)); }

  // ─── Helpers ─────────────────────────────────────────────────
  getStoredUser(): any {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  }

  getCurrentUserId(): number {
    return this.getStoredUser()?.id || 0;
  }
  changePassword(data: any) {
  return this.http
    .put<any>(`${this.api}/users/me/change-password`, data)
    .pipe(map(r => r.data ?? r));
}
  getAllManagers() {
  return this.http
    .get<any>(`${this.api}/users/filter`, {
      params: { role: 'MANAGER', active: true }
    })
    .pipe(map(r => r.data ?? r));
}
}
