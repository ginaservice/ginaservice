/**
 * GinaService k6 Load Test — API Gateway & GinaPay Fee Engine
 */
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 200 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(99)<150'],
    http_req_failed: ['rate<0.01'],
  },
}

const BASE_URL = __ENV.API_URL || 'http://localhost:3000'

export default function () {
  const healthRes = http.get(`${BASE_URL}/health`)
  check(healthRes, {
    'gateway status is 200': (r) => r.status === 200,
  })
  sleep(1)
}
