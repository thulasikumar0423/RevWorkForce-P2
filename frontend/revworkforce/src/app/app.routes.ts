import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'employee',
    canActivate: [authGuard],
    data: { role: 'EMPLOYEE' },
    children: [
      { path: '', loadComponent: () => import('./features/employee/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'apply-leave', loadComponent: () => import('./features/employee/apply-leave/apply-leave.component').then(m => m.ApplyLeaveComponent) },
      { path: 'my-leaves', loadComponent: () => import('./features/employee/my-leaves/my-leaves.component').then(m => m.MyLeavesComponent) },
      { path: 'holidays', loadComponent: () => import('./features/employee/holiday-calendar/holiday-calendar.component').then(m => m.HolidayCalendarComponent) },
      { path: 'reviews', loadComponent: () => import('./features/employee/my-reviews/my-reviews.component').then(m => m.MyReviewsComponent) },
      { path: 'goals', loadComponent: () => import('./features/employee/my-goals/my-goals.component').then(m => m.MyGoalsComponent) },
      { path: 'profile', loadComponent: () => import('./features/employee/profile/profile.component').then(m => m.ProfileComponent) }
    ]
  },
  {
    path: 'manager',
    canActivate: [authGuard],
    data: { role: 'MANAGER' },
    children: [
      { path: '', loadComponent: () => import('./features/manager/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'team-leaves', loadComponent: () => import('./features/manager/team-leaves/team-leaves.component').then(m => m.TeamLeavesComponent) },
      { path: 'leave-approvals', loadComponent: () => import('./features/manager/leave-approvals/leave-approvals.component').then(m => m.LeaveApprovalsComponent) },
      { path: 'team', loadComponent: () => import('./features/manager/team/team.component').then(m => m.TeamComponent) },
      { path: 'team-calendar', loadComponent: () => import('./features/manager/team-calendar/team-calendar.component').then(m => m.TeamCalendarComponent) },
      { path: 'reviews', loadComponent: () => import('./features/manager/reviews/reviews.component').then(m => m.ReviewsComponent) },
      { path: 'goals', loadComponent: () => import('./features/manager/goals/goals.component').then(m => m.GoalsComponent) },
      { path: 'apply-leave', loadComponent: () => import('./features/employee/apply-leave/apply-leave.component').then(m => m.ApplyLeaveComponent) },
      { path: 'my-leaves', loadComponent: () => import('./features/employee/my-leaves/my-leaves.component').then(m => m.MyLeavesComponent) },
      { path: 'holidays', loadComponent: () => import('./features/employee/holiday-calendar/holiday-calendar.component').then(m => m.HolidayCalendarComponent) },
      { path: 'my-reviews', loadComponent: () => import('./features/employee/my-reviews/my-reviews.component').then(m => m.MyReviewsComponent) },
      { path: 'my-goals', loadComponent: () => import('./features/employee/my-goals/my-goals.component').then(m => m.MyGoalsComponent) },
      { path: 'profile', loadComponent: () => import('./features/employee/profile/profile.component').then(m => m.ProfileComponent) }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: '', loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'employees', loadComponent: () => import('./features/admin/employees/employees.component').then(m => m.EmployeesComponent) },
      { path: 'departments', loadComponent: () => import('./features/admin/departments/departments.component').then(m => m.DepartmentsComponent) },
      { path: 'designations', loadComponent: () => import('./features/admin/designations/designations.component').then(m => m.DesignationsComponent) },
      { path: 'announcements', loadComponent: () => import('./features/admin/announcements/announcements.component').then(m => m.AdminAnnouncementsComponent) },
      { path: 'holidays', loadComponent: () => import('./features/admin/holidays/holidays.component').then(m => m.HolidaysComponent) },
      { path: 'leave-management', loadComponent: () => import('./features/admin/leave-management/leave-management.component').then(m => m.LeaveManagementComponent) },
      { path: 'leave-balance-management', loadComponent: () => import('./features/admin/leave-balance-management/leave-balance-management.component').then(m => m.LeaveBalanceManagementComponent) },
      { path: 'leave-reports', loadComponent: () => import('./features/admin/reports/leave-reports.component').then(m => m.LeaveReportsComponent) },
      { path: 'activity-logs', loadComponent: () => import('./features/admin/activity-logs/activity-logs.component').then(m => m.ActivityLogsComponent) },
      { path: 'profile', loadComponent: () => import('./features/employee/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'apply-leave', loadComponent: () => import('./features/employee/apply-leave/apply-leave.component').then(m => m.ApplyLeaveComponent) },
      { path: 'my-leaves', loadComponent: () => import('./features/employee/my-leaves/my-leaves.component').then(m => m.MyLeavesComponent) },
      { path: 'reviews', loadComponent: () => import('./features/employee/my-reviews/my-reviews.component').then(m => m.MyReviewsComponent) },
      { path: 'goals', loadComponent: () => import('./features/employee/my-goals/my-goals.component').then(m => m.MyGoalsComponent) }
    ]
  },
  { path: 'notifications', loadComponent: () => import('./shared/components/notifications/notifications.component').then(m => m.NotificationsComponent) },
  { path: 'announcements', loadComponent: () => import('./shared/components/announcements/announcements.component').then(m => m.AnnouncementsComponent) },
  { path: 'directory', loadComponent: () => import('./shared/components/directory/directory.component').then(m => m.DirectoryComponent) },
  { path: '**', redirectTo: 'login' }
];
