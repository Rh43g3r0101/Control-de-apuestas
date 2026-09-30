export type BetResult = 'Ganada' | 'Perdida' | 'Anulada' | 'Pendiente';

export type BetType = 
  | 'Simple'
  | 'Combinada'
  | 'Hándicap Asiático'
  | 'Hándicap Europeo'
  | 'Over/Under (Más/Menos)'
  | 'Ambos Marcan'
  | 'Doble Oportunidad'
  | 'Empate No Válido (DNB)'
  | 'Apuesta En Vivo'
  | 'Futura / A Largo Plazo';

export type Sport =
  | 'Fútbol'
  | 'Baloncesto'
  | 'Tenis'
  | 'Béisbol'
  | 'Fútbol Americano (NFL)'
  | 'MMA / UFC'
  | 'Hockey (NHL)'
  | 'eSports'
  | 'Motor'
  | 'Otro';

export type Strategy =
  | 'Value Betting'
  | 'Bankroll Management 1-2%'
  | 'Mercado de Goles (Stats)'
  | 'Favorito con Hándicap'
  | 'Underdog con Valor'
  | 'Live In-Play Momentum'
  | 'Especiales / Props'
  | 'Seguimiento de Tipster'
  | 'General';

export interface Bet {
  id: string;
  fecha: string; // YYYY-MM-DD
  hora: string;  // HH:MM
  semana: string; // ej. 2026-S12
  mes: string;    // ej. 2026-03
  ano: number;    // ej. 2026
  dia: string;    // Lunes, Martes, etc.
  deporte: Sport | string;
  competicion: string;
  evento: string;
  tipo: BetType | string;
  estrategia: Strategy | string;
  descripcion: string;
  cuota: number;
  stake: number;
  unidades: number;
  riesgo: 'Bajo' | 'Medio' | 'Alto';
  gananciaPotencial: number; // stake * (cuota - 1)
  resultado: BetResult;
  gananciaPerdida: number;
  roi: number; // gananciaPerdida / stake
  bancoAntes: number;
  bancoDespues: number;
  notas: string;
}

export interface AppConfig {
  moneda: string; // €, $, ARS, MXN, etc.
  bankrollInicial: number;
  stakeRecomendadoPorc: number; // ej. 2%
  valorUnidad: number; // ej. 10
  plataformaFormula: 'google-sheets' | 'excel';
  idiomaFormula: 'es' | 'en';
  deportes: string[];
  tiposApuesta: string[];
  estrategias: string[];
  resultados: BetResult[];
}

export interface WeeklySummary {
  semana: string;
  totalApuestas: number;
  ganadas: number;
  perdidas: number;
  anuladas: number;
  pendientes: number;
  porcAcierto: number;
  stakeTotal: number;
  beneficioNeto: number;
  roi: number;
  yield: number;
  cuotaMedia: number;
  tipoDesglose: Record<string, { total: number; beneficio: number }>;
}

export interface MonthlySummary {
  mes: string; // YYYY-MM
  nombreMes: string;
  totalApuestas: number;
  ganadas: number;
  perdidas: number;
  anuladas: number;
  pendientes: number;
  porcAcierto: number;
  stakeTotal: number;
  beneficioNeto: number;
  roi: number;
  yield: number;
  cuotaMedia: number;
  diferenciaBeneficioVsAnterior?: number;
  porcCambioVsAnterior?: number;
  deporteDesglose: Record<string, number>;
  estrategiaDesglose: Record<string, number>;
  tipoDesglose: Record<string, number>;
}

export interface DashboardKPIs {
  bankrollInicial: number;
  bankrollActual: number;
  beneficioTotal: number;
  stakeTotal: number;
  roiGlobal: number; // Beneficio / Stake * 100
  yieldGlobal: number;
  porcAcierto: number; // Ganadas / (Ganadas + Perdidas) * 100
  totalApuestas: number;
  ganadas: number;
  perdidas: number;
  anuladas: number;
  pendientes: number;
  cuotaMedia: number;
  stakeMedio: number;
  rachaActual: {
    tipo: 'ganadora' | 'perdedora' | 'neutra';
    conteo: number;
  };
  maxRachaGanadora: number;
  maxRachaPerdedora: number;
  maxDrawdown: {
    monto: number;
    porcentaje: number;
  };
}
