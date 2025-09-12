# Signals Workshop CloudFlare Worker

This CloudFlare Worker provides a proxy API for retrieving user attributes with auth token caching.

## Features

- **Auth Token Caching**: Automatically fetches and caches auth tokens for 1 hour
- **User Attributes API**: Proxies requests to user attributes endpoint with proper authentication
- **CORS Support**: Handles cross-origin requests from the frontend
- **Mock Implementations**: Includes mock responses for development and testing
- **Health Check**: Basic health monitoring endpoint

## Setup

### 1. Install Dependencies

```bash
cd worker
npm install
```

### 2. Configure Wrangler

Make sure you have the Wrangler CLI installed:

```bash
npm install -g wrangler
```

Login to CloudFlare:

```bash
wrangler login
```

### 3. Create KV Namespace

Create a KV namespace for auth token caching:

```bash
npx wrangler kv namespace create "AUTH_CACHE"
npx wrangler kv namespace create "AUTH_CACHE" --preview
```

Update the namespace IDs in `wrangler.toml` with the returned values.

### 4. Set Secrets

Set the required secrets:

```bash
npx wrangler secret put API_KEY
npx wrangler secret put API_KEY_ID
npx wrangler secret put ORG_ID
npx wrangler secret put SIGNALS_API_URL
```

When prompted, enter your actual values:
- **API_KEY**: Your Snowplow API key
- **API_KEY_ID**: Your Snowplow API key ID  
- **ORG_ID**: Your Snowplow organization ID
- **SIGNALS_API_URL**: Your Snowplow Signals API URL (e.g., `https://xxxx.signals.snowplowanalytics.com`)

### 5. Deploy

Deploy to CloudFlare:

```bash
npm run deploy
```

## Development

### Local Development

Run the worker locally:

```bash
npm run dev
```

This will start a local development server, typically at `http://localhost:8787`.

### Testing

Test the health endpoint:

```bash
curl http://localhost:8787/health
```

Test the user attributes endpoint:

```bash
curl http://localhost:8787/api/user-attributes
curl "http://localhost:8787/api/user-attributes?userId=test123"
```

Check cache status:

```bash
curl http://localhost:8787/api/cache-status
```

## API Endpoints

### GET /health

Returns the health status of the worker.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "development"
}
```

### GET /api/user-attributes

Retrieves user attributes. Automatically handles auth token fetching and caching.

**Query Parameters:**
- `userId` (optional): Specific user ID to fetch attributes for

**Response:**
```json
{
  "userId": "user_abc123",
  "attributes": {
    "preferences": {
      "newsletter": true,
      "notifications": false,
      "theme": "dark"
    },
    "behavior": {
      "lastLogin": "2024-01-01T10:30:00.000Z",
      "totalPurchases": 15,
      "averageOrderValue": 127.50
    },
    "demographics": {
      "ageGroup": "26-35",
      "location": "US"
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET /api/cache-status

Returns information about the auth token cache (for debugging).

**Response:**
```json
{
  "hasToken": true,
  "tokenPreview": "mock_token...",
  "expiryTime": "2024-01-01T13:00:00.000Z",
  "isValid": true
}
```

## Implementation Notes

### Auth Token Caching

- Tokens are cached in CloudFlare KV storage
- Cache duration is 1 hour (with 5-minute buffer for renewal)
- Failed auth requests will throw errors rather than using stale tokens

### Snowplow API Integration

The worker integrates with Snowplow APIs:

1. **Auth Token Endpoint**: Uses real Snowplow Console API (`https://console.snowplowanalytics.com/api/msc/v1/organizations/{ORG_ID}/credentials/v3/token`)
2. **User Attributes Endpoint**: Uses real Snowplow Signals API (`{SIGNALS_API_URL}/api/v1/get-online-attributes`)

The worker makes a POST request to the Signals API with the following structure:
```json
{
  "service": "ecom_attributes",
  "full_attribute_names": false,
  "attribute_keys": {
    "domain_userid": ["user-id-here"]
  }
}
```

And receives responses like:
```json
{
  "domain_userid": ["790786f6-f250-4cf0-8bca-5f1b52c4b97f"],
  "count_product_views": [5],
  "count_add_to_cart": [5],
  "total_cart_value": [2604.95]
}
```

### CORS Configuration

The worker is configured to accept requests from any origin (`*`). In production, you should restrict this to your frontend domain(s).

## Environment Variables

- `ENVIRONMENT`: Set to "development" or "production"

## Secrets

- `API_KEY`: Your Snowplow API key (set as secret)
- `API_KEY_ID`: Your Snowplow API key ID (set as secret)
- `ORG_ID`: Your Snowplow organization ID (set as secret)
- `SIGNALS_API_URL`: Your Snowplow Signals API URL (set as secret)

## Security Considerations

- API keys are stored as CloudFlare secrets (encrypted)
- Auth tokens are cached in KV storage (consider encryption for sensitive data)
- CORS policy should be restricted in production
- Consider rate limiting for production usage
