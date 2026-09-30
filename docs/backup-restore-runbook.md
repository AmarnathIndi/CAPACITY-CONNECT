# CAPACITY CONNECT — Backup & Disaster Recovery Runbook
**Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)**
*Standard Operating Procedure (SOP): Backup Automation, Integrity Verification, and Disaster Recovery*

---

## 1. Backup Strategy Overview

| Tier | Target | Frequency | Retention | Script Reference |
| :--- | :--- | :--- | :--- | :--- |
| **Relational & Vector DB** | PostgreSQL 16 (Relational + pgvector embeddings) | Daily at 02:00 IST | 30 days | `scripts/backup.sh` |
| **Object Storage** | MinIO (PDFs, Videos, Certificates, Recordings) | Daily at 02:30 IST | 30 days | `scripts/backup.sh` |
| **Immutable Audit Logs** | `AuditLog` table export | Weekly CSV dump | 7 years (Statutory) | `GET /api/v1/admin/audit-log/export` |

All backups are:
1. Dumped via PostgreSQL custom format (`pg_dump -F c`).
2. Archived with MinIO file storage trees.
3. Encrypted with **AES-256-CBC** using OpenSSL PBKDF2 with 100,000 iterations.
4. Sealed with a computed **SHA256 integrity hash**.

---

## 2. Automated Nightly Cron Setup

On the host server, install the cron job under the `imd_admin` or `root` crontab:

```bash
# Edit crontab
crontab -e

# Append automated nightly backup at 02:00 AM IST
0 2 * * * /opt/capacity-connect/scripts/backup.sh >> /var/log/imd_backup.log 2>&1
```

### Environment Variables for Backup Execution
Add the following to `/etc/environment` or the runner profile:
```env
BACKUP_DIR=/var/backups/capacity-connect
BACKUP_SECRET=IMD_Government_Grade_Key_2026!
POSTGRES_USER=imd_admin
POSTGRES_PASSWORD=IMD_Secure_Pass_2026!
POSTGRES_DB=capacity_connect
POSTGRES_HOST=localhost
MINIO_DATA_DIR=/var/lib/docker/volumes/capacity_connect_miniodata/_data
```

---

## 3. Manual Backup Procedure

To trigger an on-demand snapshot prior to system updates or database migrations:

```bash
cd /opt/capacity-connect
chmod +x scripts/backup.sh
./scripts/backup.sh
```

**Expected Output:**
```
[Wed Sep 30 02:00:01 IST 2026] Starting CAPACITY CONNECT automated backup...
[Wed Sep 30 02:00:02 IST 2026] Dumping PostgreSQL database with pgvector embeddings...
[Wed Sep 30 02:00:15 IST 2026] Archiving MinIO object store...
[Wed Sep 30 02:00:28 IST 2026] Encrypting backup bundle with AES-256...
[Wed Sep 30 02:00:35 IST 2026] Backup completed successfully: /var/backups/capacity-connect/imd_full_backup_20260930_020001.tar.gz.enc
[Wed Sep 30 02:00:36 IST 2026] SHA256 Checksum: a9b4c5d... /var/backups/capacity-connect/imd_full_backup_20260930_020001.tar.gz.enc
```

---

## 4. Disaster Recovery & Restore Procedure

In the event of hardware failure, database corruption, or regional site migration:

### Step 1: Verify Archive Integrity
```bash
cd /var/backups/capacity-connect

# Verify cryptographic hash
sha256sum -c imd_full_backup_20260930_020001.tar.gz.enc.sha256
```
*If output displays `OK`, the file has not suffered data degradation or tampering.*

### Step 2: Stop Application Containers (Avoid concurrent writes)
```bash
cd /opt/capacity-connect
docker compose -f docker-compose.prod.yml stop backend frontend
```

### Step 3: Run the Restore Script
```bash
chmod +x scripts/restore.sh
./scripts/restore.sh /var/backups/capacity-connect/imd_full_backup_20260930_020001.tar.gz.enc
```

### Step 4: Verify Database Health & Resume Services
```bash
# Check database records
docker compose -f docker-compose.prod.yml exec postgres psql -U imd_admin -d capacity_connect -c "SELECT COUNT(*) FROM \"User\";"
docker compose -f docker-compose.prod.yml exec postgres psql -U imd_admin -d capacity_connect -c "SELECT COUNT(*) FROM \"Certificate\";"

# Start all containers
docker compose -f docker-compose.prod.yml start backend frontend

# Perform healthcheck query
curl -s http://localhost:4000/api/v1/health | jq .
```

---

## 5. Annual Disaster Recovery Drill Checklist
1. Restore database into a staging sandbox once every 6 months.
2. Verify that random certificates can be resolved via `/api/v1/verify/:id`.
3. Verify that vector embeddings remain searchable via pgvector cosine distance queries.
4. Record restoration drill timestamp, duration, and operator ID in the IMD Security Register.
