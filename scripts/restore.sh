#!/usr/bin/env bash
# ==============================================================================
# CAPACITY CONNECT — AIR-GAPPED DISASTER RECOVERY & RESTORE RUNBOOK
# Ministry of Earth Sciences / India Meteorological Department (IMD)
# ==============================================================================
set -euo pipefail

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 /path/to/imd_full_backup_YYYYMMDD_HHMMSS.tar.gz.enc"
    exit 1
fi

ENCRYPTED_ARCHIVE="$1"
BACKUP_SECRET="${BACKUP_SECRET:-IMD_Backup_GPG_Secret_2026!}"
RESTORE_TEMP_DIR=$(mktemp -d)

trap 'rm -rf "${RESTORE_TEMP_DIR}"' EXIT

echo "[$(date)] Verifying SHA256 checksum..."
if [ -f "${ENCRYPTED_ARCHIVE}.sha256" ]; then
    sha256sum -c "${ENCRYPTED_ARCHIVE}.sha256"
else
    echo "Warning: No .sha256 checksum file found. Proceeding with restore..."
fi

echo "[$(date)] Decrypting backup archive..."
openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 -pass "pass:${BACKUP_SECRET}" -in "${ENCRYPTED_ARCHIVE}" | \
  tar -xz -C "${RESTORE_TEMP_DIR}"

# Locate extracted dumps
DB_DUMP=$(find "${RESTORE_TEMP_DIR}" -name "*.dump" | head -n 1)
MINIO_TAR=$(find "${RESTORE_TEMP_DIR}" -name "*.tar.gz" | head -n 1)

echo "[$(date)] Restoring PostgreSQL database from: ${DB_DUMP}"
PGPASSWORD="${POSTGRES_PASSWORD:-IMD_Secure_Pass_2026!}" pg_restore \
  -h "${POSTGRES_HOST:-localhost}" \
  -U "${POSTGRES_USER:-imd_admin}" \
  -d "${POSTGRES_DB:-capacity_connect}" \
  --clean --if-exists -v "${DB_DUMP}"

echo "[$(date)] Restoring MinIO S3 object store from: ${MINIO_TAR}"
mkdir -p "${MINIO_DATA_DIR:-/var/lib/docker/volumes/capacity_connect_miniodata/_data}"
tar -xzf "${MINIO_TAR}" -C "${MINIO_DATA_DIR:-/var/lib/docker/volumes/capacity_connect_miniodata/_data}"

echo "[$(date)] CAPACITY CONNECT restore completed successfully."
