import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {

  employees = signal<any[]>([]);
  filteredEmployees = signal<any[]>([]);
  departments = signal<any[]>([]);
  designations = signal<any[]>([]);
  managers = signal<any[]>([]);
  isLoading = signal(true);

  showAddModal = signal(false);

  // 🔹 FIX: use normal string for ngModel
  searchTerm: string = '';

  editingEmployeeId: number | null = null;

  newEmployee = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    employeeId: '',
    departmentId: undefined as number | undefined,
    designationId: undefined as number | undefined,
    managerId: undefined as number | undefined,
    phone: '',
    address: '',
    joiningDate: '',
    salary: undefined as number | undefined,
    role: 'EMPLOYEE' as 'EMPLOYEE' | 'MANAGER' | 'ADMIN'
  };

  constructor(
    private employeeService: EmployeeService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.loadEmployees();
    this.loadDepartments();
    this.loadDesignations();
  }

  // ================= LOAD DATA =================

  loadEmployees() {
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : [];
        this.employees.set(list);
        this.managers.set(list.filter((e: any) => e.role === 'MANAGER'));
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => {
        this.employees.set([]);
        this.isLoading.set(false);
      }
    });
  }

  loadDepartments() {
    this.employeeService.getDepartments().subscribe({
      next: (data) => this.departments.set(Array.isArray(data) ? data : []),
      error: () => this.departments.set([])
    });
  }

  loadDesignations() {
    this.employeeService.getDesignations().subscribe({
      next: (data) => this.designations.set(Array.isArray(data) ? data : []),
      error: () => this.designations.set([])
    });
  }

  // ================= SEARCH =================

  onSearch() {
    this.applyFilters();
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase();

    this.filteredEmployees.set(
      this.employees().filter(e =>
        !term || this.matchSearch(e, term)
      )
    );
  }

  matchSearch(e: any, term: string): boolean {
    const fullName =
      `${e.firstName || ''} ${e.lastName || ''}`.toLowerCase();

    return (
      fullName.includes(term) ||
      e.email?.toLowerCase().includes(term) ||
      e.employeeId?.toLowerCase().includes(term) ||
      e.departmentName?.toLowerCase().includes(term) ||
      e.designationTitle?.toLowerCase().includes(term)
    );
  }

  // ================= ADD / EDIT =================

  addEmployee() {

    if (this.newEmployee.role === 'EMPLOYEE' && !this.newEmployee.managerId) {
      alert('Please select a reporting manager.');
      return;
    }

    if (this.editingEmployeeId) {
      this.employeeService.updateEmployee(this.editingEmployeeId, this.newEmployee)
        .subscribe({
          next: () => this.afterSave(),
          error: (err) =>
            alert(err?.error?.message || 'Failed to update employee')
        });
    } else {
      this.employeeService.addEmployee(this.newEmployee)
        .subscribe({
          next: () => this.afterSave(),
          error: (err) =>
            alert(err?.error?.message || 'Failed to add employee')
        });
    }
  }

  editEmployee(emp: any) {

    this.editingEmployeeId = emp.id;

    this.newEmployee = {
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      password: '',
      employeeId: emp.employeeId,
      departmentId: emp.departmentId,
      designationId: emp.designationId,
      managerId: emp.managerId,
      phone: emp.phone,
      address: emp.address,
      joiningDate: emp.joiningDate,
      salary: emp.salary,
      role: emp.role
    };

    this.showAddModal.set(true);
  }

  afterSave() {
    this.showAddModal.set(false);
    this.loadEmployees();
    this.resetForm();
  }

  deactivate(id: number) {
    if (!confirm('Deactivate this employee?')) return;

    this.employeeService.deactivateEmployee(id)
      .subscribe(() => this.loadEmployees());
  }

  reactivate(id: number) {
    this.employeeService.reactivateEmployee(id)
      .subscribe(() => this.loadEmployees());
  }

  resetForm() {
    this.editingEmployeeId = null;
    this.newEmployee = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      employeeId: '',
      departmentId: undefined,
      designationId: undefined,
      managerId: undefined,
      phone: '',
      address: '',
      joiningDate: '',
      salary: undefined,
      role: 'EMPLOYEE'
    };
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}