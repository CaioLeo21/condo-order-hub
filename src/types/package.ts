export interface Package {
  id: string;
  recipientName: string;
  recipientUnit: string;
  senderCompany: string;
  trackingCode?: string;
  receivedDate: string;
  receivedTime: string;
  status: 'received' | 'collected';
  description?: string;
  size: 'small' | 'medium' | 'large';
  receivedBy: string;
  collectedDate?: string;
  collectedTime?: string;
}

export interface DashboardStats {
  total: number;
  received: number;
  collected: number;
}
