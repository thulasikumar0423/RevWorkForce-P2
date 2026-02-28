export interface User {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  department: string;
  designation: string;
  managerId?: number;
  managerName?: string;
  phone?: string;
  address?: string;
  joiningDate?: string;
  salary?: number;
 active: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}
