import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private api = 'http://localhost:8084/api';

  constructor(private http: HttpClient) {}

  // ─── Goals ──────────────────────────────────────────────────
  getMyGoals()   { return this.http.get<any>(`${this.api}/performance/goals/my`).pipe(map(r => r.data ?? r)); }
  getAllGoals()   { return this.http.get<any>(`${this.api}/performance/goals`).pipe(map(r => r.data ?? r)); }
  getTeamGoals() { return this.http.get<any>(`${this.api}/performance/goals`).pipe(map(r => r.data ?? r)); }
  getGoalsByEmployee(employeeId: number) {
    return this.http.get<any>(`${this.api}/performance/goals/employee/${employeeId}`).pipe(map(r => r.data ?? r));
  }
  createGoal(data: any) { return this.http.post<any>(`${this.api}/performance/goals`, data).pipe(map(r => r.data ?? r)); }
  updateGoalProgress(id: number, progress: number) {
    return this.http.put<any>(`${this.api}/performance/goals/progress`, { goalId: id, progress }).pipe(map(r => r.data ?? r));
  }
  deleteGoal(id: number) { return this.http.delete<any>(`${this.api}/performance/goals/${id}`).pipe(map(r => r.data ?? r)); }

  // ─── Reviews ────────────────────────────────────────────────
  getMyReviews() { return this.http.get<any>(`${this.api}/performance/reviews/my`).pipe(map(r => r.data ?? r)); }
  getAllReviews() { return this.http.get<any>(`${this.api}/performance/reviews`).pipe(map(r => r.data ?? r)); }
  getTeamReviews() { return this.http.get<any>(`${this.api}/performance/reviews`).pipe(map(r => r.data ?? r)); }
  getReviewsByEmployee(employeeId: number) {
    return this.http.get<any>(`${this.api}/performance/reviews/employee/${employeeId}`).pipe(map(r => r.data ?? r));
  }
  createReview(data: any) { return this.http.post<any>(`${this.api}/performance/reviews`, data).pipe(map(r => r.data ?? r)); }
  submitReview(reviewId: number) {
    return this.http.put<any>(`${this.api}/performance/reviews/submit`, { reviewId }).pipe(map(r => r.data ?? r));
  }
  provideFeedback(id: number, data: any) {
    return this.http.put<any>(`${this.api}/performance/reviews/${id}/feedback`, data).pipe(map(r => r.data ?? r));
  }
  deleteReview(id: number) { return this.http.delete<any>(`${this.api}/performance/reviews/${id}`).pipe(map(r => r.data ?? r)); }
}
