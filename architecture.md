# Architecture: YaaQeen (YaaQeen Syariah)

## 1. High-Level Architecture

**Pattern**: Serverless Monolith (SvelteKit)
**Infrastructure**: Vercel (Edge/Serverless) + Neon (Postgres) + Upstash (Redis)

```mermaid
graph TD
    Client[Client (PWA/Web)] -->|HTTPS| CDN[Vercel Edge Network]
    CDN -->|Static Assets| Storage[Blob Storage]
    CDN -->|Dynamic Request| SK[SvelteKit Server (Serverless/Edge)]
    
    subgraph "Backend Layer"
        SK -->|Auth & Session| Auth[Better-Auth]
        SK -->|Data Access| Drizzle[Drizzle ORM]
        SK -->|Caching| Redis[Upstash Redis]
        SK -->|AI Processing| LLM[OpenAI / Anthropic]
    end
    
    subgraph "Data Layer"
        Drizzle -->|Connection Pooling| DB[(Neon Postgres)]
    end
```

## 2. Module Breakdown

### Core Modules
1.  **Auth Module**: Handles identity, sessions, and profile management.
2.  **Habit Engine**: Core logic for habit definitions, frequency parsing, and completion validation.
3.  **Tracking Module**: Records daily logs, calculates streaks, and aggregates stats.
4.  **Ibadah Module**: Specialized logic for prayer times (Adhan.js integration), Qadha tracking, and Hijri calendar events.

### Support Modules
5.  **Gamification Engine**: Rules for awarding badges, XP, and leveling up based on "Istiqomah Score".
6.  **AI Coach (Muhasabah)**: Context-aware feedback generator using LLM.
7.  **Notification System**: Push notifications (FCM/WebPush) and email triggers.

## 3. Auth Flow (Better-Auth)

**Strategy**: Session-based Authentication (HttpOnly Cookies).

1.  **Sign Up**:
    - User submits Email/Password or OAuth (Google).
    - Server validates & hashes password (Argon2id).
    - Create `User` record.
    - Create `Session` -> Set `auth_session` cookie.
2.  **Request Validation**:
    - Hooks (`handle` in `hooks.server.ts`) intercept request.
    - Validate `auth_session` cookie.
    - If valid, populate `event.locals.user` & `event.locals.session`.
3.  **Protection**:
    - Layouts (`+layout.server.ts`) check `locals.user`.
    - Redirect to `/login` if null.

## 4. Role & Permission Flow (RBAC)

**Roles**: `USER`, `ADMIN`, `MENTOR` (Future)

| Feature | USER | ADMIN | MENTOR |
| :--- | :---: | :---: | :---: |
| Manage Own Habits | ✅ | ✅ | ❌ |
| View Global Stats | ❌ | ✅ | ❌ |
| Manage Users | ❌ | ✅ | ❌ |
| Manage Content (Badges/Quotes) | ❌ | ✅ | ❌ |
| View Mentee Progress | ❌ | ✅ | ✅ |

**Implementation**:
- Middleware check: `if (user.role !== 'ADMIN') throw error(403)`
- Row Level Security (Logical): `where(eq(habits.userId, currentUser.id))`

## 5. API Spec (SvelteKit Server Actions & API Routes)

### Habits
- `GET /api/habits`: List all active habits.
- `POST /?/createHabit`: Form action to create new habit.
- `POST /?/updateHabit`: Update habit details.
- `POST /?/deleteHabit`: Soft delete habit.

### Tracking
- `POST /api/log`: Log completion (idempotent).
    - Body: `{ habitId: string, date: string, status: 'DONE' | 'SKIP', value?: number }`
- `GET /api/stats/streak`: Get current streak info.

### Ibadah
- `GET /api/prayer-times`: Get schedule based on lat/long.
- `POST /?/logPrayer`: Specialized logger for prayers (Jamaah/Munfarid).

## 6. Database Schema (Enhanced)

```typescript
// schema.ts

// Enums
export const roleEnum = pgEnum('role', ['USER', 'ADMIN', 'MENTOR']);
export const habitTypeEnum = pgEnum('habit_type', ['IBADAH', 'CUSTOM', 'SUNNAH']);
export const frequencyTypeEnum = pgEnum('freq_type', ['DAILY', 'WEEKLY', 'SPECIFIC_DAYS']);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  role: roleEnum('role').default('USER'),
  tier: text('tier').default('FREE'), // FREE, PREMIUM
  createdAt: timestamp('created_at').defaultNow()
});

export const habits = pgTable('habits', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  type: habitTypeEnum('type').default('CUSTOM'),
  frequency: jsonb('frequency').notNull(), // { type: 'DAILY', days: [1,3,5] }
  target: integer('target').default(1),
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

export const habitLogs = pgTable('habit_logs', {
  id: text('id').primaryKey(),
  habitId: text('habit_id').references(() => habits.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(), // Denormalized for faster queries
  date: date('date').notNull(), // YYYY-MM-DD
  status: text('status').notNull(), // COMPLETED, SKIPPED, FAILED
  value: integer('value'),
  completedAt: timestamp('completed_at').defaultNow()
}, (t) => ({
  unq: uniqueIndex('unique_log').on(t.habitId, t.date)
}));

export const achievements = pgTable('achievements', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  badgeId: text('badge_id'),
  awardedAt: timestamp('awarded_at').defaultNow()
});
```

## 7. Caching & Performance Plan

### Strategy
1.  **Edge Caching (Static)**: Cache CSS, JS, Images at the edge (Vercel CDN).
2.  **Server Data Caching (Redis)**:
    - **Prayer Times**: Cache calculation results for specific coordinates/date (TTL: 24h).
    - **User Profile**: Cache user session/profile on login (TTL: 15m).
    - **Leaderboard**: Cache global/friend leaderboards (TTL: 1h).
3.  **Client State**:
    - Use `svelte/store` or `runes` for local state.
    - Service Worker for offline capability (PWA) - critical for tracking without internet.
4.  **Database Optimization**:
    - Indexes on `habit_logs(user_id, date)` for dashboard queries.
    - Indexes on `habits(user_id, is_archived)`.

## 8. Security Checklist

- [ ] **Authentication**: Enforce strong passwords (min 8 chars). Implement Rate Limiting on Login endpoints (Upstash Ratelimit).
- [ ] **Authorization**: Ensure every DB query includes `where(eq(userId, session.userId))`.
- [ ] **Data Validation**: Use Zod for ALL server actions and API inputs.
- [ ] **CSRF**: Enable SvelteKit's built-in CSRF protection (`checkOrigin: true`).
- [ ] **Headers**: Set security headers (Helmet equivalent in `hooks.server.ts`): `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`.
- [ ] **Dependencies**: Regular `npm audit`.
- [ ] **Environment**: Keep `DATABASE_URL` and `AUTH_SECRET` in `.env` only.
