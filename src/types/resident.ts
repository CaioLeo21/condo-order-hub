
export interface Resident {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  unit: string;
  building?: string;
  isOwner: boolean;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  moveInDate: string;
  notes?: string;
  status: 'active' | 'inactive';
}
