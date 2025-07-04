
export interface Doorman {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  shift: 'morning' | 'afternoon' | 'night';
  hireDate: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
  status: 'active' | 'inactive';
}
