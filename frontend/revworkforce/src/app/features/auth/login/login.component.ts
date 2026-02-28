import { Component, signal } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  selectedRole = signal<'EMPLOYEE' | 'MANAGER' | 'ADMIN'>('EMPLOYEE');
  showPassword = signal(false);
  isLoading = signal(false);
  isLookingUp = signal(false);
  errorMsg = signal('');

  credentials = { identifier: '', password: '' };

  private apiBase = 'http://localhost:8084/api';

  constructor(
    private auth: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    if (this.auth.isLoggedIn()) {
      const role = this.auth.getRole();
      this.redirectByRole(role);
    }
  }

  setRole(role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN') {
    this.selectedRole.set(role);
    this.errorMsg.set('');
  }

  togglePassword() { this.showPassword.update(v => !v); }

  isEmail(value: string): boolean {
    return value.includes('@');
  }

  redirectByRole(role: string) {
    const map: Record<string, string> = { EMPLOYEE: '/employee', MANAGER: '/manager', ADMIN: '/admin' };
    this.router.navigate([map[role] || '/login']);
  }

  validateRoleAccess(userRole: string, selectedRole: string): boolean {
    // Employee can login only as EMPLOYEE
    if (selectedRole === 'EMPLOYEE') {
      return userRole === 'EMPLOYEE' || userRole === 'MANAGER' || userRole === 'ADMIN';
    }
    // Manager can login as EMPLOYEE or MANAGER (since manager is also employee)
    if (selectedRole === 'MANAGER') {
      return userRole === 'MANAGER';
    }
    // Admin can login as EMPLOYEE or ADMIN (not manager)
    if (selectedRole === 'ADMIN') {
      return userRole === 'ADMIN';
    }
    return false;
  }

  onSubmit() {
    const input = this.credentials.identifier.trim();
    const password = this.credentials.password;

    if (!input || !password) {
      this.errorMsg.set('Please fill in all fields.');
      return;
    }

    // If it's an email, login directly
    if (this.isEmail(input)) {
      this.doLogin(input, password);
      return;
    }

    // Employee ID lookup — need to resolve to email via public or cached token
    // Strategy: Use a public employee-ID-to-email resolution endpoint if available,
    // else fall back to cached token, else show error.
    const cachedToken = localStorage.getItem('token');
    
    if (cachedToken) {
      // Use existing session to look up by employee ID
      this.isLookingUp.set(true);
      this.isLoading.set(true);
      this.http.get<any>(`${this.apiBase}/users`, {
        headers: { Authorization: `Bearer ${cachedToken}` }
      }).subscribe({
        next: (res) => {
          const users: any[] = res.data || res;
          const match = users.find((u: any) =>
            u.employeeId?.toLowerCase() === input.toLowerCase()
          );
          if (match?.email) {
            this.isLookingUp.set(false);
            this.doLogin(match.email, password);
          } else {
            this.isLookingUp.set(false);
            this.isLoading.set(false);
            this.errorMsg.set(`No employee found with ID "${input}". Please use your registered email address.`);
          }
        },
        error: () => {
          this.isLookingUp.set(false);
          this.isLoading.set(false);
          this.errorMsg.set('Please enter your registered email address to login with Employee ID lookup unavailable.');
        }
      });
    } else {
      // Try a public lookup endpoint for employee ID
      this.isLookingUp.set(true);
      this.isLoading.set(true);
      this.http.get<any>(`${this.apiBase}/auth/resolve-employee?employeeId=${encodeURIComponent(input)}`).subscribe({
        next: (res) => {
          const email = res?.data?.email || res?.email;
          if (email) {
            this.isLookingUp.set(false);
            this.doLogin(email, password);
          } else {
            this.isLookingUp.set(false);
            this.isLoading.set(false);
            this.errorMsg.set(`Employee ID "${input}" not found. Please use your registered email address.`);
          }
        },
        error: () => {
          this.isLookingUp.set(false);
          this.isLoading.set(false);
          this.errorMsg.set(`Please enter your email address (e.g. john@company.com) to login.`);
        }
      });
    }
  }

  private doLogin(email: string, password: string) {
    this.isLoading.set(true);
    this.errorMsg.set('');

    this.auth.login({ email, password }).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        const loginData = res?.data || res;
        const userRole = this.auth.currentUser()?.role || loginData?.role;
        const selectedRole = this.selectedRole();

        // Validate role selection matches actual role
        if (selectedRole === 'EMPLOYEE') {
          // Any role can login as employee - redirect to their actual role dashboard
          // but ONLY if selecting Employee tab allows all
          // Per spec: Employee can login only by selecting Employee
          // Manager can login by selecting both Employee and Manager
          // Admin can login by selecting both Employee and Admin (not Manager)
          if (userRole === 'MANAGER') {
            // Manager selected Employee tab — redirect to employee view
            this.router.navigate(['/employee']);
          } else if (userRole === 'ADMIN') {
            // Admin selected Employee tab — redirect to employee view
            this.router.navigate(['/employee']);
          } else {
            this.router.navigate(['/employee']);
          }
        } else if (selectedRole === 'MANAGER') {
          if (userRole !== 'MANAGER') {
            this.auth.logout();
            this.errorMsg.set('You do not have Manager access. Please select the correct role tab.');
            return;
          }
          this.router.navigate(['/manager']);
        } else if (selectedRole === 'ADMIN') {
          if (userRole !== 'ADMIN') {
            this.auth.logout();
            this.errorMsg.set('You do not have Admin access. Please select the correct role tab.');
            return;
          }
          this.router.navigate(['/admin']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const status = err.status;
        if (status === 400) {
          this.errorMsg.set('Please enter a valid email address.');
        } else if (status === 401 || status === 403) {
          this.errorMsg.set('Invalid credentials. Please check your email/Employee ID and password.');
        } else {
          this.errorMsg.set(err.error?.message || 'Login failed. Please try again.');
        }
      }
    });
  }
}
