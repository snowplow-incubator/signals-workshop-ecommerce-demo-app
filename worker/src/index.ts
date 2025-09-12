export interface Env {
  // Secrets
  API_KEY: string;
  API_KEY_ID: string;
  ORG_ID: string;
  SIGNALS_API_URL: string;

  // KV namespace for caching
  AUTH_CACHE: KVNamespace;

  // Environment variables
  ENVIRONMENT: string;
}

interface AuthResponse {
  accessToken: string;
}

// Cache key for auth token
const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_TOKEN_EXPIRY_KEY = 'auth_token_expiry';

// Fetch auth token from Snowplow API
async function fetchAuthToken(apiKey: string, apiKeyId: string, orgId: string): Promise<AuthResponse> {
  const accessTokenUrl = `https://console.snowplowanalytics.com/api/msc/v1/organizations/${orgId}/credentials/v3/token`;

  console.log(`Fetching auth token from Snowplow API for org: ${orgId}`);

  try {
    const response = await fetch(accessTokenUrl, {
      method: 'GET',
      headers: {
        'X-API-Key-Id': apiKeyId,
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Auth API error (${response.status}): ${errorText}`);
      throw new Error(`Failed to fetch auth token: ${response.status} ${response.statusText}`);
    }

    const data: AuthResponse = await response.json();
    console.log('Auth token fetched successfully');
    return data;
  } catch (error) {
    console.error('Error fetching auth token:', error);
    throw new Error(`Auth token request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Fetch user attributes from Snowplow Signals API
async function fetchUserAttributes(authToken: string, signalsApiUrl: string, userId: string): Promise<Record<string, any>> {
  const apiUrl = `${signalsApiUrl}/api/v1/get-online-attributes`;

  console.log(`Fetching user attributes from Signals API for user: ${userId}`);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        service: 'ecom_attributes',
        attribute_keys: {
          user_id: [userId]
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Signals API error (${response.status}): ${errorText}`);
      throw new Error(`Failed to fetch user attributes: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user attributes from Signals API:', error);
    throw new Error(`User attributes request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get cached auth token or fetch new one
async function getAuthToken(env: Env): Promise<string> {
  try {
    // Check if we have a cached token
    const cachedToken = await env.AUTH_CACHE.get(AUTH_TOKEN_KEY);
    const cachedExpiry = await env.AUTH_CACHE.get(AUTH_TOKEN_EXPIRY_KEY);

    if (cachedToken && cachedExpiry) {
      const expiryTime = parseInt(cachedExpiry);
      const now = Date.now();

      // If token is still valid (with 5-minute buffer)
      if (now < expiryTime - (5 * 60 * 1000)) {
        console.log('Using cached auth token');
        return cachedToken;
      }
    }

    console.log('Fetching new auth token');

    // Fetch new token
    const authResponse = await fetchAuthToken(env.API_KEY, env.API_KEY_ID, env.ORG_ID);

    // Calculate expiry time (default to 1 hour since Snowplow API doesn't return expires_in)
    const expiryTime = Date.now() + (3600 * 1000); // 1 hour

    // Cache the token and expiry
    await env.AUTH_CACHE.put(AUTH_TOKEN_KEY, authResponse.accessToken);
    await env.AUTH_CACHE.put(AUTH_TOKEN_EXPIRY_KEY, expiryTime.toString());

    return authResponse.accessToken;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw new Error('Failed to obtain auth token');
  }
}

// Handle CORS preflight requests
function handleCORS(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  return null;
}

// Add CORS headers to response
function addCORSHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Access-Control-Allow-Origin', '*');
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return newResponse;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight
    const corsResponse = handleCORS(request);
    if (corsResponse) {
      return corsResponse;
    }

    const url = new URL(request.url);

    try {
      // Health check endpoint
      if (url.pathname === '/health') {
        return addCORSHeaders(new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          environment: env.ENVIRONMENT
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      // User attributes endpoint
      if (url.pathname === '/api/user-attributes') {
        if (request.method !== 'GET') {
          return addCORSHeaders(new Response(JSON.stringify({
            error: 'Method not allowed'
          }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
          }));
        }

        // Validate secrets are available
        if (!env.API_KEY || !env.API_KEY_ID || !env.ORG_ID || !env.SIGNALS_API_URL) {
          return addCORSHeaders(new Response(JSON.stringify({
            error: 'API credentials not configured (missing API_KEY, API_KEY_ID, ORG_ID, or SIGNALS_API_URL)'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }));
        }

        // Get user ID from query params (optional)
        const userId = url.searchParams.get('userId');
        if (!userId) {
          return addCORSHeaders(new Response(JSON.stringify({
            error: 'User ID is required'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }));
        }

        // Get auth token (cached or fresh)
        const authToken = await getAuthToken(env);

        // Fetch user attributes using the auth token
        const userAttributes = await fetchUserAttributes(authToken, env.SIGNALS_API_URL, userId);

        return addCORSHeaders(new Response(JSON.stringify(userAttributes), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      // Cache status endpoint (for debugging)
      if (url.pathname === '/api/cache-status') {
        const cachedToken = await env.AUTH_CACHE.get(AUTH_TOKEN_KEY);
        const cachedExpiry = await env.AUTH_CACHE.get(AUTH_TOKEN_EXPIRY_KEY);

        return addCORSHeaders(new Response(JSON.stringify({
          hasToken: !!cachedToken,
          tokenPreview: cachedToken ? `${cachedToken.substr(0, 10)}...` : null,
          expiryTime: cachedExpiry ? new Date(parseInt(cachedExpiry)).toISOString() : null,
          isValid: cachedExpiry ? Date.now() < parseInt(cachedExpiry) : false
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      // Default 404 response
      return addCORSHeaders(new Response(JSON.stringify({
        error: 'Not found',
        availableEndpoints: [
          '/health',
          '/api/user-attributes',
          '/api/cache-status'
        ]
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }));

    } catch (error) {
      console.error('Worker error:', error);
      return addCORSHeaders(new Response(JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
  },
};
