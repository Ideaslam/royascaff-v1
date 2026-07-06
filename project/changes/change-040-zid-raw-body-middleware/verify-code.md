# Verify Code — change-040: Raw body middleware

## Checks

### 1. Code change present
- [x] `src/main.ts` — `NestFactory.create(AppModule, { rawBody: true, logger: [...] })` ✓

### 2. No new endpoints or services
- [x] No new files created — bootstrap-only change ✓

### 3. Auth / security
- [x] No new auth surfaces — existing webhook endpoints unchanged ✓

### 4. Acceptance criteria
1. [x] `rawBody: true` set in `NestFactory.create()` — line 9 of `main.ts` ✓
2. [x] `req.rawBody` will now be a `Buffer` on every request — webhook controllers already read `(req as any).rawBody` ✓
3. [x] No new TypeScript required — option is typed in `@nestjs/core` NestApplicationOptions ✓

## Overall: PASS
