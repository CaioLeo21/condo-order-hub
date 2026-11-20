import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary: a ação da tela (uma por tela) · secondary: apoio · ghost: neutra · destructive: excluir/inativar */
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  /** sm = control-sm (36px) · md = control-md (44px, padrão) · lg = control-lg (52px) */
  size?: "sm" | "md" | "lg";
  /** Ocupa toda a largura do container. */
  block?: boolean;
  /** Ícone (Lucide, 20px) antes do texto. */
  icon?: React.ReactNode;
  children: React.ReactNode;
}
export declare function Button(props: ButtonProps): React.ReactElement;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Rótulo visível, em estilo label. */
  label?: string;
  /** Dica abaixo do campo. Some quando há erro. */
  hint?: string;
  /** Mensagem de erro que diz como resolver. */
  error?: string;
  /** Fonte mono para unidade, matrícula, código de rastreio. */
  mono?: boolean;
}
export declare function Input(props: InputProps): React.ReactElement;

export interface StatusBadgeProps {
  /** Status da encomenda. */
  status: "pendente" | "retirada";
  /** Substitui a palavra padrão (raro). */
  children?: React.ReactNode;
  className?: string;
}
export declare function StatusBadge(props: StatusBadgeProps): React.ReactElement;

export interface PackageCardProps {
  /** Unidade formatada: "Bloco B · Apto 204" ou "Quadra 3 · Casa 12". */
  unidade: string;
  /** Nome do morador destinatário. */
  morador: string;
  status: "pendente" | "retirada";
  tipo?: "Envelope" | "Caixa" | "Embalagem" | "Outros";
  tamanho?: "Pequeno" | "Médio" | "Grande";
  remetente?: string;
  /** Data relativa já formatada: "Hoje às 14:32". */
  chegadaEm?: string;
  /** Porteiro que registrou a chegada. */
  recebidoPor?: string;
  /** Quando foi retirada (status retirada). */
  retiradaEm?: string;
  /** Quem retirou (status retirada). */
  retiradoPor?: string;
  observacao?: string;
  /** Nº da encomenda ou código de rastreio, em mono. */
  codigo?: string;
  /** Mostra o botão "Registrar retirada" quando status = pendente. */
  onRegistrarRetirada?: () => void;
  className?: string;
}
export declare function PackageCard(props: PackageCardProps): React.ReactElement;

export interface AppBarProps {
  /** Nome do condomínio atual. */
  condominio?: string;
  /** Nome completo do usuário logado (gera as iniciais do avatar). */
  usuario?: string;
  perfil?: "Porteiro" | "Responsável" | "Administrador";
  turno?: "Matutino" | "Vespertino" | "Noturno";
  /** Ações extras à direita, antes do usuário. */
  children?: React.ReactNode;
  className?: string;
}
export declare function AppBar(props: AppBarProps): React.ReactElement;

export interface OptionGroupOption {
  value: string;
  label: string;
  /** Uma linha explicando a opção. */
  description?: string;
  /** Nome de um ícone de Icon. */
  icon?: IconName;
}
export interface OptionGroupProps {
  /** Identificador do grupo (usado no aria-labelledby). */
  name: string;
  label?: string;
  options: OptionGroupOption[];
  value?: string;
  onChange?: (value: string) => void;
  /** Número de colunas; sem ele as opções quebram linha. */
  columns?: number;
  error?: string;
  className?: string;
}
export declare function OptionGroup(props: OptionGroupProps): React.ReactElement;

export interface SignaturePadProps {
  /** Rótulo acima da área: "Assinatura de Mariana Souza". */
  label?: string;
  /** Altura da área em px (padrão 180). */
  height?: number;
  /** Chamado com true quando há traço, false ao limpar. */
  onChange?: (temAssinatura: boolean) => void;
  className?: string;
}
export declare function SignaturePad(props: SignaturePadProps): React.ReactElement;

export type IconName = "box" | "mail" | "ruler" | "clock" | "check" | "search" | "plus" | "camera" | "pen" | "building" | "user" | "arrowLeft";
export interface IconProps {
  name: IconName;
  className?: string;
}
export declare function Icon(props: IconProps): React.ReactElement | null;
