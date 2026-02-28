import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.css']
})
export class DirectoryComponent implements OnInit {
  employees = signal<any[]>([]);
  filteredEmployees = signal<any[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');

  constructor(
    private employeeService: EmployeeService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees.set(data);
        this.filteredEmployees.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.employees.set([]);
        this.filteredEmployees.set([]);
        this.isLoading.set(false);
      }
    });
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
    if (!term) {
      this.filteredEmployees.set(this.employees());
    } else {
      const lower = term.toLowerCase();
      this.filteredEmployees.set(
        this.employees().filter(e => 
          e.name?.toLowerCase().includes(lower) ||
          e.email?.toLowerCase().includes(lower) ||
          e.department?.toLowerCase().includes(lower) ||
          e.designation?.toLowerCase().includes(lower)
        )
      );
    }
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getRole(): 'EMPLOYEE' | 'MANAGER' | 'ADMIN' {
    const role = this.auth.getRole();
    return (role === 'EMPLOYEE' || role === 'MANAGER' || role === 'ADMIN') ? role : 'EMPLOYEE';
  }

  getAvatarColor(i: number): string {
    const colors = [
      'linear-gradient(135deg,#3b82f6,#1d4ed8)',
      'linear-gradient(135deg,#10b981,#059669)',
      'linear-gradient(135deg,#8b5cf6,#6d28d9)',
      'linear-gradient(135deg,#f59e0b,#d97706)',
      'linear-gradient(135deg,#ec4899,#be185d)',
      'linear-gradient(135deg,#14b8a6,#0d9488)'
    ];
    return colors[i % colors.length];
  }
}
