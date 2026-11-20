import { differenceInCalendarDays, format, isToday, isYesterday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Unit, UnitKind } from '@/types/unit';

type UnitLike = Pick<Unit, 'kind' | 'block' | 'apartment' | 'lot' | 'house' | 'street'>;

/** Bloco (prédio) ou quadra (casas). */
export function unitGroup(unit: UnitLike): string | undefined {
  return unit.kind === 'house' ? unit.lot : unit.block;
}

/** Número do apartamento ou da casa. */
export function unitNumber(unit: UnitLike): string {
  return (unit.kind === 'house' ? unit.house : unit.apartment) ?? '';
}

/** "Bloco B · Apto 204" (prédio) ou "Quadra 3 · Casa 12" (casas). */
export function formatUnit(unit: UnitLike): string {
  const group = unitGroup(unit);
  const number = unitNumber(unit);
  if (unit.kind === 'house') {
    if (group) return `Quadra ${group} · Casa ${number}`;
    if (unit.street) return `${unit.street} · Casa ${number}`;
    return `Casa ${number}`;
  }
  return group ? `Bloco ${group} · Apto ${number}` : `Apto ${number}`;
}

/** Código curto que o porteiro digita: "B-204" ou "Q3-12". */
export function unitCode(unit: UnitLike): string {
  const group = unitGroup(unit);
  const number = unitNumber(unit);
  if (unit.kind === 'house') return group ? `Q${group}-${number}` : number;
  return group ? `${group}-${number}` : number;
}

/** Normaliza o que foi digitado ("bloco b apto 204", "B 204", "q3 casa 12") para comparar com unitCode. */
export function normalizeUnitQuery(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/\bQUADRA\b/g, 'Q')
    .replace(/\b(BLOCO|BL|APARTAMENTO|APTO|AP|CASA)\b/g, '')
    .replace(/[^A-Z0-9]/g, '');
}

/** Rótulos do agrupamento e do número conforme o tipo do condomínio. */
export function groupingLabel(kind: UnitKind): string {
  return kind === 'house' ? 'Quadra' : 'Bloco';
}
export function numberLabel(kind: UnitKind): string {
  return kind === 'house' ? 'Casa' : 'Apto';
}

/** "Hoje às 14:32", "Ontem às 09:10" ou "12/10 às 09:10". */
export function formatWhen(iso: string): string {
  const date = new Date(iso);
  const time = format(date, 'HH:mm');
  if (isToday(date)) return `Hoje às ${time}`;
  if (isYesterday(date)) return `Ontem às ${time}`;
  return `${format(date, 'dd/MM')} às ${time}`;
}

/** "15/10/2026" a partir de "2026-10-15". */
export function formatDate(ymd: string): string {
  return format(parseISO(ymd), 'dd/MM/yyyy');
}

/** "outubro/2026" a partir de "2026-10". */
export function formatCompetence(competence: string): string {
  return format(parseISO(`${competence}-01`), "MMMM'/'yyyy", { locale: ptBR });
}

/** Dias corridos desde a data (0 = hoje). */
export function daysSince(iso: string): number {
  return differenceInCalendarDays(new Date(), new Date(iso));
}

/** "2026-10-15" de hoje, no fuso local. */
export function todayYmd(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/** "#000318" a partir do id 318. */
export function formatPackageCode(id: string): string {
  return `#${id.padStart(6, '0')}`;
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
/** "R$ 1.234,56" */
export function formatBRL(value: number): string {
  return brl.format(value);
}

/** Máscara de dinheiro: o que foi digitado vira centavos. "12345" → 123.45 */
export function parseMoneyInput(value: string): number {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits) / 100 : 0;
}

/** Máscara de telefone: (11) 99999-9999 ou (11) 3333-4444. */
export function maskPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** "Residencial Vista Verde" → "residencial-vista-verde" */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 45);
}

/** Senha provisória de 8 caracteres, sem letras e números que se confundem (0/O, 1/l). */
export function generateTemporaryPassword(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const values = crypto.getRandomValues(new Uint32Array(8));
  return Array.from(values, (v) => alphabet[v % alphabet.length]).join('');
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
