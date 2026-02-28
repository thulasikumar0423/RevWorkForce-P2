import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private api = 'http://localhost:8084/api';

  constructor(private http: HttpClient) {}

  // ─── Employee ───────────────────────────────────────────────
  getMyBalances()         { return this.http.get<any>(`${this.api}/leaves/balance/me`).pipe(map(r => r.data ?? r)); }
  getMyLeaves()           { return this.http.get<any>(`${this.api}/leaves/me`).pipe(map(r => r.data ?? r)); }
  applyLeave(data: any)   { return this.http.post<any>(`${this.api}/leaves`, data).pipe(map(r => r.data ?? r)); }
  cancelLeave(id: number) { return this.http.put<any>(`${this.api}/leaves/${id}/cancel`, {}).pipe(map(r => r.data ?? r)); }

  // ─── Manager ────────────────────────────────────────────────
  getTeamLeaves()         { return this.http.get<any>(`${this.api}/leaves/manager/pending`).pipe(map(r => r.data ?? r)); }
  getTeamPendingLeaves()  { return this.http.get<any>(`${this.api}/leaves/manager/pending`).pipe(map(r => r.data ?? r)); }
  getTeamAllLeaves()      { return this.http.get<any>(`${this.api}/leaves/manager/all`).pipe(map(r => r.data ?? r)); }
  getTeamCalendar()       { return this.http.get<any>(`${this.api}/leaves/team-calendar`).pipe(map(r => r.data ?? r)); }
  getEmployeeLeaveBalance(employeeId: number) {
    return this.http.get<any>(`${this.api}/leaves/balance/employee/${employeeId}`).pipe(map(r => r.data ?? r));
  }

  // Backend: PUT /{id}/approve
  approveLeave(id: number, comments?: string) {
    return this.http.put<any>(`${this.api}/leaves/${id}/approve`, { comments }).pipe(map(r => r.data ?? r));
  }

  // Backend: PUT /{id}/reject?comment=...
  rejectLeave(id: number, comment: string) {
    const params = new HttpParams().set('comment', comment);
    return this.http.put<any>(`${this.api}/leaves/${id}/reject`, null, { params }).pipe(map(r => r.data ?? r));
  }

  // ─── Admin ──────────────────────────────────────────────────
  getAllLeaves()      { return this.http.get<any>(`${this.api}/leaves/all`).pipe(map(r => r.data ?? r)); }
  getAllLeavesAdmin() { return this.http.get<any>(`${this.api}/leaves/admin/all`).pipe(map(r => r.data ?? r)); }

  getAllEmployees() { return this.http.get<any>(`${this.api}/users`).pipe(map(r => r.data ?? r)); }

  // Admin - Leave Balance Management
  getAllLeaveBalances() {
    return this.http.get<any>(`${this.api}/leave-balances/all`).pipe(map(r => r.data ?? r));
  }
  assignLeaveBalance(employeeId: number, leaveTypeId: number, totalQuota: number) {
    return this.http.post<any>(
      `${this.api}/leave-balances/assign?employeeId=${employeeId}&leaveTypeId=${leaveTypeId}&totalQuota=${totalQuota}`, {}
    ).pipe(map(r => r.data ?? r));
  }
  adjustLeaveBalance(employeeId: number, leaveTypeId: number, adjustment: number, reason: string) {
    return this.http.put<any>(
      `${this.api}/leave-balances/adjust?employeeId=${employeeId}&leaveTypeId=${leaveTypeId}&adjustment=${adjustment}&reason=${encodeURIComponent(reason)}`, {}
    ).pipe(map(r => r.data ?? r));
  }
  assignLeaveQuota(employeeId: number, leaveTypeId: number, totalQuota: number) {
    const params = new HttpParams()
      .set('employeeId', employeeId)
      .set('leaveTypeId', leaveTypeId)
      .set('totalQuota', totalQuota);
    return this.http.post<any>(`${this.api}/leaves/balance/assign`, null, { params }).pipe(map(r => r.data ?? r));
  }

  // Admin - Reports
  getDepartmentWiseReport() { return this.http.get<any>(`${this.api}/leaves/reports/department`).pipe(map(r => r.data ?? r)); }
  getEmployeeWiseReport()   { return this.http.get<any>(`${this.api}/leaves/reports/employee`).pipe(map(r => r.data ?? r)); }

  // ─── Holidays ───────────────────────────────────────────────
  getAllHolidays()              { return this.http.get<any>(`${this.api}/leaves/holidays`).pipe(map(r => r.data ?? r)); }
  createHoliday(data: any)     { return this.http.post<any>(`${this.api}/leaves/holidays`, data).pipe(map(r => r.data ?? r)); }
  updateHoliday(id: number, data: any) { return this.http.put<any>(`${this.api}/leaves/holidays/${id}`, data).pipe(map(r => r.data ?? r)); }
  deleteHoliday(id: number)    { return this.http.delete<any>(`${this.api}/leaves/holidays/${id}`).pipe(map(r => r.data ?? r)); }

  // ─── Leave Types ────────────────────────────────────────────
  getLeaveTypes()                    { return this.http.get<any>(`${this.api}/leaves/types`).pipe(map(r => r.data ?? r)); }
  createLeaveType(data: any)         { return this.http.post<any>(`${this.api}/leaves/types`, data).pipe(map(r => r.data ?? r)); }
  updateLeaveType(id: number, data: any) { return this.http.put<any>(`${this.api}/leaves/types/${id}`, data).pipe(map(r => r.data ?? r)); }
  deleteLeaveType(id: number)        { return this.http.delete<any>(`${this.api}/leaves/types/${id}`).pipe(map(r => r.data ?? r)); }
}
