import { Bet, BetResult, AppConfig, WeeklySummary, MonthlySummary, DashboardKPIs } from '../types/betting';

export const DAYS_SPANISH = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const MONTHS_SPANISH = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Retorna la semana ISO (ej. 2026-S12)
 */
export function getISOWeekString(dateStr: string): { semana: string; ano: number } {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) {
    return { semana: '2026-S01', ano: 2026 };
  }
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  const year = d.getFullYear();
  return {
    semana: `${year}-S${weekNum.toString().padStart(2, '0')}`,
    ano: year,
  };
}

/**
 * Retorna el nombre del día en español
 */
export function getDayOfWeekSpanish(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return 'Lunes';
  return DAYS_SPANISH[d.getDay()];
}

/**
 * Retorna el mes en formato YYYY-MM
 */
export function getMonthString(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return '2026-01';
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${d.getFullYear()}-${month}`;
}

/**
 * Calcula la ganancia/pérdida de una apuesta según su resultado
 */
export function calculateGananciaPerdida(resultado: BetResult, stake: number, cuota: number): number {
  if (resultado === 'Ganada') {
    return Number((stake * (cuota - 1)).toFixed(2));
  }
  if (resultado === 'Perdida') {
    return Number((-stake).toFixed(2));
  }
  // Anulada o Pendiente
  return 0;
}

/**
 * Recalcula la cadena de bankroll (bancoAntes y bancoDespues) para una lista de apuestas ordenada
 */
export function recalculateBankrollChain(bets: Bet[], initialBankroll: number): Bet[] {
  let currentBank = initialBankroll;
  return bets.map((bet) => {
    const gp = calculateGananciaPerdida(bet.resultado, bet.stake, bet.cuota);
    const roi = bet.stake > 0 ? Number((gp / bet.stake).toFixed(4)) : 0;
    const bancoAntes = Number(currentBank.toFixed(2));
    const bancoDespues = Number((currentBank + gp).toFixed(2));
    
    // Si la apuesta está resuelta, afecta al saldo
    if (bet.resultado === 'Ganada' || bet.resultado === 'Perdida') {
      currentBank = bancoDespues;
    }
    
    return {
      ...bet,
      gananciaPotencial: Number((bet.stake * (bet.cuota - 1)).toFixed(2)),
      gananciaPerdida: gp,
      roi,
      bancoAntes,
      bancoDespues: bet.resultado === 'Pendiente' ? bancoAntes : bancoDespues,
    };
  });
}

/**
 * Calcula los KPIs globales del Dashboard
 */
export function calculateKPIs(bets: Bet[], initialBankroll: number): DashboardKPIs {
  const totalApuestas = bets.length;
  let ganadas = 0;
  let perdidas = 0;
  let anuladas = 0;
  let pendientes = 0;
  let stakeTotal = 0;
  let beneficioTotal = 0;
  let sumaCuotas = 0;

  bets.forEach((b) => {
    stakeTotal += b.stake;
    sumaCuotas += b.cuota;
    if (b.resultado === 'Ganada') {
      ganadas++;
      beneficioTotal += b.gananciaPerdida;
    } else if (b.resultado === 'Perdida') {
      perdidas++;
      beneficioTotal += b.gananciaPerdida;
    } else if (b.resultado === 'Anulada') {
      anuladas++;
    } else if (b.resultado === 'Pendiente') {
      pendientes++;
    }
  });

  const apuestasCerradas = ganadas + perdidas;
  const porcAcierto = apuestasCerradas > 0 ? Number(((ganadas / apuestasCerradas) * 100).toFixed(2)) : 0;
  const roiGlobal = stakeTotal > 0 ? Number(((beneficioTotal / stakeTotal) * 100).toFixed(2)) : 0;
  const yieldGlobal = roiGlobal; // En apuestas deportivas se usa comúnmente Yield = (Beneficio Neto / Stake Total) * 100
  const cuotaMedia = totalApuestas > 0 ? Number((sumaCuotas / totalApuestas).toFixed(2)) : 0;
  const stakeMedio = totalApuestas > 0 ? Number((stakeTotal / totalApuestas).toFixed(2)) : 0;
  const bankrollActual = Number((initialBankroll + beneficioTotal).toFixed(2));

  // Cálculo de rachas
  let streakCount = 0;
  let streakType: 'ganadora' | 'perdedora' | 'neutra' = 'neutra';
  let maxRachaGanadora = 0;
  let maxRachaPerdedora = 0;
  let curWinStreak = 0;
  let curLossStreak = 0;

  // Analizar en orden cronológico
  const settledBets = bets.filter((b) => b.resultado === 'Ganada' || b.resultado === 'Perdida');

  settledBets.forEach((b) => {
    if (b.resultado === 'Ganada') {
      curWinStreak++;
      curLossStreak = 0;
      if (curWinStreak > maxRachaGanadora) maxRachaGanadora = curWinStreak;
    } else {
      curLossStreak++;
      curWinStreak = 0;
      if (curLossStreak > maxRachaPerdedora) maxRachaPerdedora = curLossStreak;
    }
  });

  // Racha actual al final
  if (settledBets.length > 0) {
    const lastBet = settledBets[settledBets.length - 1];
    streakType = lastBet.resultado === 'Ganada' ? 'ganadora' : 'perdedora';
    let count = 0;
    for (let i = settledBets.length - 1; i >= 0; i--) {
      if (settledBets[i].resultado === lastBet.resultado) {
        count++;
      } else {
        break;
      }
    }
    streakCount = count;
  }

  // Drawdown Máximo (MDD)
  let peak = initialBankroll;
  let maxDrawdownAmount = 0;
  let maxDrawdownPct = 0;
  let currentRunningBank = initialBankroll;

  settledBets.forEach((b) => {
    currentRunningBank += b.gananciaPerdida;
    if (currentRunningBank > peak) {
      peak = currentRunningBank;
    } else {
      const drawdown = peak - currentRunningBank;
      if (drawdown > maxDrawdownAmount) {
        maxDrawdownAmount = drawdown;
        maxDrawdownPct = peak > 0 ? (drawdown / peak) * 100 : 0;
      }
    }
  });

  return {
    bankrollInicial: initialBankroll,
    bankrollActual,
    beneficioTotal: Number(beneficioTotal.toFixed(2)),
    stakeTotal: Number(stakeTotal.toFixed(2)),
    roiGlobal,
    yieldGlobal,
    porcAcierto,
    totalApuestas,
    ganadas,
    perdidas,
    anuladas,
    pendientes,
    cuotaMedia,
    stakeMedio,
    rachaActual: {
      tipo: streakType,
      conteo: streakCount,
    },
    maxRachaGanadora,
    maxRachaPerdedora,
    maxDrawdown: {
      monto: Number(maxDrawdownAmount.toFixed(2)),
      porcentaje: Number(maxDrawdownPct.toFixed(2)),
    },
  };
}

/**
 * Genera el Resumen Semanal agrupado por semana ISO
 */
export function generateWeeklySummaries(bets: Bet[]): WeeklySummary[] {
  const weeksMap: Record<string, Bet[]> = {};

  bets.forEach((bet) => {
    if (!weeksMap[bet.semana]) {
      weeksMap[bet.semana] = [];
    }
    weeksMap[bet.semana].push(bet);
  });

  const sortedWeeks = Object.keys(weeksMap).sort().reverse();

  return sortedWeeks.map((semana) => {
    const weekBets = weeksMap[semana];
    const total = weekBets.length;
    let ganadas = 0;
    let perdidas = 0;
    let anuladas = 0;
    let pendientes = 0;
    let stakeTotal = 0;
    let beneficioNeto = 0;
    let sumaCuotas = 0;
    const tipoDesglose: Record<string, { total: number; beneficio: number }> = {};

    weekBets.forEach((b) => {
      stakeTotal += b.stake;
      beneficioNeto += b.gananciaPerdida;
      sumaCuotas += b.cuota;
      if (b.resultado === 'Ganada') ganadas++;
      else if (b.resultado === 'Perdida') perdidas++;
      else if (b.resultado === 'Anulada') anuladas++;
      else if (b.resultado === 'Pendiente') pendientes++;

      if (!tipoDesglose[b.tipo]) {
        tipoDesglose[b.tipo] = { total: 0, beneficio: 0 };
      }
      tipoDesglose[b.tipo].total++;
      tipoDesglose[b.tipo].beneficio += b.gananciaPerdida;
    });

    const decididas = ganadas + perdidas;
    const porcAcierto = decididas > 0 ? Number(((ganadas / decididas) * 100).toFixed(2)) : 0;
    const yieldVal = stakeTotal > 0 ? Number(((beneficioNeto / stakeTotal) * 100).toFixed(2)) : 0;
    const cuotaMedia = total > 0 ? Number((sumaCuotas / total).toFixed(2)) : 0;

    return {
      semana,
      totalApuestas: total,
      ganadas,
      perdidas,
      anuladas,
      pendientes,
      porcAcierto,
      stakeTotal: Number(stakeTotal.toFixed(2)),
      beneficioNeto: Number(beneficioNeto.toFixed(2)),
      roi: yieldVal,
      yield: yieldVal,
      cuotaMedia,
      tipoDesglose,
    };
  });
}

/**
 * Genera el Resumen Mensual agrupado por YYYY-MM
 */
export function generateMonthlySummaries(bets: Bet[]): MonthlySummary[] {
  const monthsMap: Record<string, Bet[]> = {};

  bets.forEach((bet) => {
    if (!monthsMap[bet.mes]) {
      monthsMap[bet.mes] = [];
    }
    monthsMap[bet.mes].push(bet);
  });

  const sortedMonthsAsc = Object.keys(monthsMap).sort();
  const result: MonthlySummary[] = [];

  sortedMonthsAsc.forEach((mes, idx) => {
    const mBets = monthsMap[mes];
    const total = mBets.length;
    let ganadas = 0;
    let perdidas = 0;
    let anuladas = 0;
    let pendientes = 0;
    let stakeTotal = 0;
    let beneficioNeto = 0;
    let sumaCuotas = 0;
    const deporteDesglose: Record<string, number> = {};
    const estrategiaDesglose: Record<string, number> = {};
    const tipoDesglose: Record<string, number> = {};

    mBets.forEach((b) => {
      stakeTotal += b.stake;
      beneficioNeto += b.gananciaPerdida;
      sumaCuotas += b.cuota;
      if (b.resultado === 'Ganada') ganadas++;
      else if (b.resultado === 'Perdida') perdidas++;
      else if (b.resultado === 'Anulada') anuladas++;
      else if (b.resultado === 'Pendiente') pendientes++;

      deporteDesglose[b.deporte] = (deporteDesglose[b.deporte] || 0) + b.gananciaPerdida;
      estrategiaDesglose[b.estrategia] = (estrategiaDesglose[b.estrategia] || 0) + b.gananciaPerdida;
      tipoDesglose[b.tipo] = (tipoDesglose[b.tipo] || 0) + b.gananciaPerdida;
    });

    const decididas = ganadas + perdidas;
    const porcAcierto = decididas > 0 ? Number(((ganadas / decididas) * 100).toFixed(2)) : 0;
    const yieldVal = stakeTotal > 0 ? Number(((beneficioNeto / stakeTotal) * 100).toFixed(2)) : 0;
    const cuotaMedia = total > 0 ? Number((sumaCuotas / total).toFixed(2)) : 0;

    const [anoStr, mesStr] = mes.split('-');
    const mesIndex = parseInt(mesStr, 10) - 1;
    const nombreMes = `${MONTHS_SPANISH[mesIndex] || mes} ${anoStr}`;

    let diferenciaBeneficioVsAnterior: number | undefined = undefined;
    let porcCambioVsAnterior: number | undefined = undefined;

    if (idx > 0) {
      const prev = result[idx - 1];
      diferenciaBeneficioVsAnterior = Number((beneficioNeto - prev.beneficioNeto).toFixed(2));
      if (prev.beneficioNeto !== 0) {
        porcCambioVsAnterior = Number(
          (((beneficioNeto - prev.beneficioNeto) / Math.abs(prev.beneficioNeto)) * 100).toFixed(2)
        );
      }
    }

    result.push({
      mes,
      nombreMes,
      totalApuestas: total,
      ganadas,
      perdidas,
      anuladas,
      pendientes,
      porcAcierto,
      stakeTotal: Number(stakeTotal.toFixed(2)),
      beneficioNeto: Number(beneficioNeto.toFixed(2)),
      roi: yieldVal,
      yield: yieldVal,
      cuotaMedia,
      diferenciaBeneficioVsAnterior,
      porcCambioVsAnterior,
      deporteDesglose,
      estrategiaDesglose,
      tipoDesglose,
    });
  });

  return result.reverse(); // Orden descendente para lectura fácil
}

/**
 * 5 Filas de datos iniciales ficticios de ejemplo
 */
export const SAMPLE_INITIAL_BETS: Bet[] = [
  {
    id: 'AP-001',
    fecha: '2026-03-24',
    hora: '21:00',
    semana: '2026-S13',
    mes: '2026-03',
    ano: 2026,
    dia: 'Martes',
    deporte: 'Fútbol',
    competicion: 'Champions League',
    evento: 'Real Madrid vs Manchester City',
    tipo: 'Ambos Marcan',
    estrategia: 'Mercado de Goles (Stats)',
    descripcion: 'Ambos equipos anotan + Más de 2.5 goles',
    cuota: 1.85,
    stake: 25.00,
    unidades: 2.5,
    riesgo: 'Medio',
    gananciaPotencial: 21.25,
    resultado: 'Ganada',
    gananciaPerdida: 21.25,
    roi: 0.85,
    bancoAntes: 1000.00,
    bancoDespues: 1021.25,
    notas: 'Partido de ida muy ofensivo, ambos equipos llegaron con sus goleadores estelares.',
  },
  {
    id: 'AP-002',
    fecha: '2026-03-25',
    hora: '19:30',
    semana: '2026-S13',
    mes: '2026-03',
    ano: 2026,
    dia: 'Miércoles',
    deporte: 'Baloncesto',
    competicion: 'NBA',
    evento: 'Boston Celtics vs Milwaukee Bucks',
    tipo: 'Hándicap Asiático',
    estrategia: 'Favorito con Hándicap',
    descripcion: 'Boston Celtics -5.5 puntos',
    cuota: 1.91,
    stake: 20.00,
    unidades: 2.0,
    riesgo: 'Medio',
    gananciaPotencial: 18.20,
    resultado: 'Perdida',
    gananciaPerdida: -20.00,
    roi: -1.00,
    bancoAntes: 1021.25,
    bancoDespues: 1001.25,
    notas: 'Boston ganó solo por 2 puntos en tiempo suplementario, no cubrió el spread.',
  },
  {
    id: 'AP-003',
    fecha: '2026-03-26',
    hora: '14:00',
    semana: '2026-S13',
    mes: '2026-03',
    ano: 2026,
    dia: 'Jueves',
    deporte: 'Tenis',
    competicion: 'ATP Miami Open',
    evento: 'Carlos Alcaraz vs Jannik Sinner',
    tipo: 'Over/Under (Más/Menos)',
    estrategia: 'Value Betting',
    descripcion: 'Más de 22.5 juegos totales',
    cuota: 1.95,
    stake: 30.00,
    unidades: 3.0,
    riesgo: 'Bajo',
    gananciaPotencial: 28.50,
    resultado: 'Ganada',
    gananciaPerdida: 28.50,
    roi: 0.95,
    bancoAntes: 1001.25,
    bancoDespues: 1029.75,
    notas: 'Duelo a tres sets muy disputado (6-4, 4-6, 7-5).',
  },
  {
    id: 'AP-004',
    fecha: '2026-03-27',
    hora: '20:45',
    semana: '2026-S13',
    mes: '2026-03',
    ano: 2026,
    dia: 'Viernes',
    deporte: 'Fútbol',
    competicion: 'LaLiga EA Sports',
    evento: 'Athletic Club vs Real Sociedad',
    tipo: 'Empate No Válido (DNB)',
    estrategia: 'Underdog con Valor',
    descripcion: 'Athletic Club Empate Apuesta No Válida',
    cuota: 1.70,
    stake: 15.00,
    unidades: 1.5,
    riesgo: 'Bajo',
    gananciaPotencial: 10.50,
    resultado: 'Anulada',
    gananciaPerdida: 0.00,
    roi: 0.00,
    bancoAntes: 1029.75,
    bancoDespues: 1029.75,
    notas: 'Terminó 1-1, devolución íntegra del dinero apostado.',
  },
  {
    id: 'AP-005',
    fecha: '2026-03-28',
    hora: '16:15',
    semana: '2026-S13',
    mes: '2026-03',
    ano: 2026,
    dia: 'Sábado',
    deporte: 'Fútbol',
    competicion: 'Premier League',
    evento: 'Arsenal vs Chelsea',
    tipo: 'Simple',
    estrategia: 'Bankroll Management 1-2%',
    descripcion: 'Victoria directa de Arsenal',
    cuota: 1.80,
    stake: 20.00,
    unidades: 2.0,
    riesgo: 'Bajo',
    gananciaPotencial: 16.00,
    resultado: 'Pendiente',
    gananciaPerdida: 0.00,
    roi: 0.00,
    bancoAntes: 1029.75,
    bancoDespues: 1029.75,
    notas: 'Pronóstico listo para el fin de semana.',
  },
];

export const DEFAULT_CONFIG: AppConfig = {
  moneda: '€',
  bankrollInicial: 1000,
  stakeRecomendadoPorc: 2.0,
  valorUnidad: 10.0,
  plataformaFormula: 'google-sheets',
  idiomaFormula: 'es',
  deportes: [
    'Fútbol',
    'Baloncesto',
    'Tenis',
    'Béisbol',
    'Fútbol Americano (NFL)',
    'MMA / UFC',
    'Hockey (NHL)',
    'eSports',
    'Motor',
    'Otro',
  ],
  tiposApuesta: [
    'Simple',
    'Combinada',
    'Hándicap Asiático',
    'Hándicap Europeo',
    'Over/Under (Más/Menos)',
    'Ambos Marcan',
    'Doble Oportunidad',
    'Empate No Válido (DNB)',
    'Apuesta En Vivo',
    'Futura / A Largo Plazo',
  ],
  estrategias: [
    'Value Betting',
    'Bankroll Management 1-2%',
    'Mercado de Goles (Stats)',
    'Favorito con Hándicap',
    'Underdog con Valor',
    'Live In-Play Momentum',
    'Especiales / Props',
    'Seguimiento de Tipster',
    'General',
  ],
  resultados: ['Ganada', 'Perdida', 'Anulada', 'Pendiente'],
};
