// Dados de exemplo enquanto não há API. As datas são relativas a "agora" para a
// lista sempre mostrar encomendas de hoje, de ontem e mais antigas.
// Todas as senhas de exemplo são 123456.
import { format, subMonths } from 'date-fns';
import type { Condominium } from '@/types/condominium';
import type { StoredUser } from '@/types/user';
import type { Unit } from '@/types/unit';
import type { Resident, ResidentUnit } from '@/types/resident';
import type { Package } from '@/types/package';
import type { Invoice, Plan } from '@/types/billing';

export interface MockDb {
  version: number;
  condominiums: Condominium[];
  users: StoredUser[];
  units: Unit[];
  residents: Resident[];
  residentUnits: ResidentUnit[];
  packages: Package[];
  plans: Plan[];
  invoices: Invoice[];
}

/** Aumente quando o formato dos dados de exemplo mudar: descarta o que estiver salvo no navegador. */
export const MOCK_DB_VERSION = 2;

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function daysAgoAt(days: number, hours: number, minutes: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export function createMockDb(): MockDb {
  const created = daysAgoAt(120, 9, 0);
  const stamp = { createdAt: created, updatedAt: created };

  const condominiums: Condominium[] = [
    { id: '1', name: 'Residencial Vista Verde', type: 'apartment', slug: 'residencial-vista-verde', status: 'active', address: 'Rua das Flores, 123 - São Paulo/SP', ...stamp },
    { id: '2', name: 'Condomínio Solar do Bosque', type: 'house', slug: 'solar-do-bosque', status: 'active', address: 'Av. Principal, 456 - Rio de Janeiro/RJ', ...stamp },
    { id: '3', name: 'Edifício Torre Azul', type: 'apartment', slug: 'torre-azul', status: 'active', address: 'Rua Central, 789 - Belo Horizonte/MG', ...stamp },
  ];

  const user = (u: Omit<StoredUser, 'password' | 'mustChangePassword' | 'status' | 'createdAt' | 'updatedAt'>): StoredUser => ({
    ...u,
    password: '123456',
    mustChangePassword: false,
    status: 'active',
    ...stamp,
  });

  const users: StoredUser[] = [
    user({ matricula: '1001', name: 'João Silva', profile: 'admin', condominiumId: '1' }),
    user({ matricula: '1002', name: 'Maria Santos', profile: 'doorman', shift: 'afternoon', condominiumId: '1' }),
    user({ matricula: '1003', name: 'Pedro Santos', profile: 'doorman', shift: 'night', condominiumId: '1' }),
    user({ matricula: '1004', name: 'Carlos Menezes', profile: 'doorman', shift: 'morning', condominiumId: '1' }),
    user({ matricula: '1005', name: 'Roberto Lima', profile: 'manager', condominiumId: '1' }),
    user({ matricula: '2001', name: 'Carlos Oliveira', profile: 'admin', condominiumId: '2' }),
    user({ matricula: '2002', name: 'Ricardo Alves', profile: 'doorman', shift: 'morning', condominiumId: '2' }),
    user({ matricula: '3001', name: 'Ana Costa', profile: 'admin', condominiumId: '3' }),
    user({ matricula: '9001', name: 'Equipe iPackage', profile: 'owner', condominiumId: null }),
  ];

  const apt = (id: string, condominiumId: string, block: string, apartment: string): Unit => ({ id, condominiumId, kind: 'apartment', block, apartment, ...stamp });
  const house = (id: string, condominiumId: string, lot: string, houseNumber: string, street?: string): Unit => ({ id, condominiumId, kind: 'house', lot, house: houseNumber, street, ...stamp });

  const units: Unit[] = [
    apt('1', '1', 'A', '101'),
    apt('2', '1', 'A', '303'),
    apt('3', '1', 'B', '204'),
    apt('4', '1', 'C', '402'),
    apt('5', '1', 'C', '101'),
    apt('6', '1', 'D', '12'),
    house('7', '2', '3', '12', 'Rua dos Ipês'),
    house('8', '2', '1', '5', 'Rua das Acácias'),
    apt('9', '3', 'Único', '801'),
  ];

  const resident = (id: string, condominiumId: string, name: string, phone: string, residentType: Resident['residentType'], residentTypeDescription?: string): Resident => ({
    id, condominiumId, name, phone, residentType, residentTypeDescription, status: 'active', ...stamp,
  });

  const residents: Resident[] = [
    resident('1', '1', 'Lúcia Andrade', '(11) 98888-1010', 'tenant'),
    resident('2', '1', 'Patrícia Gomes', '(11) 97777-3030', 'owner'),
    resident('3', '1', 'Mariana Souza', '(11) 99999-2040', 'owner'),
    resident('4', '1', 'Rafael Souza', '(11) 99999-2041', 'owner'),
    resident('5', '1', 'Thiago Lima', '(11) 96666-4020', 'tenant'),
    resident('6', '1', 'Bruna Lima', '(11) 96666-4021', 'other', 'Familiar'),
    resident('7', '1', 'Sônia Prado', '(11) 95555-1011', 'owner'),
    resident('8', '1', 'Eduardo Rocha', '(11) 94444-0012', 'tenant'),
    resident('9', '2', 'João Pereira', '(21) 98888-0312', 'owner'),
    resident('10', '2', 'Ana Pereira', '(21) 98888-0313', 'owner'),
    resident('11', '2', 'Felipe Nunes', '(21) 97777-0105', 'tenant'),
    resident('12', '3', 'Helena Duarte', '(31) 98765-8010', 'owner'),
  ];

  // Sônia Prado é dona de dois apartamentos (Morador_Casa N:N).
  const links: [string, string][] = [
    ['1', '1'], ['2', '2'], ['3', '3'], ['4', '3'], ['5', '4'], ['6', '4'], ['7', '5'], ['7', '2'], ['8', '6'],
    ['9', '7'], ['10', '7'], ['11', '8'], ['12', '9'],
  ];
  const residentUnits: ResidentUnit[] = links.map(([residentId, unitId], i) => ({ id: String(i + 1), residentId, unitId }));
  const link = (residentId: string, unitId: string) => residentUnits.find((ru) => ru.residentId === residentId && ru.unitId === unitId)!.id;

  const pkg = (p: Omit<Package, 'createdAt' | 'updatedAt'>): Package => ({ ...p, createdAt: p.receivedAt, updatedAt: p.collectedAt ?? p.receivedAt });

  const packages: Package[] = [
    pkg({ id: '297', condominiumId: '1', residentUnitId: link('1', '1'), senderCompany: 'Amazon', trackingCode: 'AMZ987654321', kind: 'box', size: 'large', receivedAt: daysAgoAt(3, 16, 40), receivedBy: '1003' }),
    pkg({ id: '305', condominiumId: '1', residentUnitId: link('5', '4'), senderCompany: 'Banco do Brasil', kind: 'envelope', size: 'small', receivedAt: daysAgoAt(1, 10, 15), receivedBy: '1004' }),
    pkg({ id: '311', condominiumId: '1', residentUnitId: link('4', '3'), senderCompany: 'Shopee', trackingCode: 'BR2345678901X', kind: 'bag', size: 'medium', receivedAt: daysAgoAt(1, 18, 2), receivedBy: '1003' }),
    pkg({ id: '316', condominiumId: '1', residentUnitId: link('2', '2'), senderCompany: 'Magazine Luiza', kind: 'box', size: 'small', receivedAt: minutesAgo(190), receivedBy: '1004' }),
    pkg({ id: '318', condominiumId: '1', residentUnitId: link('3', '3'), senderCompany: 'Mercado Livre', trackingCode: 'ML123456789', kind: 'box', size: 'medium', receivedAt: minutesAgo(48), receivedBy: '1002' }),
    pkg({ id: '319', condominiumId: '1', residentUnitId: link('8', '6'), senderCompany: 'Leroy Merlin', kind: 'other', size: 'large', notes: 'Duas caixas amarradas', receivedAt: minutesAgo(12), receivedBy: '1002' }),
    pkg({ id: '290', condominiumId: '1', residentUnitId: link('7', '5'), senderCompany: 'Correios', kind: 'box', size: 'medium', receivedAt: daysAgoAt(1, 11, 30), receivedBy: '1004', collectedAt: minutesAgo(300), collectedBy: 'Sônia Prado', deliveredBy: '1004' }),
    pkg({ id: '302', condominiumId: '1', residentUnitId: link('6', '4'), senderCompany: 'Detran', kind: 'envelope', size: 'small', receivedAt: daysAgoAt(2, 14, 10), receivedBy: '1002', collectedAt: daysAgoAt(1, 19, 47), collectedBy: 'Thiago Lima', deliveredBy: '1003' }),
    pkg({ id: '280', condominiumId: '1', residentUnitId: link('7', '2'), senderCompany: 'Natura', kind: 'box', size: 'small', receivedAt: daysAgoAt(12, 9, 40), receivedBy: '1004', collectedAt: daysAgoAt(11, 18, 5), collectedBy: 'Sônia Prado', deliveredBy: '1002' }),
    pkg({ id: '401', condominiumId: '2', residentUnitId: link('9', '7'), senderCompany: 'Correios', kind: 'envelope', size: 'small', receivedAt: minutesAgo(95), receivedBy: '2002' }),
    pkg({ id: '402', condominiumId: '2', residentUnitId: link('11', '8'), senderCompany: 'Amazon', kind: 'box', size: 'medium', receivedAt: daysAgoAt(1, 9, 5), receivedBy: '2002', collectedAt: daysAgoAt(1, 18, 30), collectedBy: 'Felipe Nunes', deliveredBy: '2002' }),
  ];

  // Planos e cobranças de exemplo (valores fictícios).
  const plans: Plan[] = [
    { id: '1', description: 'Essencial', unitLimit: 50, price: 149.9, validFrom: '2026-01-01' },
    { id: '2', description: 'Condomínio', unitLimit: 150, price: 299.9, validFrom: '2026-01-01' },
    { id: '3', description: 'Grande', unitLimit: 400, price: 549.9, validFrom: '2026-01-01' },
    { id: '4', description: 'Lançamento (promocional)', unitLimit: 50, price: 99.9, validFrom: '2025-06-01', validUntil: '2025-12-31' },
  ];

  const competence = (monthsBack: number) => format(subMonths(new Date(), monthsBack), 'yyyy-MM');
  const paidOn = (monthsBack: number) => format(subMonths(new Date(), monthsBack - 1), 'yyyy-MM-08');
  const invoices: Invoice[] = [];
  let invoiceId = 1;
  for (const [condominiumId, planId] of [['1', '1'], ['2', '1'], ['3', '1']] as const) {
    const price = plans.find((p) => p.id === planId)!.price;
    for (const back of [2, 1]) {
      const paid = !(condominiumId === '3' && back === 1); // Torre Azul está com o mês passado em aberto.
      invoices.push({
        id: String(invoiceId++),
        condominiumId,
        planId,
        competence: competence(back),
        amountDue: price,
        ...(paid ? { amountPaid: price, paidAt: paidOn(back) } : {}),
      });
    }
  }

  return { version: MOCK_DB_VERSION, condominiums, users, units, residents, residentUnits, packages, plans, invoices };
}
