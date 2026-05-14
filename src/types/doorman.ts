export interface Doorman {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  shift: 'morning' | 'afternoon' | 'night';
  status: 'active' | 'inactive';
}
