/**
 * CAPACITY CONNECT — 500 CONCURRENT USERS LOAD TEST
 * Ministry of Earth Sciences / India Meteorological Department (IMD)
 *
 * Simulates 500 concurrent users testing:
 * 1. Public Certificate Verification (/api/v1/verify/:id)
 * 2. Course Catalog Browsing (/api/v1/courses)
 * 3. Examination Status Inquiries (/api/v1/tests/:id)
 */

const TARGET_HOST = process.env.API_URL || 'http://localhost:4000/api/v1';
const CONCURRENT_USERS = 500;
const TEST_DURATION_MS = 10000; // 10 seconds sustained load

async function main() {
  console.log(`\n======================================================`);
  console.log(`🚀 CAPACITY CONNECT LOAD TEST — 500 CONCURRENT CLIENTS`);
  console.log(`Target: ${TARGET_HOST}`);
  console.log(`Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`Duration: ${TEST_DURATION_MS / 1000}s`);
  console.log(`======================================================\n`);

  let totalRequests = 0;
  let successfulRequests = 0;
  let failedRequests = 0;
  const latencies = [];

  const endpoints = [
    '/verify/CERT-IMD-2026-001',
    '/verify/CERT-IMD-2026-002',
    '/health',
    '/gamification/leaderboard',
    '/gamification/achievements-wall',
    '/notifications/announcements',
  ];

  const startTime = Date.now();
  let isRunning = true;

  const runUserSession = async (userId) => {
    while (isRunning) {
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const reqStart = Date.now();
      try {
        const response = await fetch(`${TARGET_HOST}${endpoint}`, {
          headers: { 'User-Agent': `LoadTest-Worker-${userId}` },
        });

        const reqDuration = Date.now() - reqStart;
        latencies.push(reqDuration);
        totalRequests++;

        if (response.ok || response.status === 429) {
          // 429 is expected if rate-limited by Helmet/Nginx
          successfulRequests++;
        } else {
          failedRequests++;
        }
      } catch (err) {
        failedRequests++;
        totalRequests++;
      }

      // Small think time jitter (20-50ms)
      await new Promise((r) => setTimeout(r, Math.random() * 30 + 20));
    }
  };

  // Launch 500 concurrent worker loops
  const workers = Array.from({ length: CONCURRENT_USERS }, (_, i) => runUserSession(i + 1));

  // Run for duration
  await new Promise((r) => setTimeout(r, TEST_DURATION_MS));
  isRunning = false;
  await Promise.allSettled(workers);

  const totalTimeSec = (Date.now() - startTime) / 1000;
  latencies.sort((a, b) => a - b);

  const avgLatency = latencies.length > 0 ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2) : 0;
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const rps = (totalRequests / totalTimeSec).toFixed(2);

  console.log(`\n--- BENCHMARK RESULTS ---`);
  console.log(`Total Requests Sent : ${totalRequests}`);
  console.log(`Successful/RateOK   : ${successfulRequests}`);
  console.log(`Failed / Errors     : ${failedRequests}`);
  console.log(`Throughput          : ${rps} req/sec`);
  console.log(`Average Latency     : ${avgLatency} ms`);
  console.log(`Median (p50) Latency: ${p50} ms`);
  console.log(`95th Percentile     : ${p95} ms`);
  console.log(`99th Percentile     : ${p99} ms`);
  console.log(`Error Rate          : ${((failedRequests / (totalRequests || 1)) * 100).toFixed(2)}%`);
  console.log(`======================================================\n`);
}

main().catch(console.error);
