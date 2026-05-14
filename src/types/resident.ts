
export interface Resident {
  id: string;
  name: string;
  phone: string;
  unit: string;
  building?: string;
  residentType: 'owner' | 'tenant' | 'other';
  residentTypeDescription?: string;
  notes?: string;
  status: 'active' | 'inactive';
}
