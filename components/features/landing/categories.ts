export interface CategoryBlock {
  name: string;
  items: string[];
  moreCount: number;
}

export const categories: CategoryBlock[] = [
  {
    name: 'Clients & Devices',
    items: ['User', 'Browser', 'Mobile App', 'Desktop App', 'IoT Device'],
    moreCount: 1,
  },
  {
    name: 'Compute & Servers',
    items: ['Web Server', 'API Gateway', 'Load Balancer', 'Lambda', 'Microservice'],
    moreCount: 5,
  },
  {
    name: 'Storage & Databases',
    items: ['SQL Database', 'NoSQL Database', 'Object Storage', 'Data Warehouse', 'Data Lake'],
    moreCount: 3,
  },
  {
    name: 'Caching',
    items: ['Cache', 'Redis', 'CDN', 'Browser Cache'],
    moreCount: 0,
  },
  {
    name: 'Messaging & Events',
    items: ['Message Queue', 'Pub/Sub', 'Event Bus', 'Webhook'],
    moreCount: 2,
  },
  {
    name: 'Networking & Infrastructure',
    items: ['Internet', 'DNS', 'Firewall', 'VPC', 'Region'],
    moreCount: 2,
  },
  {
    name: 'Security & Identity',
    items: ['Auth Service', 'WAF', 'Encryption', 'Secrets Manager', 'OAuth'],
    moreCount: 2,
  },
  {
    name: 'Monitoring & Observability',
    items: ['Logging', 'Metrics', 'Alerting', 'Tracing'],
    moreCount: 2,
  },
  {
    name: 'Data Processing',
    items: ['ETL Pipeline', 'Search Engine', 'Graph Database', 'Time-Series DB'],
    moreCount: 1,
  },
  {
    name: 'External Services',
    items: ['3rd Party API', 'Email', 'SMS', 'Payment Gateway'],
    moreCount: 3,
  },
  {
    name: 'Entity Relation',
    items: ['Table'],
    moreCount: 0,
  },
  {
    name: 'HTTP Helpers',
    items: ['GET', 'POST', 'PUT', 'DELETE', 'Status codes'],
    moreCount: 0,
  },
];
