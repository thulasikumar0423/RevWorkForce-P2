import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.css']
})
export class DepartmentsComponent implements OnInit {
  departments = signal<any[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  editMode = signal(false);
  currentDept: any = { id: null, name: '', description: '' };

  constructor(
    private employeeService: EmployeeService,
    public auth: AuthService
  ) {}

  ngOnInit() { this.loadDepartments(); }

  loadDepartments() {
    this.employeeService.getDepartments().subscribe({
      next: (data) => { this.departments.set(data); this.isLoading.set(false); },
      error: () => { this.departments.set([]); this.isLoading.set(false); }
    });
  }

  openAddModal() {
    this.editMode.set(false);
    this.currentDept = { id: null, name: '', description: '' };
    this.showModal.set(true);
  }

  openEditModal(dept: any) {
    this.editMode.set(true);
    this.currentDept = { ...dept };
    this.showModal.set(true);
  }

  saveDepartment() {
    if (this.editMode()) {
      this.employeeService.updateDepartment(this.currentDept.id, this.currentDept).subscribe({
        next: () => { this.showModal.set(false); this.loadDepartments(); },
        error: () => alert('Failed to update department')
      });
    } else {
      this.employeeService.addDepartment(this.currentDept).subscribe({
        next: () => { this.showModal.set(false); this.loadDepartments(); },
        error: () => alert('Failed to add department')
      });
    }
  }

  deleteDepartment(id: number) {
    if (!confirm('Delete this department? This cannot be undone.')) return;
    this.employeeService.deleteDepartment(id).subscribe({
      next: () => this.loadDepartments(),
      error: () => alert('Cannot delete department with existing employees')
    });
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
