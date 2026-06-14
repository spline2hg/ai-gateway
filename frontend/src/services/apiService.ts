import { LogEntry } from '../types';
import { BACKEND_URL } from './config';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const authData = localStorage.getItem('ai_gateway_auth');
  if (!authData) {
    throw new Error('User not authenticated');
  }
  const user = JSON.parse(authData);
  return {
    'X-User-ID': user.id,
    'Content-Type': 'application/json',
  };
};

// Backend API response interfaces
interface BackendLogEntry {
  id: string;
  response_id: string;
  timestamp: string;
  gateway_id: string;
  model: string;
  provider: string | null;
  tokens_prompt: number;
  tokens_completion: number;
  tokens_total: number;
  request_type: string;
  status: boolean;
  cost: number;
  latency: number | null;
  queue_time: number | null;
  prompt_time: number | null;
  completion_time: number | null;
  error_message: string | null;
  prompt_text: string | null;
  response_text: string | null;
  http_status_code: number | null;
  endpoint: string | null;
}

interface BackendAnalyticsResponse {
  gateway_id: string;
  date_range: {
    start_date: string;
    end_date: string;
    days: number;
  };
  summary: {
    total_requests: number;
    tokens_in: number;
    tokens_out: number;
    total_tokens: number;
    total_cost: number;
    avg_latency: number;
    min_latency: number;
    max_latency: number;
    error_count: number;
    error_rate: number;
    success_rate: number;
    log_count: number;
  };
  model_breakdown: Record<string, {
    requests: number;
    tokens_in: number;
    tokens_out: number;
    total_tokens: number;
    cost: number;
    avg_latency: number;
  }>;
  daily_stats: Array<{
    date: string;
    requests: number;
    tokens_in: number;
    tokens_out: number;
    cost: number;
    errors: number;
    success_rate: number;
  }>;
  logs: BackendLogEntry[] | null;
}

// Convert backend log format to frontend LogEntry format
export const convertBackendLogToFrontend = (backendLog: BackendLogEntry): LogEntry => {
  // Safely parse prompt_text - it might be plain text or JSON
  let requestBody = null;
  if (backendLog.prompt_text) {
    try {
      requestBody = JSON.parse(backendLog.prompt_text);
    } catch (e) {
      // If it's not valid JSON, treat it as plain text
      requestBody = { text: backendLog.prompt_text };
    }
  }

  return {
    id: backendLog.id,
    gatewayId: backendLog.gateway_id, // Use gateway_id from backend
    responseId: backendLog.response_id, // Chat completion ID from upstream provider
    timestamp: backendLog.timestamp,
    status: backendLog.http_status_code || (backendLog.status ? 200 : 500),
    statusText: backendLog.status ? 'OK' : 'Error',
    model: backendLog.model,
    duration: backendLog.latency || 0, // Convert latency from seconds to ms if needed
    tokensIn: backendLog.tokens_prompt,
    tokensOut: backendLog.tokens_completion,
    cost: backendLog.cost,
    requestBody: requestBody,
    responseBody: backendLog.response_text ? { content: backendLog.response_text } : null,
    provider: backendLog.provider || backendLog.model.split(':')[0] || 'unknown' // Use actual provider field, fallback to model extraction
  };
};

// API service functions
export const analyticsApi = {
  async fetchGatewayAnalytics(gatewayId: string, days: number = 30, advanced: boolean = false): Promise<BackendAnalyticsResponse> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(
        `${BACKEND_URL}/analytics/${gatewayId}?days=${days}&advanced=${advanced}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching gateway analytics:', error);
      throw error;
    }
  },

  async fetchGatewayLogs(
    gatewayId: string,
    opts: { days?: number; page?: number; page_size?: number; model?: string; status?: string; search?: string } = {}
  ): Promise<{ logs: LogEntry[]; pagination: { total: number; page: number; page_size: number; total_pages: number }; available_models: string[] }> {
    try {
      const headers = getAuthHeaders();
      const params = new URLSearchParams();
      if (opts.days) params.set('days', String(opts.days));
      if (opts.page) params.set('page', String(opts.page));
      if (opts.page_size) params.set('page_size', String(opts.page_size));
      if (opts.model) params.set('model', opts.model);
      if (opts.status) params.set('status', opts.status);
      if (opts.search) params.set('search', opts.search);

      const response = await fetch(`${BACKEND_URL}/logs/${gatewayId}?${params.toString()}`, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        logs: (data.logs || []).map(convertBackendLogToFrontend),
        pagination: data.pagination,
        available_models: data.filters?.available_models || [],
      };
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  },

  async getGatewaySummary(gatewayId: string, days: number = 30) {
    try {
      const analyticsData = await this.fetchGatewayAnalytics(gatewayId, days, false);
      return analyticsData.summary;
    } catch (error) {
      console.error('Error fetching gateway summary:', error);
      throw error;
    }
  },

  // Fetch all gateways from the database
  async fetchAllGateways() {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${BACKEND_URL}/gateway/list`, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.gateways || [];
    } catch (error) {
      console.error('Error fetching gateways:', error);
      throw error;
    }
  },

  // Create a new gateway
  async createGateway(name: string) {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${BACKEND_URL}/gateway/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: data.gateway_id,
        name: name,
        secret: data.secret
      };
    } catch (error) {
      console.error('Error creating gateway:', error);
      throw error;
    }
  },

  // Get gateway credentials
  async getGatewayCredentials(gatewayId: string) {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${BACKEND_URL}/gateway/${gatewayId}/credentials`, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        gatewayId: data.gateway_id,
        name: data.name,
        secret: data.secret
      };
    } catch (error) {
      console.error('Error fetching gateway credentials:', error);
      throw error;
    }
  },

  // Regenerate gateway secret
  async regenerateGatewaySecret(gatewayId: string) {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${BACKEND_URL}/gateway/${gatewayId}/regenerate`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        gatewayId: data.gateway_id,
        name: data.name,
        secret: data.secret
      };
    } catch (error) {
      console.error('Error regenerating gateway secret:', error);
      throw error;
    }
  }
};