🚜 FarmLokal Backend – OAuth2 + Redis + MySQL Products API

A production-ready Node.js backend that demonstrates secure OAuth2 Client Credentials with Auth0, Redis-based token caching, and real product APIs powered by a MySQL database deployed on Railway.

✨ Overview
This service implements the OAuth2 Client Credentials flow using Auth0, safely caches access tokens in Redis, and exposes REST endpoints for farm products stored in MySQL. It is fully deployable on Render (backend) with Redis (Render Key Value) and MySQL (Railway), closely mirroring real-world backend architecture.

🛠 Tech Stack
Node.js + Express

Auth0 (OAuth2 Authorization Server)

Redis via ioredis (token cache)

MySQL via mysql2/promise (Railway-hosted)

Axios / node-fetch for external HTTP calls

🧠 Architecture
Clients call this backend for:

Product data (MySQL).

External protected API data (via OAuth2 token).

For protected external calls:

Backend uses OAuth2 Client Credentials grant with Auth0.

Access token is cached in Redis with TTL slightly less than expires_in.

Redis lock ensures only one instance refreshes the token when expired.

Products data:

Stored in a products table in a MySQL database on Railway.

Accessed using a connection pool (mysql2/promise) for efficiency.

🚀 Getting Started
✅ Prerequisites
Node.js (LTS)

Redis (local or Render Key Value)

MySQL:

Local (for dev)

Railway MySQL instance (for production)

Auth0 account with:

Machine-to-Machine application

API configured as audience
​

📦 Clone & Install
bash
git clone https://github.com/fahadmurad1/farmlokal-backend.git
cd farmlokal-backend
npm install
🔐 Environment Variables
Create .env in the project root for local development:

text
PORT=4000
NODE_ENV=development

# MySQL (local)
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your-local-password
MYSQL_DATABASE=farmlokal

# Redis (local)
REDIS_URL=redis://localhost:6379
TOKEN_CACHE_KEY=oauth2:access_token
TOKEN_TTL_OFFSET=30

# OAuth/Auth0
OAUTH_TOKEN_URL=https://dev-og2up7sau024sfke.us.auth0.com/oauth/token
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_AUDIENCE=https://farmlokal-api
Render (backend) – set these in the Render dashboard (no .env committed):

text
# Server
PORT=4000

# Redis (Render Key Value internal URL)
REDIS_URL=redis://red-...:6379

# MySQL (Railway Public URL: mysql://root:PASSWORD@HOST:PORT/railway)
MYSQL_HOST=switchyard.proxy.rlwy.net
MYSQL_USER=root
MYSQL_PASSWORD=<Railway root password>
MYSQL_DATABASE=railway

# OAuth/Auth0
OAUTH_TOKEN_URL=https://dev-og2up7sau024sfke.us.auth0.com/oauth/token
OAUTH_CLIENT_ID=<your client id>
OAUTH_CLIENT_SECRET=<your client secret>
OAUTH_AUDIENCE=https://farmlokal-api
📌 Security:

Never commit .env or secrets to Git.

Use Render/Railway environment variable panels for all secrets.

▶️ Running the Server
Development:

bash
npm run dev
Production:

bash
npm start
Local: http://localhost:4000
Render: https://farmlokal-backend-a7qh.onrender.com/ (example URL).
​

🔑 OAuth2 Client Credentials Flow
Token Request:

text
POST https://<AUTH0_DOMAIN>/oauth/token
Content-Type: application/json

{
  "client_id": "<OAUTH_CLIENT_ID>",
  "client_secret": "<OAUTH_CLIENT_SECRET>",
  "audience": "<OAUTH_AUDIENCE>",
  "grant_type": "client_credentials"
}
Token Response:

json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400,
  "token_type": "Bearer"
}
Token Lifecycle:

Store access_token in Redis under TOKEN_CACHE_KEY.

Set TTL to expires_in - TOKEN_TTL_OFFSET.

Reuse token until near expiry; then acquire a Redis lock, fetch a new token, and update Redis so all workers share the same token.

🌐 API Endpoints
1. Health Check
text
GET /health
Response:

json
{
  "status": "ok"
}
Used by Render health checks and simple uptime monitoring.

2. OAuth Token Debug (Dev Only)
text
GET /auth/test-token
Returns the access token currently in use (from Redis or freshly fetched).

json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
⚠️ Restrict or remove this in real production.

3. Products API (MySQL – Railway)
These endpoints serve farm products from the products table in MySQL:

a) Get all products
text
GET /products
Executes:

sql
SELECT * FROM products;
Example response:

json
[
  {
    "id": 1,
    "name": "Farm Fresh Tomato",
    "price": 20,
    "category": "vegetable"
  },
  {
    "id": 2,
    "name": "Organic Potato",
    "price": 15,
    "category": "vegetable"
  }
]
b) Get product by ID
text
GET /products/:id
Executes:

sql
SELECT * FROM products WHERE id = ?;
Example response:

json
{
  "id": 1,
  "name": "Farm Fresh Tomato",
  "price": 20,
  "category": "vegetable"
}
These endpoints show how the backend integrates a real MySQL database while still leveraging OAuth2 and Redis for external calls.

4. Example Protected Proxy Endpoint
text
GET /api/external-data
Adds the cached access token:

text
Authorization: Bearer <access_token>
Forwards the request to a protected external API and returns normalized data:

json
{
  "source": "external-api",
  "data": []
}
🧪 Testing
Local
bash
# Token
curl http://localhost:4000/auth/test-token

# Health
curl http://localhost:4000/health

# Products (MySQL local)
curl http://localhost:4000/products
Redis check:

bash
redis-cli
GET oauth2:access_token
TTL oauth2:access_token
You should see a token string and a positive TTL value.

Deployed (Render + Railway)
bash
# Health
curl https://farmlokal-backend-a7qh.onrender.com/health

# Token
curl https://farmlokal-backend-a7qh.onrender.com/auth/test-token

# Products (Railway MySQL)
curl https://farmlokal-backend-a7qh.onrender.com/products


📁 Project Structure
text
.
├── src
│   ├── app.js              # Express app entry
│   ├── routes
│   │   ├── products.js     # Products API (MySQL)
│   │   └── auth.js         # Auth/token endpoints
│   ├── services
│   │   └── authService.js  # OAuth2 + Redis token logic
│   ├── config
│   │   ├── env.js          # Environment variables
│   │   ├── db.js           # MySQL pool (mysql2/promise)
│   │   └── redis.js        # Redis client (ioredis)
│   └── integrations
│       └── webhook.js      # Example external webhook handler (optional)
├── scripts
│   └── seedProducts.js     # Seed script for local DB
├── .env.example
├── package.json
└── README.md
(Adjust file names to match your repo.)

🧠 Best Practices
🔒 Keep secrets out of Git; use .env locally and environment variables in Render/Railway.

🔍 For large Redis datasets, inspect keys using SCAN instead of KEYS.
​

🧪 Add simple DB tests (e.g. SELECT 1 on startup) to fail fast if MySQL credentials are wrong.

♻️ The OAuth2 + Redis pattern can be reused for webhooks, rate limiting, and other infrastructure concerns.
