# RevWorkforce Frontend

Angular 18 frontend for the RevWorkforce HRM application.

## Setup

```bash
npm install
ng serve
```

Open http://localhost:4200

## Backend
Make sure your Spring Boot backend is running on http://localhost:8080

If your backend runs on a different port, update the API URL in:
- src/app/core/services/auth.service.ts
- src/app/core/services/leave.service.ts
- src/app/core/services/employee.service.ts

## Project Structure

```
src/app/
├── core/
│   ├── guards/         → auth.guard.ts (route protection)
│   ├── interceptors/   → auth.interceptor.ts (JWT token)
│   ├── models/         → user.model.ts, leave.model.ts
│   └── services/       → auth, leave, employee services
├── features/
│   ├── auth/login/     → Login page
│   ├── employee/       → Employee dashboard
│   ├── manager/        → Manager dashboard
│   └── admin/          → Admin dashboard
└── shared/
    └── components/
        ├── sidebar/    → Shared sidebar (role-aware)
        └── topbar/     → Shared topbar
```

## Routes
- /login        → Login page
- /employee     → Employee dashboard (role: EMPLOYEE)
- /manager      → Manager dashboard (role: MANAGER)
- /admin        → Admin dashboard (role: ADMIN)

## Login Flow
1. User selects role tab (Employee / Manager / Admin)
2. Enters credentials
3. POST to /api/auth/login → returns { token, user }
4. Redirected to dashboard based on user.role
