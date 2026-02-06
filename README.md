🚜 FarmLokal Backend – OAuth2 Client Credentials API

A production-ready Node.js backend demonstrating secure OAuth2 authentication, Redis-based token caching, and efficient external API communication — inspired by real-world backend challenges at FarmLokal.

This service implements the OAuth2 Client Credentials flow using Auth0, safely caches access tokens in Redis, and ensures high performance, reliability, and concurrency safety when interacting with protected external APIs.

✨ Key Highlights

🔐 OAuth2 Client Credentials Authentication

⚡ Redis-based token caching with TTL

♻️ Automatic token refresh before expiry

🧵 Concurrency-safe token fetching (no duplicate OAuth calls)

🩺 Health & debug endpoints

🚀 Deployment-ready (Render compatible)

🛠 Tech Stack

Node.js + Express

Auth0 (OAuth2 Authorization Server)

Redis (Token cache & locking)

Axios / node-fetch (HTTP client)

🧠 Architecture Overview

The backend exposes REST APIs consumed by clients (frontend or other services).

When a protected external API needs to be called:

The service retrieves an OAuth2 access token using the Client Credentials grant.

The token is:

Cached in Redis

Stored with a TTL slightly less than expires_in

All subsequent requests reuse the cached token.

When the token is near expiry:

A Redis lock ensures only one request fetches a new token

Other concurrent requests reuse the refreshed token

📌 This pattern is provider-agnostic and works with any OAuth2-compliant authorization server.

🚀 Getting Started
✅ Prerequisites

Node.js (LTS)

Redis (local or cloud)

Auth0 account with:

Machine-to-Machine (M2M) Application

API configured as the audience

📦 Clone & Install
git clone <your-repo-url>
cd <your-project-folder>
npm install

🔐 Environment Variables

Create a .env file in the project root:

PORT=4000
NODE_ENV=development

AUTH0_DOMAIN=dev-xxxxx.us.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://farmlokal-api

REDIS_URL=redis://localhost:6379
TOKEN_CACHE_KEY=oauth2:access_token
TOKEN_TTL_OFFSET=30


📌

TOKEN_TTL_OFFSET ensures token refresh before actual expiry

Never commit secrets — use environment variables only

▶️ Running the Server
Development
npm run dev

Production
npm start


Server runs at:

http://localhost:4000

🔑 OAuth2 Client Credentials Flow
Token Request
POST https://<AUTH0_DOMAIN>/oauth/token
Content-Type: application/json

{
  "client_id": "<AUTH0_CLIENT_ID>",
  "client_secret": "<AUTH0_CLIENT_SECRET>",
  "audience": "<AUTH0_AUDIENCE>",
  "grant_type": "client_credentials"
}

Token Response
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400,
  "token_type": "Bearer"
}

Token Handling Logic

Access token stored in Redis

TTL = expires_in - TOKEN_TTL_OFFSET

Token reused until near expiry

Redis lock prevents duplicate fetches under concurrency

⚡ Redis Token Caching Strategy

Check Redis for cached token

If token exists → return immediately

If missing/expired:

Acquire Redis lock

Fetch fresh token from Auth0

Update Redis + TTL

Concurrent requests reuse the cached token

✅ Result:

Reduced Auth0 load

Faster response times

Safe concurrency handling

🌐 API Endpoints
🩺 Health Check
GET /health


Response:

{ "status": "ok" }


Used for uptime checks & Render health monitoring.

🔍 Test Token (Debug Only)
GET /auth/test-token


Returns the currently cached access token.

{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}


⚠️ Disable or restrict this endpoint in production.

🔗 Example Protected Proxy
GET /api/external-data


Attaches token as:

Authorization: Bearer <token>


Proxies request to protected external API

Example response:

{
  "source": "external-api",
  "data": []
}

🧪 Local Testing Checklist
1️⃣ Verify Token Retrieval
curl http://localhost:4000/auth/test-token  Render: https://farmlokal-backend-a7qh.onrender.com/auth/test-token

2️⃣ Verify Redis Cache
redis-cli
GET oauth2:access_token
TTL oauth2:access_token

3️⃣ Verify External API Call
curl http://localhost:4000/api/external-data and rendeer https://farmlokal-backend-a7qh.onrender.com/api/external-data


curl https://farmlokal-backend-a7qh.onrender.com/health

📁 Project Structure
.
├── src
│   ├── index.js              # Express app entry
│   ├── routes                # API routes
│   ├── services
│   │   └── authService.js    # OAuth2 + Redis token logic
│   ├── config
│   │   └── redisClient.js    # Redis client setup
│   └── middleware
├── .env.example
├── package.json
└── README.md

🧠 Best Practices & Notes

🔒 Never commit secrets to Git

🧪 /auth/test-token is for debugging only

🔍 Use SCAN instead of KEYS in Redis at scale

🧩 Pattern easily extendable to:

Webhooks

Rate limiting

Circuit breakers
