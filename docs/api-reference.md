# CAPACITY CONNECT — REST API Reference (OpenAPI 3.0 Summary)
**Base Path:** `/api/v1`  
**Interactive Swagger UI:** `http://localhost:4000/api/v1/docs`

---

## 1. Authentication (`/api/v1/auth`)

| Method | Endpoint | Access | Summary |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Officer login with Argon2 verification; sets `httpOnly` secure cookies |
| `POST` | `/auth/signup` | Public | Staff self-registration; lands in `PENDING` approval queue |
| `POST` | `/auth/refresh` | Public | Exchange refresh token cookie for a fresh access token |
| `POST` | `/auth/logout` | Auth | Invalidate session and clear `access_token` and `refresh_token` cookies |
| `POST` | `/auth/forgot-password` | Public | Issue timed password reset token |
| `POST` | `/auth/reset-password` | Public | Update password using valid reset token |
| `POST` | `/auth/change-password` | Auth | Change password verifying previous password |
| `POST` | `/auth/2fa/setup` | Auth | Generate TOTP secret and QR provisioning URI |
| `POST` | `/auth/2fa/verify` | Auth | Verify TOTP code and activate 2FA on account |

---

## 2. Users & Staff Management (`/api/v1/users`)

| Method | Endpoint | Access | Summary |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/me` | Auth | Get current authenticated officer profile, skills, points, and badges |
| `PUT` | `/users/me/profile` | Auth | Update personal profile, phone, language, qualifications, experience |
| `GET` | `/users/pending` | ADMIN | List staff registrations awaiting administrative clearance |
| `POST` | `/users/:id/approve` | ADMIN | Approve user registration and assign role (`TRAINEE`, `TRAINER`, `ADMIN`) |
| `POST` | `/users/:id/reject` | ADMIN | Reject registration with administrative reason |
| `GET` | `/users` | ADMIN | Staff directory with search, office, and role filters |
| `DELETE`| `/users/:id` | ADMIN | Remove user account from system |
| `POST` | `/users/bulk-import/preview` | ADMIN | Validate uploaded CSV/XLSX rows; returns error preview |
| `POST` | `/users/bulk-import/confirm` | ADMIN | Execute transactional import of valid staff records |

---

## 3. Courses & Materials (`/api/v1/courses`)

| Method | Endpoint | Access | Summary |
| :--- | :--- | :--- | :--- |
| `GET` | `/courses` | Auth | List published courses with search, category, and level filters |
| `GET` | `/courses/:id` | Auth | Get course syllabus, modules, materials, and prerequisite status |
| `POST` | `/courses/:id/enroll` | Auth | Enroll in course (validates prerequisites) |
| `PUT` | `/courses/:id/progress` | Auth | Update progress percentage and unlock completions |
| `POST` | `/courses/:id/ratings` | Auth | Submit star rating (1-5) and operational feedback |
| `POST` | `/courses` | TRAINER, ADMIN | Author new course curriculum with modules |
| `GET` | `/courses/library` | TRAINER, ADMIN | Browse shared Trainer Library slides, manuals, and notes |
| `POST` | `/courses/library` | TRAINER, ADMIN | Upload instructional materials to shared library |
| `GET` | `/courses/materials/presigned-url` | Auth | Get signed expiring S3 download URL |

---

## 4. Examinations & Tests (`/api/v1/tests`)

| Method | Endpoint | Access | Summary |
| :--- | :--- | :--- | :--- |
| `GET` | `/tests/:id` | Auth | Get exam rules, duration, and passing score |
| `POST` | `/tests/:id/start` | Auth | Start timed attempt; returns server-randomized questions without answers |
| `POST` | `/tests/attempts/:id/submit`| Auth | Submit answers, enforce timer, auto-grade, award points & cert |
| `GET` | `/tests/attempts/:id/result`| Auth | View score, review questions, explanations, and cert hash |
| `GET` | `/tests/:id/results` | TRAINER, ADMIN | View roster of staff who took exam and their scores |
| `POST` | `/tests` | TRAINER, ADMIN | Author manual test paper with deadline and passing threshold |

---

## 5. Certificates & Verification (`/api/v1/certificates` & `/api/v1/verify`)

| Method | Endpoint | Access | Summary |
| :--- | :--- | :--- | :--- |
| `GET` | `/verify/:id` | **Public** | Public verification returning Valid/Expired/Revoked status & hash |
| `GET` | `/certificates/my` | Auth | List certificates earned by authenticated officer |
| `GET` | `/certificates/transcript` | Auth | Generate printable academic transcript record |
| `GET` | `/certificates/:id/download` | Public | Download official stamped bilingual certificate PDF with QR code |
| `POST` | `/certificates/:id/revoke` | ADMIN | Revoke a compromised certificate |

---

## 6. AI Course Assistant (RAG) (`/api/v1/ai/assistant`)

| Method | Endpoint | Access | Summary |
| :--- | :--- | :--- | :--- |
| `POST` | `/ai/assistant/chat` | Auth | Bilingual RAG query citing official manuals & video timestamps |
| `POST` | `/ai/assistant/feedback` | Auth | Record thumbs up/down quality rating for answer |

---

## 7. AI Test Generator (`/api/v1/ai/test-gen`)

| Method | Endpoint | Access | Summary |
| :--- | :--- | :--- | :--- |
| `POST` | `/ai/test-gen/generate` | TRAINER, ADMIN | Synthesize 8-10 draft MCQs from training manual or transcript |
| `GET` | `/ai/test-gen/drafts` | TRAINER, ADMIN | List drafted questions awaiting trainer review |
| `PUT` | `/ai/test-gen/drafts/:id`| TRAINER, ADMIN | Edit, approve, or reject draft question |
| `POST` | `/ai/test-gen/publish` | TRAINER, ADMIN | Publish approved questions into target exam paper |

---

## 8. Skill Graph & Expert Finder (`/api/v1/skills`)

| Method | Endpoint | Access | Summary |
| :--- | :--- | :--- | :--- |
| `GET` | `/skills` | Auth | Get all registered skills in the IMD taxonomy |
| `GET` | `/skills/expert-finder` | Auth | Natural language search for ranked meteorological specialists |
| `GET` | `/skills/gap-report` | ADMIN | Office skill-gap matrix across regional centres |

---

## 9. Trainer Matching & Scheduling (`/api/v1/trainer`)

| Method | Endpoint | Access | Summary |
| :--- | :--- | :--- | :--- |
| `GET` | `/trainer/availability` | TRAINER | Get 7-day recurring availability grid and booked sessions |
| `PUT` | `/trainer/availability` | TRAINER | Save weekly slot availability |
| `POST` | `/trainer/matching/suggest`| ADMIN | Algorithmic ranking of trainers with composite match score |
| `POST` | `/trainer/sessions/invite` | ADMIN | Dispatch session invitation to selected trainer |
| `GET` | `/trainer/invitations` | TRAINER | Get incoming session invitations |
| `PUT` | `/trainer/invitations/:id/respond` | TRAINER | Accept or decline invitation; accepted books to calendar |
| `GET` | `/trainer/calendar/export.ics` | TRAINER | Export accepted sessions as iCalendar (.ics) feed |

---

## 10. Live Virtual Classes (Jitsi) (`/api/v1/live-sessions`)

| Method | Endpoint | Access | Summary |
| :--- | :--- | :--- | :--- |
| `GET` | `/live-sessions` | Auth | List scheduled masterclasses and webinars |
| `GET` | `/live-sessions/:id/token`| Auth | Generate secure Jitsi JWT (trainer=moderator, trainee=participant) |
| `POST` | `/live-sessions/webhook` | Public | Jitsi webhook for attendance tracking and recording ingestion |

---

## 11. PWA & Offline Synchronization (`/api/v1/offline`)

| Method | Endpoint | Access | Summary |
| :--- | :--- | :--- | :--- |
| `GET` | `/offline/package/:testId`| Auth | Download HMAC-signed test package for offline client execution |
| `POST` | `/offline/sync` | Auth | Batch sync queued offline test submissions upon reconnecting |

---

## 12. Gamification & Leaderboard (`/api/v1/gamification`)

| Method | Endpoint | Access | Summary |
| :--- | :--- | :--- | :--- |
| `GET` | `/gamification/my-progress`| Auth | Get points, badges, streak, and hours logged |
| `GET` | `/gamification/leaderboard`| Public | Regional office leaderboard and top learners |
| `GET` | `/gamification/achievements-wall`| Public | Live Achievements Wall feed for portal homepage |

---

## 13. Notifications & Announcements (`/api/v1/notifications`)

| Method | Endpoint | Access | Summary |
| :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | Auth | Get current user notifications and unread badge count |
| `PUT` | `/notifications/:id/read` | Auth | Mark notification as read |
| `PUT` | `/notifications/read-all`| Auth | Mark all notifications as read |
| `GET` | `/notifications/announcements` | Public | Get departmental circulars and announcements |
| `POST` | `/notifications/announcements` | ADMIN | Publish announcement to portal homepage |

---

## 14. Admin Governance & Audit (`/api/v1/admin`)

| Method | Endpoint | Access | Summary |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/dashboard/stats` | ADMIN | Recharts aggregated metrics (enrollments, offices, scores) |
| `GET` | `/admin/audit-log` | ADMIN | Searchable, append-only security audit trail |
| `GET` | `/admin/audit-log/export`| ADMIN | Export audit log as CSV format |

---

## 15. System Health (`/api/v1/health`)

| Method | Endpoint | Access | Summary |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Liveness and readiness probe for container orchestrators |
