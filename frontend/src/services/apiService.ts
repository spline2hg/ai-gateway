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
  // Fetch analytics data for a specific gateway
  async fetchGatewayAnalytics(gatewayId: string, days: number = 30, includeLogs: boolean = false): Promise<BackendAnalyticsResponse> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(
        `${BACKEND_URL}/analytics/${gatewayId}?days=${days}&include_logs=${includeLogs}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching gateway analytics:', error);
      throw error;
    }
  },

  // Fetch logs for a specific gateway (converts to frontend format)
  async fetchGatewayLogs(gatewayId: string, days: number = 30): Promise<LogEntry[]> {
    try {
      const analyticsData = await this.fetchGatewayAnalytics(gatewayId, days, true);

      if (!analyticsData.logs) {
        return [];
      }

      return analyticsData.logs.map(convertBackendLogToFrontend);
    } catch (error) {
      console.error('Error fetching gateway logs:', error);
      throw error;
    }
  },

  // Get summary analytics for a gateway
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