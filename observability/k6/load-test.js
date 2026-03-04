import http from "k6/http";
import { check, sleep, group } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || "Admin123!";

export const options = {
  scenarios: {
    api_load_test: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 20 }, // ramp up
        { duration: "1m", target: 20 },  // steady load
        { duration: "30s", target: 0 },  // ramp down
      ],
      gracefulRampDown: "30s",
    },
  },

  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% < 500ms
    http_req_failed: ["rate<0.01"],   // error rate < 1%
    http_req_waiting: ["p(95)<400"],  // backend processing time
  },
};

export function setup() {
  console.log("🔐 Logging in as admin...");

  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  check(loginRes, {
    "login status 200": (r) => r.status === 200,
    "access token exists": (r) => r.json("accessToken") !== undefined,
  });

  const token = loginRes.json("accessToken");

  return {
    token: token,
  };
}

export default function (data) {
  const params = {
    headers: {
      Authorization: `Bearer ${data.token}`,
      "Content-Type": "application/json",
    },
  };

  group("Public Endpoints", () => {
    const health = http.get(`${BASE_URL}/health`);

    check(health, {
      "health status 200": (r) => r.status === 200,
    });

    const posts = http.get(`${BASE_URL}/posts`);

    check(posts, {
      "posts status 200": (r) => r.status === 200,
    });
  });

  sleep(1);

  group("Authenticated Endpoints", () => {
    const users = http.get(`${BASE_URL}/users`, params);

    check(users, {
      "users status 200": (r) => r.status === 200,
    });

    const me = http.get(`${BASE_URL}/auth/me`, params);

    check(me, {
      "me status 200": (r) => r.status === 200,
    });
  });

  sleep(1);
}