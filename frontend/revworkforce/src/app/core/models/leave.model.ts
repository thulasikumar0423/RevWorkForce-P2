// LeaveBalance matches backend LeaveBalanceResponse exactly
export interface LeaveBalance {
  employeeId?: number;
  employeeName?: string;
  leaveTypeId: number;
  leaveTypeName: string;  // backend field name
  totalQuota: number;     // backend field name (NOT total)
  used: number;
  remaining: number;
}

// Alias for backward compat used in some places
export interface LeaveApplication {
  id: number;
  employeeId: number;
  employeeName?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  managerComment?: string;
  appliedDate?: string;
}

export interface LeaveType {
  id: number;
  name: string;
  defaultQuota: number;
}

export interface Goal {
  id: number;
  title: string;
  description: string;
  deadline: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  progress: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'NOT_STARTED';
}

export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: 'LEAVE' | 'PERFORMANCE' | 'ANNOUNCEMENT';
}

export interface Announcement {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS';
}
