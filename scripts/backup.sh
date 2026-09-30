#!/usr/bin/env bash
# ==============================================================================
# CAPACITY CONNECT — AIR-GAPPED NIGHTLY BACKUP RUNBOOK
# Ministry of Earth Sciences / India Meteorological Department (IMD)
# ==============================================================================
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_BACKUP="${BACKUP_DIR}/imd_db_${TIMESTAMP}.dump"
MINIO_BACKUP="${BACKUP_DIR}/imd_minio_${TIMESTAMP}.tar.gz"
ENCRYPTED_ARCHIVE="${BACKUP_DIR}/imd_full_backup_${TIMESTAMP}.tar.gz.enc"
BACKUP_SECRET="${BACKUP_SECRET:-IMD_Backup_GPG_Secret_2026!}"

mkdir -p "${BACKUP_DIR}"
echo "[$(date)] Starting CAPACITY CONNECT automated backup..."

# 1. PostgreSQL Database Dump (Binary Custom Format)
echo "[$(date)] Dumping PostgreSQL database with pgvector embeddings..."
PGPASSWORD="${POSTGRES_PASSWORD:-IMD_Secure_Pass_2026!}" pg_dump \
  -h "${POSTGRES_HOST:-localhost}" \
  -U "${POSTGRES_USER:-imd_admin}" \
  -d "${POSTGRES_DB:-capacity_connect}" \
  -F c -b -v -f "${DB_BACKUP}"

# 2. MinIO S3 Object Storage Dump
echo "[$(date)] Archiving MinIO object store..."
tar -czf "${MINIO_BACKUP}" -C "${MINIO_DATA_DIR:-/var/lib/docker/volumes/capacity_connect_miniodata/_data}" .

# 3. Create Consolidate Tarball & Encrypt with OpenSSL (AES-256-CBC)
echo "[$(date)] Encrypting backup bundle with AES-256..."
tar -czf - "${DB_BACKUP}" "${MINIO_BACKUP}" | \
  openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 -pass "pass:${BACKUP_SECRET}" -out "${ENCRYPTED_ARCHIVE}"

# 4. Generate SHA256 Integrity Hash
sha256sum "${ENCRYPTED_ARCHIVE}" > "${ENCRYPTED_ARCHIVE}.sha256"

# 5. Clean up temporary unencrypted files
rm -f "${DB_BACKUP}" "${MINIO_BACKUP}"

# 6. Retention Policy: Retain daily backups for 30 days
find "${BACKUP_DIR}" -name "imd_full_backup_*.enc*" -mtime +30 -exec rm -f {} \;

echo "[$(date)] Backup completed successfully: ${ENCRYPTED_ARCHIVE}"
echo "[$(date)] SHA256 Checksum: $(cat "${ENCRYPTED_ARCHIVE}.sha256")"
