// Narratives Service
// Handles communication with the CloudFlare worker for Signals narratives

import { tracker } from "../snowplow";

export interface NarrativeData {
  narrative?: string;
  intents?: string[];
  [key: string]: any;
}

const WORKER_BASE_URL =
  process.env.REACT_APP_WORKER_URL ||
  "https://your-worker.your-subdomain.workers.dev";
const DEFAULT_NARRATIVE_NAME = "ecom_shopping_behaviour";

class NarrativesService {
  private baseUrl: string;

  constructor(baseUrl: string = WORKER_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getNarrative(
    narrativeName: string = DEFAULT_NARRATIVE_NAME,
  ): Promise<NarrativeData | null> {
    const domainUserId = tracker?.getDomainUserId();
    if (!domainUserId) {
      return null;
    }

    const url = new URL("/narratives", this.baseUrl);
    url.searchParams.set("domain_userid", domainUserId);
    url.searchParams.set("narrative_name", narrativeName);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to fetch narrative: ${errorData.error || response.statusText}`,
      );
    }

    return await response.json();
  }
}

export const narrativesService = new NarrativesService();
export default NarrativesService;
