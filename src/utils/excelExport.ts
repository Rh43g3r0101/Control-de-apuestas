import * as XLSX from 'xlsx';
import { Bet, AppConfig, WeeklySummary, MonthlySummary, DashboardKPIs } from '../types/betting';

export function exportToExcel(
  bets: Bet[],
  config: AppConfig,
  weekly: WeeklySummary[],
  monthly: MonthlySummary[],
  kpis: DashboardKPIs
) {
  const wb = XLSX.utils.book_new();

  // 1. Pestaña: Configuración
  const configData = [
    ['PARÁMETROS GENERALES', ''],
    ['Moneda', config.moneda],
    ['Bankroll Inicial', config.bankrollInicial],
    ['% Stake Recomendado', `${config.stakeRecomendadoPorc}%`],
    ['Valor de 1 Unidad', config.valorUnidad],
    ['', ''],
    ['LISTAS DE VALIDACIÓN (DESPLEGABLES)', ''],
    ['Deportes', 'Tipos de Apuesta', 'Estrategias', 'Resultados'],
  ];

  const maxListRows = Math.max(
    config.deportes.length,
    config.tiposApuesta.length,
    config.estrategias.length,
    config.resultados.length
  );

  for (let i = 0; i < maxListRows; i++) {
    configData.push([
      config.deportes[i] || '',
      config.tiposApuesta[i] || '',
      config.estrategias[i] || '',
      config.resultados[i] || '',
    ]);
  }

  const wsConfig = XLSX.utils.aoa_to_sheet(configData);
  XLSX.utils.book_append_sheet(wb, wsConfig, 'Configuración');

  // 2. Pestaña: Apuestas
  const apuestasHeaders = [
    'ID',
    'Fecha',
    'Hora',
    'Semana',
    'Mes',
    'Año',
    'Día',
    'Deporte',
    'Competición',
    'Evento/Partido',
    'Tipo de Apuesta',
    'Estrategia',
    'Descripción',
    'Cuota',
    'Stake',
    'Unidades',
    'Riesgo',
    'Ganancia Potencial',
    'Resultado',
    'Ganancia/Pérdida',
    'ROI (%)',
    'Banco Antes',
    'Banco Después',
    'Notas',
  ];

  const apuestasRows = bets.map((b) => [
    b.id,
    b.fecha,
    b.hora,
    b.semana,
    b.mes,
    b.ano,
    b.dia,
    b.deporte,
    b.competicion,
    b.evento,
    b.tipo,
    b.estrategia,
    b.descripcion,
    b.cuota,
    b.stake,
    b.unidades,
    b.riesgo,
    b.gananciaPotencial,
    b.resultado,
    b.gananciaPerdida,
    b.roi ? `${(b.roi * 100).toFixed(1)}%` : '0%',
    b.bancoAntes,
    b.bancoDespues,
    b.notas,
  ]);

  const wsApuestas = XLSX.utils.aoa_to_sheet([apuestasHeaders, ...apuestasRows]);
  XLSX.utils.book_append_sheet(wb, wsApuestas, 'Apuestas');

  // 3. Pestaña: Resumen Semanal
  const semanalHeaders = [
    'Semana',
    'Total Apuestas',
    'Ganadas',
    'Perdidas',
    'Anuladas',
    'Pendientes',
    '% Acierto',
    'Stake Total',
    'Beneficio Neto',
    'ROI / Yield (%)',
    'Cuota Media',
  ];

  const semanalRows = weekly.map((w) => [
    w.semana,
    w.totalApuestas,
    w.ganadas,
    w.perdidas,
    w.anuladas,
    w.pendientes,
    `${w.porcAcierto}%`,
    w.stakeTotal,
    w.beneficioNeto,
    `${w.yield}%`,
    w.cuotaMedia,
  ]);

  const wsSemanal = XLSX.utils.aoa_to_sheet([semanalHeaders, ...semanalRows]);
  XLSX.utils.book_append_sheet(wb, wsSemanal, 'Resumen Semanal');

  // 4. Pestaña: Resumen Mensual
  const mensualHeaders = [
    'Mes (Código)',
    'Mes',
    'Total Apuestas',
    'Ganadas',
    'Perdidas',
    'Anuladas',
    'Pendientes',
    '% Acierto',
    'Stake Total',
    'Beneficio Neto',
    'ROI / Yield (%)',
    'Cuota Media',
    'Var. vs Mes Ant.',
  ];

  const mensualRows = monthly.map((m) => [
    m.mes,
    m.nombreMes,
    m.totalApuestas,
    m.ganadas,
    m.perdidas,
    m.anuladas,
    m.pendientes,
    `${m.porcAcierto}%`,
    m.stakeTotal,
    m.beneficioNeto,
    `${m.yield}%`,
    m.cuotaMedia,
    m.diferenciaBeneficioVsAnterior !== undefined
      ? `${m.diferenciaBeneficioVsAnterior >= 0 ? '+' : ''}${m.diferenciaBeneficioVsAnterior}`
      : '-',
  ]);

  const wsMensual = XLSX.utils.aoa_to_sheet([mensualHeaders, ...mensualRows]);
  XLSX.utils.book_append_sheet(wb, wsMensual, 'Resumen Mensual');

  // 5. Pestaña: Dashboard
  const dashboardData = [
    ['PANEL DE CONTROL & ESTADÍSTICAS GLOBALES', ''],
    ['', ''],
    ['Métrica / KPI', 'Valor'],
    ['Bankroll Inicial', `${config.moneda} ${kpis.bankrollInicial}`],
    ['Bankroll Actual', `${config.moneda} ${kpis.bankrollActual}`],
    ['Beneficio Neto Total', `${config.moneda} ${kpis.beneficioTotal}`],
    ['Stake Total Apostado', `${config.moneda} ${kpis.stakeTotal}`],
    ['Yield / ROI Global', `${kpis.yieldGlobal}%`],
    ['Porcentaje de Acierto (Win Rate)', `${kpis.porcAcierto}%`],
    ['Total de Apuestas', kpis.totalApuestas],
    ['Apuestas Ganadas', kpis.ganadas],
    ['Apuestas Perdidas', kpis.perdidas],
    ['Apuestas Anuladas', kpis.anuladas],
    ['Apuestas Pendientes', kpis.pendientes],
    ['Cuota Media Global', kpis.cuotaMedia],
    ['Stake Medio por Apuesta', `${config.moneda} ${kpis.stakeMedio}`],
    ['Racha Actual', `${kpis.rachaActual.conteo} ${kpis.rachaActual.tipo}`],
    ['Mayor Racha Ganadora', `${kpis.maxRachaGanadora} consecutivas`],
    ['Mayor Racha Perdedora', `${kpis.maxRachaPerdedora} consecutivas`],
    ['Máximo Drawdown ($)', `${config.moneda} ${kpis.maxDrawdown.monto}`],
    ['Máximo Drawdown (%)', `${kpis.maxDrawdown.porcentaje.toFixed(2)}%`],
  ];

  const wsDashboard = XLSX.utils.aoa_to_sheet(dashboardData);
  XLSX.utils.book_append_sheet(wb, wsDashboard, 'Dashboard');

  // Descarga el archivo
  XLSX.writeFile(wb, 'Plantilla_Control_Apuestas_Deportivas.xlsx');
}
