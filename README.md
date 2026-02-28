RevWorkforce - Human Resource Management System
A comprehensive full-stack Human Resource Management (HRM) system built with Spring Boot and Angular, designed to streamline employee management, leave tracking, performance reviews, and organizational workflows.

Table of Contents
Overview
Features
Technology Stack
Architecture
Prerequisites
Installation
Configuration
Running the Application
API Documentation
Default Credentials
Project Structure
Overview
RevWorkforce is an enterprise-grade HRM system that provides role-based access control for Admins, Managers, and Employees. The system facilitates efficient workforce management through automated leave management, performance tracking, goal setting, and comprehensive reporting capabilities.

Features
Admin Features
Employee Management: Create, update, and manage employee records
Department & Designation Management: Organize workforce structure
Leave Management: Approve/reject leave requests, manage leave types and quotas
Leave Balance Management: Adjust employee leave balances
Holiday Calendar: Configure organizational holidays
Announcements: Broadcast company-wide announcements
Activity Logs: Track system activities and user actions
Reports: Generate leave reports and analytics
Manager Features
Team Dashboard: Overview of team performance and activities
Team Leave Management: Approve/reject team member leave requests
Team Calendar: View team availability and leave schedules
Performance Reviews: Conduct and manage team performance reviews
Goal Management: Set and track team goals
Team Information: Access team member details and hierarchy
Employee Features
Personal Dashboard: View personal information and quick stats
Leave Application: Apply for various types of leaves
Leave History: Track leave applications and balances
Holiday Calendar: View organizational holidays
Performance Reviews: View and respond to performance reviews
Goal Tracking: View and update personal goals
Profile Management: Update personal information and change password
Notifications: Receive real-time updates on leave status and announcements
Common Features
JWT Authentication: Secure token-based authentication
Role-Based Access Control: Granular permissions based on user roles
Real-time Notifications: In-app notification system
Employee Directory: Search and view employee information
Responsive UI: Mobile-friendly interface with Bootstrap
Technology Stack
Backend
Framework: Spring Boot 3.2.2
Language: Java 17
Security: Spring Security with JWT (JSON Web Tokens)
Database: MySQL
ORM: Spring Data JPA / Hibernate
Validation: Spring Validation
Logging: Log4j2
API Documentation: Swagger/OpenAPI 3.0
Mapping: MapStruct
Build Tool: Maven
Frontend
Framework: Angular 18.2
Language: TypeScript 5.5
UI Framework: Bootstrap 5.3
Icons: Bootstrap Icons
HTTP Client: RxJS
Routing: Angular Router
Architecture
The application follows a layered architecture pattern:

┌─────────────────────────────────────┐
│         Angular Frontend            │
│    (Components, Services, Guards)   │
└─────────────────┬───────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────┐
│         Spring Boot Backend         │
├─────────────────────────────────────┤
│  Controller Layer (REST APIs)       │
│  Service Layer (Business Logic)     │
│  Repository Layer (Data Access)     │
│  Security Layer (JWT + Auth)        │
└─────────────────┬───────────────────┘
                  │ JPA/Hibernate
┌─────────────────▼───────────────────┐
│          MySQL Database             │
└─────────────────────────────────────┘
Key Design Patterns
MVC Pattern: Separation of concerns
DTO Pattern: Data transfer between layers
Repository Pattern: Data access abstraction
Service Layer Pattern: Business logic encapsulation
Dependency Injection: Loose coupling
AOP: Cross-cutting concerns (logging)
Prerequisites
Java: JDK 17 or higher
Node.js: v18.x or higher
npm: v9.x or higher
MySQL: 8.0 or higher
Maven: 3.6+ (or use included Maven wrapper)
Angular CLI: 18.x
Installation
1. Clone the Repository
git clone <repository-url>
cd RevWorkforce-P2
2. Database Setup
CREATE DATABASE rev_workforce_p2_db;
3. Backend Setup
# Install dependencies
mvn clean install

# Or using Maven wrapper
./mvnw clean install
4. Frontend Setup
cd frontend
npm install
Configuration
Backend Configuration
Edit src/main/resources/application.properties:

# Server Configuration
server.port=8084

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3304/rev_workforce_p2_db
spring.datasource.username=root
spring.datasource.password=root

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Configuration
jwt.secret=revworkforce_super_secure_secret_key_2026_rev_p2_backend
jwt.expiration=86400000
Frontend Configuration
The frontend is configured to connect to the backend API. Update API endpoints in service files if needed.

Running the Application
Start Backend
# Using Maven
mvn spring-boot:run

# Or using Maven wrapper
./mvnw spring-boot:run

# Or run the JAR
java -jar target/revworkforce-0.0.1-SNAPSHOT.jar
Backend will start on: http://localhost:8084

Start Frontend
cd frontend
npm start
# Or
ng serve
Frontend will start on: http://localhost:4200

API Documentation
Once the backend is running, access the Swagger UI documentation at:

http://localhost:8084/swagger-ui.html
The API documentation provides:

Complete list of endpoints
Request/response schemas
Interactive API testing
Authentication requirements
Default Credentials
Admin Account
Email: admin@gmail.com
Password: admin123
Employee ID: ADMIN001
Default Leave Types
Sick Leave: 12 days
Casual Leave: 15 days
Annual Leave: 21 days
Project Structure
Backend Structure
src/main/java/com/rev/revworkforcep2/
├── aspect/              # AOP logging aspects
├── config/              # Application configuration
├── controller/          # REST API controllers
│   ├── activity/
│   ├── announcement/
│   ├── auth/
│   ├── department/
│   ├── designation/
│   ├── leave/
│   ├── notification/
│   ├── performance/
│   └── user/
├── dto/                 # Data Transfer Objects
│   ├── request/
│   └── response/
├── exception/           # Custom exceptions & handlers
├── mapper/              # MapStruct mappers
├── model/               # JPA entities
├── repository/          # Spring Data repositories
├── security/            # Security configuration & JWT
│   ├── authorization/
│   ├── config/
│   ├── jwt/
│   ├── model/
│   ├── service/
│   └── util/
├── service/             # Business logic services
│   ├── activity/
│   ├── announcement/
│   ├── auth/
│   ├── department/
│   ├── designation/
│   ├── leave/
│   ├── notification/
│   ├── performance/
│   └── user/
└── util/                # Utility classes
Frontend Structure
frontend/src/app/
├── core/                # Core functionality
│   ├── guards/          # Route guards
│   ├── interceptors/    # HTTP interceptors
│   ├── models/          # Data models
│   ├── services/        # API services
│   └── utils/           # Utility functions
├── features/            # Feature modules
│   ├── admin/           # Admin features
│   ├── auth/            # Authentication
│   ├── employee/        # Employee features
│   └── manager/         # Manager features
└── shared/              # Shared components
    └── components/
Key Modules
Authentication & Authorization
JWT-based authentication
Role-based access control (ADMIN, MANAGER, EMPLOYEE)
Secure password encryption (BCrypt)
Token refresh mechanism
Leave Management
Multiple leave types support
Leave balance tracking
Approval workflow
Holiday calendar integration
Leave reports and analytics
Performance Management
Goal setting and tracking
Performance reviews
Feedback system
Team performance summaries
Notification System
Real-time notifications
Leave status updates
Announcement broadcasts
Mark as read functionality
Activity Logging
User action tracking
System audit trail
Comprehensive logging with Log4j2
Development
Build for Production
Backend:

mvn clean package -DskipTests
Frontend:

cd frontend
ng build --configuration production
Running Tests
Backend:

mvn test
Frontend:

cd frontend
npm test
Security Features
Password encryption using BCrypt
JWT token-based authentication
CORS configuration for cross-origin requests
SQL injection prevention through JPA
XSS protection
Role-based endpoint security
Secure password change mechanism
Logging
Application logs are stored in:

logs/revworkforce.log
Log levels can be configured in application.properties:

logging.level.root=INFO
Contributing
Fork the repository
Create a feature branch
Commit your changes
Push to the branch
Create a Pull Request
License
This project is proprietary software developed for RevWorkforce.

Support
For issues and questions, please contact the development team or create an issue in the repository.

Built by the RevWorkforce Team

About
RevWorkforce is a full-stack monolithic HRM web application built with Java and Spring Boot. 
It streamlines employee management, leave tracking, and performance reviews with role-based access (Employee, Manager, Admin), secure authentication, dashboards, notifications, and HR reporting.

Resources
 Readme
 Activity
Stars
 0 stars
Watchers
 0 watching
Forks
 0 forks
Releases
No releases published
Create a new release
Packages
No packages published
Publish your first package
Contributors
7
@RevWorkForceTeam
@prudhviabc
@thulasikumar0423
@NUNNASUJITHA
@Chaithanya511
@Karthiknalla24
@Panguluri-Anusha
Languages
Java
53.1%
 
HTML
23.8%
 
TypeScript
15.9%
 
CSS
7.2%
Suggested workflows
Based on your tech stack
Publish Java Package with Gradle logo
Publish Java Package with Gradle
Build a Java Package using Gradle and publish to GitHub Packages.
Scala logo
Scala
Build and test a Scala project with SBT.
Java with Gradle logo
Java with Gradle
Build and test a Java project using a Gradle wrapper script.
More workflows
Footer
