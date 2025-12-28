export interface Gateway {
  id: string;
  name: string;
  slug: string;
  description: string;
  requestCount: number;
  tokens: number;
  cost: number;
  createdAt: string;
}

export interface LogEntry {
  id: string;
  gatewayId: string;
  responseId: string; // Chat completion ID from upstream provider
  timestamp: string;
  status: number;
  statusText: string;
  model: string;
  duration: number; // in ms
  tokensIn: number;
  tokensOut: number;
  cost: number;
  requestBody: any;
  responseBody: any;
  provider: string;
}

export type ViewState = 'dashboard' | 'gateway_detail';

export interface Breadcrumb {
  label: string;
  id?: string;
  onClick?: () => void;
}
