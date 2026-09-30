import { getAccessToken } from './googleAuth';
import { Bet, AppConfig, WeeklySummary, MonthlySummary } from '../types/betting';
import { generateWeeklySummaries, generateMonthlySummaries, calculateKPIs } from '../utils/calculations';

export interface GoogleDriveFile {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

/**
 * Lista las hojas de cálculo del usuario en Google Drive
 */
export async function listGoogleSpreadsheets(): Promise<GoogleDriveFile[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Usuario no autenticado en Google');

  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime desc&pageSize=20&fields=files(id,name,modifiedTime,webViewLink)`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al listar archivos de Google Drive: ${res.statusText} (${errorText})`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Crea una hoja de cálculo completa con las 5 pestañas y fórmulas nativas
 */
export async function createGoogleBettingSpreadsheet(
  title: string,
  bets: Bet[],
  config: AppConfig
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('Usuario no autenticado en Google');

  // 1. Crear la hoja con las 5 pestañas
  const createPayload = {
    properties: {
      title: title || 'Control de Apuestas Deportivas - BetAnalytics Pro',
    },
    sheets: [
      { properties: { title: 'Configuración', gridProperties: { rowCount: 100, columnCount: 15 } } },
      { properties: { title: 'Apuestas', gridProperties: { rowCount: Math.max(100, bets.length + 30), columnCount: 26 } } },
      { properties: { title: 'Resumen Semanal', gridProperties: { rowCount: 50, columnCount: 15 } } },
      { properties: { title: 'Resumen Mensual', gridProperties: { rowCount: 50, columnCount: 15 } } },
      { properties: { title: 'Dashboard', gridProperties: { rowCount: 40, columnCount: 10 } } },
    ],
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Error creando la hoja en Google Sheets: ${err}`);
  }

  const spreadsheet = await createRes.json();
  const spreadsheetId = spreadsheet.spreadsheetId;
  const spreadsheetUrl = spreadsheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Preparar los datos de las pestañas
  const weekly = generateWeeklySummaries(bets);
  const monthly = generateMonthlySummaries(bets);
  const kpis = calculateKPIs(bets, config.bankrollInicial);

  // Data: Configuración
  const configRows: any[][] = [
    ['PARÁMETROS GENERALES', ''],
    ['Moneda', config.moneda],
    ['Bankroll Inicial', config.bankrollInicial],
    ['% Stake Recomendado', `${config.stakeRecomendadoPorc}%`],
    ['Valor de 1 Unidad', config.valorUnidad],
    ['', ''],
    ['LISTAS DE VALIDACIÓN (DESPLEGABLES)', '', '', ''],
    ['Deportes', 'Tipos de Apuesta', 'Estrategias', 'Resultados'],
  ];

  const maxList = Math.max(
    config.deportes.length,
    config.tiposApuesta.length,
    config.estrategias.length,
    config.resultados.length
  );
  for (let i = 0; i < maxList; i++) {
    configRows.push([
      config.deportes[i] || '',
      config.tiposApuesta[i] || '',
      config.estrategias[i] || '',
      config.resultados[i] || '',
    ]);
  }

  // Data: Apuestas
  const apuestasHeaders = [
    'ID', 'Fecha', 'Hora', 'Semana', 'Mes', 'Año', 'Día',
    'Deporte', 'Competición', 'Evento/Partido', 'Tipo de Apuesta',
    'Estrategia', 'Descripción', 'Cuota', 'Stake', 'Unidades',
    'Riesgo', 'Ganancia Potencial', 'Resultado', 'Ganancia/Pérdida',
    'ROI (%)', 'Banco Antes', 'Banco Después', 'Notas',
  ];

  const apuestasRows = bets.map((b, idx) => {
    const rowNum = idx + 2;
    // Fórmulas nativas de Google Sheets
    const formulaSemana = `=IF(B${rowNum}="", "", TEXT(YEAR(B${rowNum}),"0000") & "-S" & TEXT(ISOWEEKNUM(B${rowNum}),"00"))`;
    const formulaMes = `=IF(B${rowNum}="", "", TEXT(B${rowNum}, "yyyy-mm"))`;
    const formulaAno = `=IF(B${rowNum}="", "", YEAR(B${rowNum}))`;
    const formulaDia = `=IF(B${rowNum}="", "", TEXT(B${rowNum}, "dddd"))`;
    const formulaUnidades = `=IF(O${rowNum}="", "", ROUND(O${rowNum}/Configuración!$B$5, 2))`;
    const formulaPotencial = `=IF(O${rowNum}="", "", O${rowNum} * (N${rowNum} - 1))`;
    const formulaGanancia = `=IF(S${rowNum}="Ganada", O${rowNum}*(N${rowNum}-1), IF(S${rowNum}="Perdida", -O${rowNum}, IF(S${rowNum}="Anulada", 0, 0)))`;
    const formulaROI = `=IF(O${rowNum}>0, T${rowNum}/O${rowNum}, 0)`;
    const formulaBancoAntes = rowNum === 2 ? `=Configuración!$B$3` : `=W${rowNum - 1}`;
    const formulaBancoDespues = `=V${rowNum} + T${rowNum}`;

    return [
      b.id,
      b.fecha,
      b.hora,
      formulaSemana,
      formulaMes,
      formulaAno,
      formulaDia,
      b.deporte,
      b.competicion,
      b.evento,
      b.tipo,
      b.estrategia,
      b.descripcion,
      b.cuota,
      b.stake,
      formulaUnidades,
      b.riesgo,
      formulaPotencial,
      b.resultado,
      formulaGanancia,
      formulaROI,
      formulaBancoAntes,
      formulaBancoDespues,
      b.notas,
    ];
  });

  // Data: Resumen Semanal
  const semanalHeaders = [
    'Semana', 'Total Apuestas', 'Ganadas', 'Perdidas', 'Anuladas',
    'Pendientes', '% Acierto', 'Stake Total', 'Beneficio Neto',
    'Yield / ROI (%)', 'Cuota Media'
  ];

  const semanalRows = weekly.map((w, idx) => {
    const r = idx + 2;
    return [
      w.semana,
      `=COUNTIF(Apuestas!$D:$D, A${r})`,
      `=COUNTIFS(Apuestas!$D:$D, A${r}, Apuestas!$S:$S, "Ganada")`,
      `=COUNTIFS(Apuestas!$D:$D, A${r}, Apuestas!$S:$S, "Perdida")`,
      `=COUNTIFS(Apuestas!$D:$D, A${r}, Apuestas!$S:$S, "Anulada")`,
      `=COUNTIFS(Apuestas!$D:$D, A${r}, Apuestas!$S:$S, "Pendiente")`,
      `=IF(C${r}+D${r}>0, C${r}/(C${r}+D${r}), 0)`,
      `=SUMIF(Apuestas!$D:$D, A${r}, Apuestas!$O:$O)`,
      `=SUMIF(Apuestas!$D:$D, A${r}, Apuestas!$T:$T)`,
      `=IF(H${r}>0, I${r}/H${r}, 0)`,
      `=IFERROR(AVERAGEIF(Apuestas!$D:$D, A${r}, Apuestas!$N:$N), 0)`,
    ];
  });

  // Data: Resumen Mensual
  const mensualHeaders = [
    'Mes (Código)', 'Total Apuestas', 'Ganadas', 'Perdidas', 'Anuladas',
    'Pendientes', '% Acierto', 'Stake Total', 'Beneficio Neto',
    'Yield / ROI (%)', 'Cuota Media', 'Var. vs Mes Anterior'
  ];

  const mensualRows = monthly.map((m, idx) => {
    const r = idx + 2;
    const formulaVar = idx === monthly.length - 1
      ? 'Primer mes base'
      : `=IF(ISNUMBER(I${r+1}), I${r} - I${r+1}, "Base")`;

    return [
      m.mes,
      `=COUNTIF(Apuestas!$E:$E, A${r})`,
      `=COUNTIFS(Apuestas!$E:$E, A${r}, Apuestas!$S:$S, "Ganada")`,
      `=COUNTIFS(Apuestas!$E:$E, A${r}, Apuestas!$S:$S, "Perdida")`,
      `=COUNTIFS(Apuestas!$E:$E, A${r}, Apuestas!$S:$S, "Anulada")`,
      `=COUNTIFS(Apuestas!$E:$E, A${r}, Apuestas!$S:$S, "Pendiente")`,
      `=IF(C${r}+D${r}>0, C${r}/(C${r}+D${r}), 0)`,
      `=SUMIF(Apuestas!$E:$E, A${r}, Apuestas!$O:$O)`,
      `=SUMIF(Apuestas!$E:$E, A${r}, Apuestas!$T:$T)`,
      `=IF(H${r}>0, I${r}/H${r}, 0)`,
      `=IFERROR(AVERAGEIF(Apuestas!$E:$E, A${r}, Apuestas!$N:$N), 0)`,
      formulaVar,
    ];
  });

  // Data: Dashboard
  const dashboardRows = [
    ['PANEL DE CONTROL & ESTADÍSTICAS GLOBALES', ''],
    ['Métrica / KPI', 'Fórmula / Valor'],
    ['Bankroll Inicial', '=Configuración!$B$3'],
    ['Bankroll Actual', '=Configuración!$B$3 + SUM(Apuestas!$T:$T)'],
    ['Beneficio Neto Total', '=SUM(Apuestas!$T:$T)'],
    ['Stake Total Apostado', '=SUM(Apuestas!$O:$O)'],
    ['Yield / ROI Global', '=IF(SUM(Apuestas!$O:$O)>0, SUM(Apuestas!$T:$T)/SUM(Apuestas!$O:$O), 0)'],
    ['Porcentaje de Acierto (Win Rate)', '=COUNTIF(Apuestas!$S:$S, "Ganada") / (COUNTIF(Apuestas!$S:$S, "Ganada") + COUNTIF(Apuestas!$S:$S, "Perdida"))'],
    ['Total de Apuestas', '=COUNTA(Apuestas!$A$2:$A)'],
    ['Apuestas Ganadas', '=COUNTIF(Apuestas!$S:$S, "Ganada")'],
    ['Apuestas Perdidas', '=COUNTIF(Apuestas!$S:$S, "Perdida")'],
    ['Apuestas Anuladas', '=COUNTIF(Apuestas!$S:$S, "Anulada")'],
    ['Apuestas Pendientes', '=COUNTIF(Apuestas!$S:$S, "Pendiente")'],
    ['Cuota Media Global', '=IFERROR(AVERAGE(Apuestas!$N$2:$N), 0)'],
    ['Stake Medio por Apuesta', '=IFERROR(AVERAGE(Apuestas!$O$2:$O), 0)'],
    ['Racha Actual Calculada', `${kpis.rachaActual.conteo} ${kpis.rachaActual.tipo}`],
    ['Máximo Drawdown ($)', `-${kpis.maxDrawdown.monto}`],
    ['Máximo Drawdown (%)', `${kpis.maxDrawdown.porcentaje.toFixed(2)}%`],
  ];

  // 3. Escribir todas las pestañas mediante batchUpdate
  const batchData = [
    {
      range: 'Configuración!A1',
      values: configRows,
    },
    {
      range: 'Apuestas!A1',
      values: [apuestasHeaders, ...apuestasRows],
    },
    {
      range: 'Resumen Semanal!A1',
      values: [semanalHeaders, ...semanalRows],
    },
    {
      range: 'Resumen Mensual!A1',
      values: [mensualHeaders, ...mensualRows],
    },
    {
      range: 'Dashboard!A1',
      values: dashboardRows,
    },
  ];

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: batchData,
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.text();
    throw new Error(`Error escribiendo valores en Google Sheets: ${err}`);
  }

  return { spreadsheetId, spreadsheetUrl };
}
