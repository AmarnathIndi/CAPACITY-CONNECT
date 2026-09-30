# CAPACITY CONNECT — Government Server Deployment Guide
**Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)**
*National Air-Gapped High-Availability On-Premise Deployment Architecture*

---

## 1. Hardware Sizing & Capacity Planning

To adhere to national data residency mandates, **no external cloud APIs** (OpenAI, AWS, Google, SaaS auth) are used. All speech-to-text transcription, dense vector embeddings, and LLM inference execute on internal government hardware.

### Recommended Server Configurations

| Component | Minimum Specification (Pilot / Staging) | Recommended Production Specification |
| :--- | :--- | :--- |
| **Target Workload** | Up to 1,000 active officers | 10,000+ staff across HQ, RMCs, and MCs |
| **CPU Architecture** | 16 Cores (AMD EPYC or Intel Xeon Gold) | 32 to 64 Cores (Dual Intel Xeon / AMD EPYC) |
| **System RAM** | 64 GB ECC DDR4/DDR5 | 128 GB to 256 GB ECC DDR5 |
| **Dedicated GPU** | 1x NVIDIA RTX 4090 (24GB VRAM) or A4000 (16GB) | 2x NVIDIA A100 (40GB/80GB) or 2x L40S (48GB) |
| **Storage (OS/App)** | 500 GB NVMe SSD (RAID-1 mirror) | 1 TB NVMe SSD (RAID-1 mirror) |
| **Storage (MinIO S3)** | 2 TB Enterprise SAS / NVMe (RAID-10) | 10 TB+ Ceph / PureStorage / SAN Storage |
| **Network Interface** | 2x 1 Gbps NIC (Bonded / LACP) | 2x 10 Gbps SFP+ NIC (Redundant NIC teaming) |

### AI Model Resource Allocation
- **Faster-Whisper (`large-v3` / `medium`)**:
  - GPU Mode: ~4.5 GB VRAM (`float16` quantization). Transcribes a 1-hour bilingual Hindi/English lecture in ~2.5 minutes.
  - CPU Fallback: 8 threads with `int8` quantization (~6 GB RAM). Transcribes in ~18 minutes.
- **Ollama / vLLM (`qwen2.5:7b` / `llama3.1:8b`)**:
  - GPU Mode: ~6.5 GB VRAM (`q4_k_m` 4-bit quantization). Generates 45–60 tokens/second.
  - Context Window: 8,192 tokens for dense RAG document context.
- **Embedding Model (`bge-m3` or `multilingual-e5`)**:
  - Memory: ~2.2 GB VRAM / RAM. Embeds 1,024-dimensional multilingual chunks in <25ms.

---

## 2. Network Architecture & Firewall Rules

```
[National Internet / NIC Net]
              │
       [State Firewall]
              │ Port 443 (HTTPS)
              ▼
   [Nginx Reverse Proxy / Load Balancer]
              │
      ┌───────┴───────┐
      ▼               ▼
[Frontend UI]    [NestJS API Engine] (Port 4000)
(Port 80/3000)        │
       ┌──────────────┼──────────────┬──────────────┐
       ▼              ▼              ▼              ▼
[Postgres 16]    [Redis 7]      [MinIO S3]     [Ollama / Whisper]
 (Port 5432)    (Port 6379)    (Port 9000)       (Port 11434 / 8008)
```

### Inbound / Internal Port Access Table
| Port | Protocol | Source | Destination | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **443** | TCP | Public / NIC Gateway | Nginx Proxy | Production HTTPS Client Access |
| **80** | TCP | Public / NIC Gateway | Nginx Proxy | HTTP to HTTPS redirect / ACME challenges |
| **4000** | TCP | Nginx Proxy | Backend API | Internal REST API communication |
| **5432** | TCP | Backend API, Seed | PostgreSQL 16 | Relational database & pgvector queries |
| **6379** | TCP | Backend API, Workers | Redis 7 | Job queues & rate-limiting cache |
| **9000** | TCP | Backend API, Nginx | MinIO S3 | S3 Object storage API |
| **9001** | TCP | Internal Admin VPN | MinIO Console | Object storage administrative web UI |
| **11434** | TCP | Backend API, Workers | Ollama | Local LLM and embedding inference |
| **8008** | TCP | Backend API, Workers | Faster-Whisper | Offline speech recognition microservice |

---

## 3. Step-by-Step On-Premise Installation

### Step 1: Operating System Preparation
Recommended OS: **Rocky Linux 9 / RHEL 9 / Ubuntu 22.04 LTS Server**

```bash
# Update repositories and install foundational packages
sudo apt-get update && sudo apt-get install -y \
    curl wget git jq openssl ufw fail2ban \
    ca-certificates gnupg lsb-release

# Install Docker Engine & Docker Compose Plugin
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl enable --now docker
```

### Step 2: Clone & Configure Environment
```bash
# Clone the repository onto the server
git clone https://github.com/imd-moes/capacity-connect.git /opt/capacity-connect
cd /opt/capacity-connect

# Copy and edit production environment variables
cp .env.example .env
nano .env
```

Ensure the following variables are securely generated using `openssl rand -hex 32`:
- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `MINIO_ROOT_PASSWORD`
- `OFFLINE_TEST_SECRET`

### Step 3: Launch Docker Compose Production Stack
```bash
# Start all containers in detached mode
docker compose -f docker-compose.prod.yml up -d --build

# Verify container health
docker compose -f docker-compose.prod.yml ps
```

### Step 4: Database Migrations & Initial Seed Data
```bash
# Execute Prisma migration in backend container
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Seed initial IMD officers, courses, tests, and skills
docker compose -f docker-compose.prod.yml exec backend npm run seed
```

### Step 5: Pull Ollama Local AI Models
```bash
# Download bilingual LLM and embedding model (inside the air-gapped network or via offline container bundle)
docker compose -f docker-compose.prod.yml exec ollama ollama pull qwen2.5:7b
docker compose -f docker-compose.prod.yml exec ollama ollama pull bge-m3
```

---

## 4. Security Hardening Checklist

- [x] **Database Isolation**: PostgreSQL port `5432` is not bound to public `0.0.0.0`; accessible only via internal container network.
- [x] **Least Privilege**: Application runs as unprivileged user inside Docker containers.
- [x] **Rate Limiting**: Nginx limits general traffic to 30 req/sec and authentication attempts to 5 req/sec with IP burst buffering.
- [x] **TLS 1.3 Encryption**: Strict ciphers with ECDHE and HSTS (`max-age=31536000; includeSubDomains; preload`).
- [x] **Audit Trail Immutability**: All write actions to users, courses, tests, and certificates are logged via NestJS interceptor with no deletion permission.
- [x] **PII Protection**: Passwords hashed with Argon2id; JWT tokens stored in `httpOnly` secure cookies.
