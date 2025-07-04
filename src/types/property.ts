
export interface Property {
  id: string;
  unit: string;
  building?: string;
  floor: number;
  type: 'apartment' | 'house' | 'commercial';
  bedrooms: number;
  bathrooms: number;
  area: number;
  owner: {
    name: string;
    cpf: string;
    email: string;
    phone: string;
  };
  tenant?: {
    name: string;
    cpf: string;
    email: string;
    phone: string;
  };
  monthlyFee: number;
  status: 'occupied' | 'vacant' | 'maintenance';
  notes?: string;
}
