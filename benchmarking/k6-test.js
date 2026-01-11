import http from 'k6/http';
import { check, sleep } from 'k6';

// Benchmark Configurations
export const options = {
    stages: [
        { duration: '30s', target: 20 }, // Ramp up to 20 users
        { duration: '1m', target: 20 },  // Stay at 20 users
        { duration: '30s', target: 0 },  // Ramp down to 0
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must be below 500ms
    },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000'; // Default to Monolith

export default function () {
    // 1. Get Stocks (Read-heavy operation)
    const stocksRes = http.get(`${BASE_URL}/api/stocks`);
    check(stocksRes, {
        'stocks internal status is 200': (r) => r.status === 200,
    });

    // 2. Simulate user thinking time
    sleep(1);

    // 3. Optional: Add Auth & Trading flows here
    // (Requires dynamic user registration/login to avoid lockout/collision)
}
