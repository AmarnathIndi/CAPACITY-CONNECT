# CAPACITY CONNECT — Administrator Governance Guide
**India Meteorological Department (IMD) / Ministry of Earth Sciences**
*Operational Procedures for System Administrators & Training Directors*

---

## 1. User Approval & Role Management

New registrations land in the **Pending Approval** queue (`/admin/approvals` or `GET /api/v1/users/pending`).

### Approving an Officer
1. Navigate to **Admin > Approvals** in the navigation bar.
2. Review the officer's email, name, location, and requested designation.
3. Select the assigned role:
   - **TRAINEE**: Operational staff taking courses and examinations.
   - **TRAINER**: Instructors authorized to author courses, upload shared library assets, generate AI test papers, and conduct live webinars.
   - **ADMIN**: Directorate personnel with governance, user clearance, and audit log access.
4. Set the assigned Regional Office (e.g. *Delhi HQ*, *Chennai RMC*, *Guwahati NEC*).
5. Click **Approve Officer**. An automated approval email and in-app clearance notification are dispatched.

### Rejecting an Officer
1. Click **Reject** next to an unverified registration.
2. Enter the mandatory administrative reason (e.g. *"Official @imd.gov.in domain non-compliance"*).
3. The account status is set to `REJECTED`, and the audit trail logs the rejection reason.

---

## 2. Bulk Staff Import (CSV / Excel)

To onboard batches of meteorological officers across regional centres:

1. Navigate to **Admin > Bulk User Upload** (`/admin/bulk-upload`).
2. Download the sample CSV template or prepare a file with the following headers:
   `Name, Email, Role, Office, Designation`
3. Drag and drop the CSV or Excel (`.xlsx`) file into the dropzone.
4. The system automatically executes a **pre-import dry-run validation**:
   - Validates email syntax and domain.
   - Checks database for pre-existing email collisions.
   - Verifies that roles map to `trainee`, `trainer`, or `admin`.
5. Review the validation preview table: rows with errors will be highlighted in red with explanatory tags.
6. Click **Confirm Import**. The system executes an atomic database transaction, creates user records with hashed passwords, and reports the count of successfully onboarded personnel.

---

## 3. Skill Graph & Natural Language Expert Finder

When an operational emergency (such as severe cyclonic storms or radar outage) occurs, locating specialized personnel is critical:

1. Open **Admin > Expert Finder** (`/admin/expert-finder`).
2. In the query box, enter natural language inquiries, for example:
   - *"Who knows Doppler radar?"*
   - *"Tropical cyclone forecasting specialist"*
   - *"AWS station telemetry calibration"*
3. The ranking algorithm evaluates:
   - Match between query keywords and registered skill taxonomy.
   - Skill proficiency tier (`Expert` > `Advanced` > `Intermediate`).
   - Verified competency badge status.
   - Past trainee feedback ratings.
4. Filter by **Language** (e.g., *Tamil*, *Hindi*, *English*) or **Region** (*South*, *North*, *North-East*).
5. Review contact phone numbers and email addresses to deploy staff immediately.

---

## 4. Trainer Matching & Training Session Scheduling

To plan masterclasses and interactive technical briefings:

1. Navigate to **Admin > Trainer Matching** (`/admin/trainer-matching`).
2. Enter the proposed training details:
   - **Topic**: e.g., *Doppler Weather Radar (DWR) Operational Principles*
   - **Date & Time**: Target session datetime
   - **Language**: English, Hindi, Regional
   - **Target Office**: e.g., *Chennai RMC*
3. Click **Find Matching Trainers**.
4. The system calculates an **explainable composite match score (0-99%)** evaluating:
   - 🎯 **Skill Match** (35%)
   - 🌐 **Language Compatibility** (20%)
   - ⭐ **Historical Trainee Rating** (20%)
   - 📅 **7-Day Calendar Availability** (20%)
   - ⚖️ **Workload Balance** (Deduction for trainers with >3 active weekly sessions)
5. Click **Send Invitation**. The session status is set to `INVITED`. Once the trainer accepts, it automatically updates the shared schedule.

---

## 5. Security & Compliance Audit Log

Under Government of India data governance standards, every write action must be auditable:

1. Navigate to **Admin > Audit Log** (`/admin/audit-log`).
2. Search and filter by:
   - **Action**: e.g. `POST /users/approve`, `POST /certificates/revoke`
   - **Entity Type**: `USER`, `COURSE`, `TEST`, `CERTIFICATE`
   - **Operator Email** or **Client IP Address**
3. Inspect the JSON payload capturing the before and after states.
4. To export compliance records for external statutory audits, click **Export Audit Trail (CSV)**.
5. *Note: The audit log is append-only; database permissions prohibit manual `UPDATE` or `DELETE` operations on the `AuditLog` table.*

---

## 6. Certificate Revocation & Expiry Reminders

1. If an officer's certification is compromised or invalidated, go to `/verify/:id`.
2. As an Administrator, click **Revoke Certificate**.
3. Input the official justification (e.g., *"Administrative re-examination failure"*).
4. The status immediately updates to `REVOKED`. The public `/verify/:id` endpoint will indicate `INVALID / REVOKED` to all external inspectors.
