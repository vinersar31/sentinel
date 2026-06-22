export interface ServiceStatus {
  id: string;
  name: string;
  type: 'hardware' | 'container' | 'network' | string;
  status: 'UP' | 'DOWN';
  latencyMs: number;
  lastChecked: number; // timestamp
}
