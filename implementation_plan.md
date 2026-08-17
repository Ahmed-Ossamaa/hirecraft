# Goal Description

Address the confirmed critical and high-priority issues from the audit report, specifically fixing the database synchronization risk, the application status authorization bug, the JWT database lookup bottleneck, the job applications unique constraint, and implementing targeted JOINs for the jobs listing to resolve API under-fetching.

## User Review Required

Please review the proposed changes below. Note that per your request, the measurement-based indexing recommendations and the pagination refactoring (Cursor/Keyset) are **excluded** from this plan.

## Proposed Changes

---

### config
#### [MODIFY] [db.config.ts](file:///d:/Projects/technically/server/src/config/db.config.ts)
- Update `synchronize: true` to evaluate conditionally: `synchronize: env.NODE_ENV !== 'production'`.

---

### applications (feature)
#### [MODIFY] [applications.controller.ts](file:///d:/Projects/technically/server/src/features/applications/applications.controller.ts)
- In the `updateStatus` endpoint, change the parameter decorator from `@CurrentUser('id') employerId` to `@CurrentUser('companyId') companyId`.
- Update the call to the service to pass `companyId`.

#### [MODIFY] [applications.service.ts](file:///d:/Projects/technically/server/src/features/applications/applications.service.ts)
- Rename the `employerId` parameter to `companyId` in the `updateStatus` method to accurately reflect its intent.

#### [MODIFY] [job-application.orm-entity.ts](file:///d:/Projects/technically/server/src/features/applications/infrastructure/job-application.orm-entity.ts)
- Add a composite unique index: `@Index(['jobId', 'workerProfileId'], { unique: true })` to prevent duplicate application race conditions.

---

### auth (feature)
#### [MODIFY] [jwt.strategy.ts](file:///d:/Projects/technically/server/src/features/auth/strategies/jwt.strategy.ts)
- Remove `UsersService` from the constructor.
- Remove the `await this.usersService.findByEmail(payload.email)` database query.
- Directly map and return the `payload` to restore true stateless JWT performance.

#### [MODIFY] [users.module.ts](file:///d:/Projects/technically/server/src/features/users/users.module.ts)
- Ensure no dependency issues arise from removing `UsersService` injection into `JwtStrategy` (this is a transparent structural check).

---

### jobs (feature)
#### [MODIFY] [job.entity.ts](file:///d:/Projects/technically/server/src/features/jobs/domain/job.entity.ts)
- Add optional properties: `companyName?: string`, `companyLogo?: string`, `machineNameEn?: string`, `machineNameAr?: string`.

#### [MODIFY] [job.typeorm.repo.ts](file:///d:/Projects/technically/server/src/features/jobs/infrastructure/job.typeorm.repo.ts)
- Refactor `findAll` to use `createQueryBuilder`.
- Use `.leftJoin('job.company', 'company')` and `.addSelect(['company.name', 'company.logoUrl'])`.
- Use `.leftJoin('job.machine', 'machine')` and `.addSelect(['machine.nameEn', 'machine.nameAr'])`.
- Map these selected fields in `mapToDomain`.
- Apply all existing filters dynamically via `andWhere` conditions.

## Verification Plan

### Automated Tests
- Ensure standard compilation builds correctly (`npm run build`).

### Manual Verification
- Review the targeted QueryBuilder generation to ensure it won't trigger massive N+1 cascades in TypeORM.
- Confirm JWTs decode seamlessly without DB calls.
