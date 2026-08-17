# Project Audit Report: Hirecraft Backend

## Executive Summary

Based on a comprehensive review of the `server` directory (NestJS + TypeORM), here is the high-level assessment of the system:

- **Overall architecture quality:** **Good, but with leaky abstractions.** The project uses repository interfaces effectively. However, TypeORM's `EntityManager` leaks into the service layer for transactions, breaking the abstraction.
- **Overall database design quality:** **Solid, but missing critical constraints.** The relationships are generally well-defined, but there is a lack of composite unique constraints (specifically for Job Applications), which relies on application-level checks and is prone to race conditions.
- **Overall database performance & API Efficiency:** **Mixed.** Authenticated routes currently query the database on every request instead of fully utilizing JWTs. The job listing endpoint suffers from API under-fetching (leading to client-side N+1 HTTP requests). Pagination relies solely on `OFFSET` which is fine for admin tables but may become expensive for infinite-scrolling feeds. Database indexing relies on single-column indexes, which may be perfectly fine but warrants measurement under load.
- **Biggest risks:** 
  1. The hardcoded `synchronize: true` in the TypeORM configuration is extremely dangerous for production and could lead to accidental data loss.
  2. A critical bug in the `ApplicationsController` prevents employers from updating application statuses.

The project is safe to continue building on, provided the critical issues are addressed promptly.

---

## Critical Issues

### 1. Production Data Loss Risk (`synchronize: true`)
**[Confirmed Issue]**
**Evidence:** `src/config/db.config.ts` has `synchronize: true` hardcoded.
**Why it matters:** TypeORM's `synchronize` will automatically alter the database schema to match entity definitions on startup. In production, this can accidentally drop columns, tables, or data if an entity is temporarily misconfigured.
**Impact:** 🔴 Critical. Potential catastrophic data loss in production.
**Recommended fix:** Use the environment variable `NODE_ENV` to conditionally disable `synchronize` in production, or disable it entirely and rely purely on TypeORM migrations. *(Note: Since the app is in early development without real data, this is acceptable for now, but must be fixed before going live).*
**Migration considerations:** None.

### 2. Broken Authorization for Updating Application Status
**[Confirmed Issue]**
**Evidence:** `ApplicationsController.updateStatus` passes `@CurrentUser('id')` (the User ID) as the `employerId` parameter. However, `ApplicationsService` passes this to `applicationRepo.isEmployerOwner`, which expects a `companyId` (`where: { job: { companyId } }`).
**Why it matters:** The database query compares the Job's `companyId` to the User's `id`. Since these are distinct UUIDs, they will never match.
**Impact:** 🔴 Critical. Employers will always receive a `403 Forbidden` when trying to update an application status.
**Recommended fix:** Update the controller to extract the company ID from the JWT payload: `@CurrentUser('companyId') companyId: string` and pass that to the service.

---

## High Priority Issues

### 1. Database Bottleneck on Authenticated Requests (JWT Strategy)
**[Confirmed Issue]**
**Evidence:** `JwtStrategy.validate` calls `this.usersService.findByEmail(payload.email)` for every authenticated request.
**Why it matters:** JWTs are designed to be stateless. Querying the user table on every single API request defeats this purpose and adds an unnecessary database bottleneck.
**Impact:** 🟠 High. Will severely limit application throughput.
**Recommended fix:** Trust the signed JWT payload. Remove the DB query from `JwtStrategy.validate` and simply return the payload data. 

### 2. API Under-fetching Leading to Client-side N+1 Calls
**[Confirmed Issue]**
**Evidence:** `JobTypeormRepository.findAll` does not eagerly load relations like `Company` or `Machine`. The Domain entity (`Job`) lacks properties for company name, logo, or machine details.
**Why it matters:** When the client fetches a list of jobs, it only receives `companyId` and `machineId`. The frontend must then make separate API HTTP requests (e.g., `GET /companies/:id`) for every job to display the company names on the job cards. 
**Impact:** 🟠 High. Dozens of unnecessary HTTP round trips will severely degrade client performance and perceived load times.
**Recommended fix:** Avoid client-side N+1 API calls by allowing the backend to retrieve the required related data efficiently in the same backend request, rather than making many separate API requests. Use targeted JOINs in the `findAll` repository method to select exactly the fields needed for the job card (e.g., company name, logo, machine name) and map them to the response DTO. 
*Important:* JOINs should not be used blindly. Only required relationships and columns should be selected, and `leftJoinAndSelect` should be avoided for large one-to-many relationships that might multiply rows. Distinguish clearly between reducing HTTP round trips (good here) and increasing SQL execution time (bad if overused).

### 3. Race Condition in Job Applications (Missing Unique Constraint)
**[Confirmed Issue]**
**Evidence:** `JobApplicationOrmEntity` lacks a composite unique constraint for `jobId` and `workerProfileId`.
**Why it matters:** The system relies on an application-level `.exists()` check. Concurrent requests can bypass this and insert duplicate applications.
**Impact:** 🟠 High. Data integrity issue.
**Recommended fix:** Add `@Index(['jobId', 'workerProfileId'], { unique: true })` to `JobApplicationOrmEntity`.

---

## Medium Priority Issues

### 1. Leaky Architecture (Transactions in Services)
**[Recommended Improvement]**
**Evidence:** `AuthService.signup` opens a TypeORM `EntityManager` transaction and passes the `tx` object into domain services.
**Why it matters:** Passing a TypeORM-specific `EntityManager` into these functions tightly couples the business logic to TypeORM and breaks the repository abstraction.
**Impact:** 🟡 Medium. Affects maintainability and testing.
**Recommended fix:** Implement a Unit of Work (UoW) interface, or use a transaction decorator/wrapper that manages the context natively without polluting domain services.

### 2. Redundant DB Trips in Auth and Business Logic
**[Recommended Improvement]**
**Evidence:** `AuthService.login` makes a separate DB query to fetch the employer's `companyId`. `ApplicationsService.applyToJob` queries to get `workerProfileId`.
**Why it matters:** These are unnecessary database roundtrips that add latency to frequently used endpoints.
**Impact:** 🟡 Medium.
**Recommended fix:** Encode `companyId` (for employers) and `workerProfileId` (for candidates) directly into the JWT payload during login. This eliminates the need to look up these IDs on subsequent API calls.

---

## Deep Dive: Query & API Call Performance

### Pagination Strategies: OFFSET vs. Cursor
**[Recommended Improvement]**
**Evidence:** All pagination in the app (including job infinite scrolling) relies on TypeORM's `findAndCount` (`skip`/`take`).
**Analysis:** Large OFFSET values can become increasingly expensive because PostgreSQL may need to process and skip many preceding rows before returning the requested page. Furthermore, executing a `COUNT(*)` query (`findAndCount`) on every page request is unnecessary for infinite scroll feeds.
**Recommended fix:** Use two distinct pagination strategies based on the use case:
- **Cursor / Keyset Pagination:** Implement for worker job browsing, infinite scrolling, and job search filtering. Use a stable ordering (e.g., `ORDER BY createdAt DESC, id DESC`) to ensure consistent results. Investigate how this interacts with your job filters (country, city, experience level).
- **OFFSET / LIMIT Pagination:** Keep this strategy and `findAndCount()` for traditional management and admin tables (e.g., Company Management, User Management) where page numbers and total counts are actually useful and datasets are typically smaller.
- **Architectural Adjustment:** If you adopt both strategies, consider separating the generic `PaginatedResult<T>` abstraction into `OffsetPaginatedResult<T>` and `CursorPaginatedResult<T>` to keep semantics clean. (This is an architectural recommendation, not mandatory).

### Indexing Strategy: Single-Column vs. Composite
**[Requires Measurement]**
**Evidence:** `JobOrmEntity` uses individual `@Index()` decorators for `status`, `country`, `city`, `experienceLevel`, and `jobType`.
**Analysis:** PostgreSQL is highly capable of using multiple single-column indexes together via Bitmap Index Scans (BitmapAnd/BitmapOr). This design may be perfectly reasonable and efficient for your workload. However, if certain combinations of columns are heavily queried together with high selectivity, a composite index *might* offer better execution times.
**Recommended action:** Do not blindly delete single-column indexes or create composite ones. Instead, analyze the actual query patterns. Use `EXPLAIN (ANALYZE, BUFFERS)` to evaluate the execution plans on the most common filtering scenarios with realistic data. Only recommend and implement composite indexes when the actual workload and query measurements justify them.

---

## Low Priority / Optional Improvements

### 1. Inefficient ORM-to-Domain Mapping
**[Recommended Improvement]**
**Evidence:** Repositories use `Object.assign(domainEntity, ormEntity)`.
**Why it matters:** This blindly copies all properties, including un-loaded TypeORM relations, which can lead to unpredictable behavior in the domain layer.
**Impact:** 🟢 Low.
**Recommended fix:** Explicitly map only the scalar fields and loaded relations.

### 2. Missing Unique Constraint on Company Name
**[Recommended Improvement]**
**Evidence:** `CompanyOrmEntity.name` does not have `unique: true`.
**Why it matters:** If the business rule requires companies to have unique names (to prevent spoofing or duplicates), the database currently allows identical names.
**Impact:** 🟢 Low. Depends on business requirements.
**Recommended fix:** Add a unique constraint if required by business logic.

---

## Dependency-Aware Fix Plan

To safely implement the confirmed fixes, follow this sequence:

1. **Fix `db.config.ts`**: Update the `synchronize` flag to be conditionally tied to the environment.
2. **Fix `ApplicationsController`**: Change the extracted JWT parameter from `id` to `companyId`.
3. **Fix `JwtStrategy`**: Remove the database lookup inside the `validate` method.
4. **Targeted JOINs**: Update the `JobTypeormRepository.findAll` query to select only the specifically needed related fields (e.g., Company Name, Logo) to prevent client-side HTTP N+1 requests, while verifying the SQL execution plan.
5. **Update Entities & Migrations**: Add the unique composite index to `JobApplicationOrmEntity` and generate the migration (when you are ready to begin managing schemas).
