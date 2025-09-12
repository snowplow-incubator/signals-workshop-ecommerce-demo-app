// User Attributes Service
// Handles communication with the CloudFlare worker for user attributes

export interface UserAttributesError {
  error: string;
  message?: string;
}

// Configuration for the worker endpoint
const WORKER_BASE_URL = process.env.REACT_APP_WORKER_URL || 'https://your-worker.your-subdomain.workers.dev';

class UserAttributesService {
  private baseUrl: string;

  constructor(baseUrl: string = WORKER_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch user attributes from the worker
   * @param userId Optional user ID to fetch attributes for
   * @returns Promise with user attributes or throws error
   */
  async getUserAttributes(userId?: string): Promise<Record<string, any>> {
    try {
      const url = new URL('/api/user-attributes', this.baseUrl);
      if (userId) {
        url.searchParams.set('userId', userId);
      }

      console.log(`Fetching user attributes from: ${url.toString()}`);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData: UserAttributesError = await response.json();
        throw new Error(`Failed to fetch user attributes: ${errorData.error || 'Unknown error'}`);
      }

      const data: Record<string, any> = await response.json();
      console.log('User attributes received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching user attributes:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch user attributes');
    }
  }

  /**
   * Check the health of the worker
   * @returns Promise with health status
   */
  async checkHealth(): Promise<{ status: string; timestamp: string; environment: string }> {
    try {
      const url = new URL('/health', this.baseUrl);
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking worker health:', error);
      throw error;
    }
  }

  /**
   * Get cache status from the worker (for debugging)
   * @returns Promise with cache status
   */
  async getCacheStatus(): Promise<{
    hasToken: boolean;
    tokenPreview: string | null;
    expiryTime: string | null;
    isValid: boolean;
  }> {
    try {
      const url = new URL('/api/cache-status', this.baseUrl);
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Cache status check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking cache status:', error);
      throw error;
    }
  }

  /**
   * Update the base URL for the worker
   * @param newBaseUrl New base URL for the worker
   */
  setBaseUrl(newBaseUrl: string): void {
    this.baseUrl = newBaseUrl;
  }

  /**
   * Get the current base URL
   * @returns Current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Export a singleton instance
export const userAttributesService = new UserAttributesService();

// Export the class for testing or multiple instances
export default UserAttributesService;
