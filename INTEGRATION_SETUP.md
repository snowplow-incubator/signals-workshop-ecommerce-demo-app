# User Attributes Integration Setup

This guide explains how to set up the CloudFlare worker backend and integrate it with the React frontend for retrieving user attributes.

## Architecture Overview

```
Frontend (React) → CloudFlare Worker → Auth API → Attributes API
                      ↑
                   KV Storage (Token Cache)
```

## Quick Start

### 1. Deploy the CloudFlare Worker

```bash
cd worker
npm install
wrangler login
```

Create KV namespace for auth token caching:
```bash
npx wrangler kv namespace create "AUTH_CACHE"
npx wrangler kv namespace create "AUTH_CACHE" --preview
```

Update `worker/wrangler.toml` with the returned namespace IDs.

Set secrets:
```bash
npx wrangler secret put API_KEY
npx wrangler secret put API_KEY_ID
npx wrangler secret put ORG_ID
npx wrangler secret put SIGNALS_API_URL
```

Deploy:
```bash
npm run deploy
```

### 2. Configure the Frontend

Copy the environment template:
```bash
cd frontend
cp env.example .env.local
```

Update `.env.local` with your worker URL:
```
WORKER_URL=https://your-worker.your-subdomain.workers.dev
```

Start the frontend:
```bash
npm start
```

## Components Added

### Backend (CloudFlare Worker)

- **Auth Token Management**: Fetches and caches auth tokens for 1 hour
- **User Attributes Proxy**: Proxies requests to attributes API with authentication
- **CORS Support**: Handles cross-origin requests from frontend
- **Mock Implementations**: Ready-to-replace mock endpoints

**Key Files:**
- `worker/src/index.ts` - Main worker logic
- `worker/wrangler.toml` - Worker configuration
- `worker/package.json` - Dependencies and scripts

### Frontend (React)

- **User Attributes Service**: HTTP client for worker communication
- **React Hook**: `useUserAttributes` for state management
- **UI Component**: Sidebar panel for fetching and displaying attributes
- **Integration**: Added to main app with responsive design

**Key Files:**
- `frontend/src/services/userAttributes.ts` - HTTP client
- `frontend/src/hooks/useUserAttributes.ts` - React hook
- `frontend/src/components/UserAttributes.tsx` - UI component
- `frontend/src/App.tsx` - Updated layout
- `frontend/src/index.css` - Added styles

## API Endpoints

### Worker Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/user-attributes` | GET | Fetch user attributes |
| `/api/cache-status` | GET | Debug cache status |

### Example Usage

Fetch attributes for a specific user:
```
GET https://your-worker.workers.dev/api/user-attributes?userId=user123
```

Response:
```json
{
  "userId": "user123",
  "attributes": {
    "segment": "premium",
    "preferences": {
      "newsletter": true,
      "theme": "dark"
    },
    "behavior": {
      "lastLogin": "2024-01-01T10:30:00.000Z",
      "totalPurchases": 15
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Features

### Auth Token Caching
- Tokens cached for 1 hour in CloudFlare KV
- Automatic renewal with 5-minute buffer
- Error handling for auth failures

### User Attributes UI
- Input field for optional user ID
- Real-time loading states
- Error handling with dismissible messages
- Structured display of nested attributes
- Refresh functionality

### Responsive Design
- Desktop: Sidebar layout
- Mobile: Stacked layout
- Flexible grid system

## Development

### Local Development

Run worker locally:
```bash
cd worker
npm run dev
```

Update frontend to use local worker:
```bash
# In frontend/.env.local
WORKER_URL=http://localhost:8787
```

### Testing

Test worker endpoints:
```bash
curl http://localhost:8787/health
curl "http://localhost:8787/api/user-attributes?userId=test123"
curl http://localhost:8787/api/cache-status
```

### Full Snowplow API Integration

The worker now uses real Snowplow APIs for both authentication and user attributes:

- **Auth Token**: Integrated with Snowplow Console API (`https://console.snowplowanalytics.com/api/msc/v1/organizations/{ORG_ID}/credentials/v3/token`)
- **User Attributes**: Integrated with Snowplow Signals API (`{SIGNALS_API_URL}/api/v1/get-online-attributes`)

Required secrets:
- `API_KEY`: Your Snowplow API key
- `API_KEY_ID`: Your Snowplow API key ID  
- `ORG_ID`: Your Snowplow organization ID
- `SIGNALS_API_URL`: Your Snowplow Signals API URL (e.g., `https://xxxx.signals.snowplowanalytics.com`)

The Signals API returns attributes like:
- `count_product_views`: Number of product views
- `count_add_to_cart`: Number of add-to-cart events  
- `total_cart_value`: Total value of items added to cart
- Plus derived metrics like `engagement_score` and `average_cart_value`

## Security Considerations

- API keys stored as CloudFlare secrets (encrypted)
- CORS configured for frontend domain
- Auth tokens cached securely in KV storage
- Input validation on all endpoints

## Production Checklist

- [ ] Replace mock implementations with real API calls
- [ ] Configure proper CORS origins (remove wildcard)
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Test error scenarios
- [ ] Set up proper environment separation
- [ ] Configure custom domain for worker

## Troubleshooting

### Common Issues

1. **Worker not receiving requests**
   - Check CORS configuration
   - Verify worker URL in frontend environment

2. **Auth token errors**
   - Verify API_KEY and API_KEY_ID secrets
   - Check KV namespace configuration

3. **Frontend connection issues**
   - Check browser network tab for CORS errors
   - Verify environment variable is loaded

### Debug Commands

```bash
# Check worker logs
wrangler tail

# Test worker health
curl https://your-worker.workers.dev/health

# Check cache status
curl https://your-worker.workers.dev/api/cache-status
```
