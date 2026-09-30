import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  FileSpreadsheet, 
  HelpCircle, 
  ShieldCheck, 
  PlusCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { AppConfig } from '../types/betting';

interface FormulaGuideTabProps {
  config: AppConfig;
  onUpdateConfig: (cfg: Partial<AppConfig>) => void;
  onExportExcel: () => void;
  onOpenGoogleSheets: () => void;
}

export const FormulaGuideTab: React.FC<FormulaGuideTabProps> = ({
  config,
  onUpdateConfig,
  onExportExcel,
  onOpenGoogleSheets,
}) => {
  const [platform, setPlatform] = useState<'google-sheets' | 'excel'>('google-sheets');
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const isSheets = platform === 'google-sheets';
  const isEs = lang === 'es';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Hero Card */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded">
                <FileSpreadsheet className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900">
                Guía Paso a Paso & Fórmulas Copiables
              </h1>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Fórmulas probadas listas para copiar y pegar en tu hoja de cálculo, con soporte bilingüe y adaptación según tu plataforma.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenGoogleSheets}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-md hover:bg-emerald-100 transition-colors whitespace-nowrap shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar a Google Sheets</span>
            </button>

            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors whitespace-nowrap shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Descargar Plantilla (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Selector de Plataforma e Idioma de Fórmulas */}
        <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-600">Plataforma:</span>
            <div className="inline-flex p-1 bg-neutral-100 rounded-lg">
              <button
                onClick={() => setPlatform('google-sheets')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  isSheets ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Google Sheets
              </button>
              <button
                onClick={() => setPlatform('excel')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  !isSheets ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Microsoft Excel (Tablas)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-600">Idioma de Fórmulas:</span>
            <div className="inline-flex p-1 bg-neutral-100 rounded-lg">
              <button
                onClick={() => setLang('es')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  isEs ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Español (SUMAR.SI / SI)
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  !isEs ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                English (SUMIFS / IF)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: PESTAÑA CONFIGURACIÓN */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
          <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">1</div>
          <h2 className="text-base font-bold text-neutral-900">
            Pestaña: Configuración
          </h2>
        </div>
        <p className="text-xs text-neutral-600">
          Crea una pestaña llamada exactamente <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-neutral-800">Configuración</code>. Esta hoja alojará los parámetros maestros y los rangos para las listas desplegables.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-neutral-200 rounded p-3 text-xs bg-neutral-50/50">
            <div className="font-semibold text-neutral-800 mb-2">Celdas de Parámetros Clave:</div>
            <ul className="space-y-1.5 font-mono text-neutral-700">
              <li><strong className="text-neutral-900">B2:</strong> Moneda (ej. <code className="text-emerald-700 font-bold">€</code> o <code className="text-emerald-700 font-bold">$</code>)</li>
              <li><strong className="text-neutral-900">B3:</strong> Bankroll Inicial (ej. <code className="text-emerald-700 font-bold">1000</code>)</li>
              <li><strong className="text-neutral-900">B4:</strong> % Stake Recomendado (ej. <code className="text-emerald-700 font-bold">0.02</code> o <code className="text-emerald-700 font-bold">2%</code>)</li>
              <li><strong className="text-neutral-900">B5:</strong> Valor de 1 Unidad (ej. <code className="text-emerald-700 font-bold">10</code>)</li>
            </ul>
          </div>

          <div className="border border-neutral-200 rounded p-3 text-xs bg-neutral-50/50">
            <div className="font-semibold text-neutral-800 mb-2">Columnas de Listas Maestras (para Desplegables):</div>
            <ul className="space-y-1.5 font-mono text-neutral-700">
              <li><strong className="text-neutral-900">Columna D (D2:D15):</strong> Lista de Deportes (Fútbol, Baloncesto, Tenis...)</li>
              <li><strong className="text-neutral-900">Columna E (E2:E15):</strong> Tipos de Apuesta (Simple, Combinada, Hándicap...)</li>
              <li><strong className="text-neutral-900">Columna F (F2:F15):</strong> Estrategias (Value Betting, Mercado Goles...)</li>
              <li><strong className="text-neutral-900">Columna G (G2:G5):</strong> Resultados (Ganada, Perdida, Anulada, Pendiente)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: PESTAÑA APUESTAS */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
          <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">2</div>
          <h2 className="text-base font-bold text-neutral-900">
            Pestaña: Apuestas (Libro de Registro)
          </h2>
        </div>
        <p className="text-xs text-neutral-600">
          Crea la pestaña <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-neutral-800">Apuestas</code>. La Fila 1 contendrá los encabezados de columna desde A1 hasta X1.
        </p>

        {/* Mapeo de columnas */}
        <div className="overflow-x-auto border border-neutral-200 rounded">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-50 text-neutral-700 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-2 px-3">Col</th>
                <th className="py-2 px-3">Nombre Columna</th>
                <th className="py-2 px-3">Tipo de Entrada</th>
                <th className="py-2 px-3">Regla / Fórmula</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono text-2xs">
              <tr>
                <td className="py-1.5 px-3 font-bold text-neutral-900">A</td>
                <td className="py-1.5 px-3 font-sans text-neutral-800">ID</td>
                <td className="py-1.5 px-3 font-sans text-neutral-500">Manual / Autonumérico</td>
                <td className="py-1.5 px-3 text-neutral-600">AP-001, AP-002...</td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 font-bold text-neutral-900">B</td>
                <td className="py-1.5 px-3 font-sans text-neutral-800">Fecha</td>
                <td className="py-1.5 px-3 font-sans text-neutral-500">Manual (Fecha)</td>
                <td className="py-1.5 px-3 text-neutral-600">Formato: YYYY-MM-DD</td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 font-bold text-neutral-900">C</td>
                <td className="py-1.5 px-3 font-sans text-neutral-800">Hora</td>
                <td className="py-1.5 px-3 font-sans text-neutral-500">Manual (Hora)</td>
                <td className="py-1.5 px-3 text-neutral-600">Formato: HH:MM</td>
              </tr>
              <tr className="bg-emerald-50/40">
                <td className="py-1.5 px-3 font-bold text-emerald-800">D</td>
                <td className="py-1.5 px-3 font-sans font-medium text-emerald-900">Semana</td>
                <td className="py-1.5 px-3 font-sans text-emerald-700">Calculada automática</td>
                <td className="py-1.5 px-3 text-emerald-800 font-bold">
                  {isSheets
                    ? '=SI(B2=""; ""; TEXTO(AÑO(B2);"0000") & "-S" & TEXTO(NUM.DE.SEMANA(B2; 21);"00"))'
                    : '=SI([@Fecha]="";"";TEXTO(AÑO([@Fecha]);"0000") & "-S" & TEXTO(NUM.DE.SEMANA.ISO([@Fecha]);"00"))'}
                </td>
              </tr>
              <tr className="bg-emerald-50/40">
                <td className="py-1.5 px-3 font-bold text-emerald-800">E</td>
                <td className="py-1.5 px-3 font-sans font-medium text-emerald-900">Mes</td>
                <td className="py-1.5 px-3 font-sans text-emerald-700">Calculada automática</td>
                <td className="py-1.5 px-3 text-emerald-800 font-bold">
                  {isSheets ? '=SI(B2=""; ""; TEXTO(B2; "yyyy-mm"))' : '=SI([@Fecha]="";"";TEXTO([@Fecha]; "yyyy-mm"))'}
                </td>
              </tr>
              <tr className="bg-emerald-50/40">
                <td className="py-1.5 px-3 font-bold text-emerald-800">F</td>
                <td className="py-1.5 px-3 font-sans font-medium text-emerald-900">Año</td>
                <td className="py-1.5 px-3 font-sans text-emerald-700">Calculada automática</td>
                <td className="py-1.5 px-3 text-emerald-800 font-bold">
                  {isSheets ? '=SI(B2=""; ""; AÑO(B2))' : '=SI([@Fecha]="";"";AÑO([@Fecha]))'}
                </td>
              </tr>
              <tr className="bg-emerald-50/40">
                <td className="py-1.5 px-3 font-bold text-emerald-800">G</td>
                <td className="py-1.5 px-3 font-sans font-medium text-emerald-900">Día</td>
                <td className="py-1.5 px-3 font-sans text-emerald-700">Calculada automática</td>
                <td className="py-1.5 px-3 text-emerald-800 font-bold">
                  {isSheets ? '=SI(B2=""; ""; TEXTO(B2; "dddd"))' : '=SI([@Fecha]="";"";TEXTO([@Fecha]; "dddd"))'}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 font-bold text-neutral-900">H</td>
                <td className="py-1.5 px-3 font-sans text-neutral-800">Deporte</td>
                <td className="py-1.5 px-3 font-sans text-neutral-500">Validación (Desplegable)</td>
                <td className="py-1.5 px-3 text-neutral-600">=Configuración!$D$2:$D$15</td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 font-bold text-neutral-900">I</td>
                <td className="py-1.5 px-3 font-sans text-neutral-800">Competición</td>
                <td className="py-1.5 px-3 font-sans text-neutral-500">Manual (Texto)</td>
                <td className="py-1.5 px-3 text-neutral-600">Champions League, NBA, etc.</td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 font-bold text-neutral-900">J</td>
                <td className="py-1.5 px-3 font-sans text-neutral-800">Evento/Partido</td>
                <td className="py-1.5 px-3 font-sans text-neutral-500">Manual (Texto)</td>
                <td className="py-1.5 px-3 text-neutral-600">Equipo A vs Equipo B</td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 font-bold text-neutral-900">K</td>
                <td className="py-1.5 px-3 font-sans text-neutral-800">Tipo de Apuesta</td>
                <td className="py-1.5 px-3 font-sans text-neutral-500">Validación (Desplegable)</td>
                <td className="py-1.5 px-3 text-neutral-600">=Configuración!$E$2:$E$15</td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 font-bold text-neutral-900">L</td>
                <td className="py-1.5 px-3 font-sans text-neutral-800">Estrategia</td>
                <td className="py-1.5 px-3 font-sans text-neutral-500">Validación (Desplegable)</td>
                <td className="py-1.5 px-3 text-neutral-600">=Configuración!$F$2:$F$15</td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 font-bold text-neutral-900">M</td>
                <td className="py-1.5 px-3 font-sans text-neutral-800">Descripción</td>
                <td className="py-1.5 px-3 font-sans text-neutral-500">Manual (Texto)</td>
                <td className="py-1.5 px-3 text-neutral-600">Pronóstico exacto</td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 font-bold text-neutral-900">N</td>
                <td className="py-1.5 px-3 font-sans text-neutral-800">Cuota</td>
                <td className="py-1.5 px-3 font-sans text-neutral-500">Manual (Número Decimal)</td>
                <td className="py-1.5 px-3 text-neutral-600">ej. 1.85, 2.10</td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 font-bold text-neutral-900">O</td>
                <td className="py-1.5 px-3 font-sans text-neutral-800">Stake</td>
                <td className="py-1.5 px-3 font-sans text-neutral-500">Manual (Moneda)</td>
                <td className="py-1.5 px-3 text-neutral-600">ej. 25.00</td>
              </tr>
              <tr className="bg-emerald-50/40">
                <td className="py-1.5 px-3 font-bold text-emerald-800">P</td>
                <td className="py-1.5 px-3 font-sans font-medium text-emerald-900">Unidades</td>
                <td className="py-1.5 px-3 font-sans text-emerald-700">Calculada automática</td>
                <td className="py-1.5 px-3 text-emerald-800 font-bold">
                  {isSheets ? '=SI(O2=""; ""; REDONDEAR(O2/Configuración!$B$5; 2))' : '=SI([@Stake]="";"";REDONDEAR([@Stake]/Configuración!$B$5; 2))'}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 font-bold text-neutral-900">Q</td>
                <td className="py-1.5 px-3 font-sans text-neutral-800">Riesgo</td>
                <td className="py-1.5 px-3 font-sans text-neutral-500">Manual / Desplegable</td>
                <td className="py-1.5 px-3 text-neutral-600">Bajo, Medio, Alto</td>
              </tr>
              <tr className="bg-emerald-50/40">
                <td className="py-1.5 px-3 font-bold text-emerald-800">R</td>
                <td className="py-1.5 px-3 font-sans font-medium text-emerald-900">Ganancia Potencial</td>
                <td className="py-1.5 px-3 font-sans text-emerald-700">Calculada automática</td>
                <td className="py-1.5 px-3 text-emerald-800 font-bold">
                  {isSheets ? '=SI(O2=""; ""; O2 * (N2 - 1))' : '=SI([@Stake]="";"";[@Stake]*([@Cuota]-1))'}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 font-bold text-neutral-900">S</td>
                <td className="py-1.5 px-3 font-sans text-neutral-800">Resultado</td>
                <td className="py-1.5 px-3 font-sans text-neutral-500">Validación (Desplegable)</td>
                <td className="py-1.5 px-3 text-neutral-600">=Configuración!$G$2:$G$5</td>
              </tr>
              <tr className="bg-emerald-100/50">
                <td className="py-1.5 px-3 font-bold text-emerald-900">T</td>
                <td className="py-1.5 px-3 font-sans font-bold text-emerald-950">Ganancia/Pérdida</td>
                <td className="py-1.5 px-3 font-sans text-emerald-800 font-semibold">Calculada automática</td>
                <td className="py-1.5 px-3 text-emerald-900 font-bold">
                  {isSheets
                    ? isEs
                      ? '=SI(S2="Ganada"; O2*(N2-1); SI(S2="Perdida"; -O2; SI(S2="Anulada"; 0; 0)))'
                      : '=IF(S2="Ganada", O2*(N2-1), IF(S2="Perdida", -O2, IF(S2="Anulada", 0, 0)))'
                    : isEs
                    ? '=SI([@Resultado]="Ganada"; [@Stake]*([@Cuota]-1); SI([@Resultado]="Perdida"; -[@Stake]; 0))'
                    : '=IF([@Resultado]="Ganada", [@Stake]*([@Cuota]-1), IF([@Resultado]="Perdida", -[@Stake], 0))'}
                </td>
              </tr>
              <tr className="bg-emerald-50/40">
                <td className="py-1.5 px-3 font-bold text-emerald-800">U</td>
                <td className="py-1.5 px-3 font-sans font-medium text-emerald-900">ROI (%)</td>
                <td className="py-1.5 px-3 font-sans text-emerald-700">Calculada automática</td>
                <td className="py-1.5 px-3 text-emerald-800 font-bold">
                  {isSheets
                    ? '=SI(O2>0; T2/O2; 0)'
                    : '=SI([@Stake]>0; [@GananciaPerdida]/[@Stake]; 0)'}
                </td>
              </tr>
              <tr className="bg-emerald-50/40">
                <td className="py-1.5 px-3 font-bold text-emerald-800">V</td>
                <td className="py-1.5 px-3 font-sans font-medium text-emerald-900">Banco Antes</td>
                <td className="py-1.5 px-3 font-sans text-emerald-700">Calculada automática</td>
                <td className="py-1.5 px-3 text-emerald-800 font-bold">
                  Fila 2: =Configuración!$B$3 | Fila 3+: =W2
                </td>
              </tr>
              <tr className="bg-emerald-50/40">
                <td className="py-1.5 px-3 font-bold text-emerald-800">W</td>
                <td className="py-1.5 px-3 font-sans font-medium text-emerald-900">Banco Después</td>
                <td className="py-1.5 px-3 font-sans text-emerald-700">Calculada automática</td>
                <td className="py-1.5 px-3 text-emerald-800 font-bold">
                  =V2 + T2
                </td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 font-bold text-neutral-900">X</td>
                <td className="py-1.5 px-3 font-sans text-neutral-800">Notas</td>
                <td className="py-1.5 px-3 font-sans text-neutral-500">Manual (Texto)</td>
                <td className="py-1.5 px-3 text-neutral-600">Comentarios del análisis</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tarjeta especial: ARRAYFORMULA para Google Sheets (¡Autoextensión sin arrastrar!) */}
        {isSheets && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-950">
                  Fórmula Maestra Autoextensible (ARRAYFORMULA) para Google Sheets
                </span>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    `=ARRAYFORMULA(SI(FILA(B:B)=1; "Ganancia/Pérdida"; SI(B:B=""; ""; SI(S:S="Ganada"; O:O*(N:N-1); SI(S:S="Perdida"; -O:O; SI(S:S="Anulada"; 0; 0))))))`,
                    'array-gp'
                  )
                }
                className="inline-flex items-center gap-1 text-2xs font-semibold px-2.5 py-1 bg-white border border-emerald-300 text-emerald-800 rounded hover:bg-emerald-100"
              >
                {copiedKey === 'array-gp' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>Copiar ARRAYFORMULA Ganancia</span>
              </button>
            </div>
            <p className="text-2xs text-emerald-800">
              Al colocar esta fórmula directamente en <strong>T1</strong> (en el encabezado), calculará y se expandirá automáticamente hacia abajo para cada nueva fila que agregues, sin necesidad de arrastrar fórmulas ni romper la hoja.
            </p>
            <div className="bg-white p-2 rounded font-mono text-2xs text-emerald-900 overflow-x-auto border border-emerald-200">
              =ARRAYFORMULA(SI(FILA(B:B)=1; "Ganancia/Pérdida"; SI(B:B=""; ""; SI(S:S="Ganada"; O:O*(N:N-1); SI(S:S="Perdida"; -O:O; SI(S:S="Anulada"; 0; 0))))))
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN 3: PESTAÑA RESUMEN SEMANAL */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
          <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">3</div>
          <h2 className="text-base font-bold text-neutral-900">
            Pestaña: Resumen Semanal
          </h2>
        </div>
        <p className="text-xs text-neutral-600">
          En la columna A coloca la lista de semanas (ej. A2: <code className="font-mono text-neutral-800">2026-S13</code>, A3: <code className="font-mono text-neutral-800">2026-S12</code>...). Las siguientes fórmulas en la fila 2 resumen automáticamente todas las apuestas de esa semana:
        </p>

        <div className="space-y-3">
          {/* Fórmulas para copiar */}
          <div className="border border-neutral-200 rounded-lg divide-y divide-neutral-100 text-xs">
            {/* Total Apuestas */}
            <div className="p-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-neutral-900">B2 (Total Apuestas):</span>
                <span className="font-mono text-neutral-700 ml-2">
                  {isSheets
                    ? isEs ? '=CONTAR.SI(Apuestas!$D:$D; A2)' : '=COUNTIF(Apuestas!$D:$D, A2)'
                    : isEs ? '=CONTAR.SI(Apuestas[Semana]; [@Semana])' : '=COUNTIF(Apuestas[Semana], [@Semana])'}
                </span>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    isSheets
                      ? (isEs ? '=CONTAR.SI(Apuestas!$D:$D; A2)' : '=COUNTIF(Apuestas!$D:$D, A2)')
                      : (isEs ? '=CONTAR.SI(Apuestas[Semana]; [@Semana])' : '=COUNTIF(Apuestas[Semana], [@Semana])'),
                    'sem-total'
                  )
                }
                className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100"
              >
                {copiedKey === 'sem-total' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Ganadas */}
            <div className="p-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-neutral-900">C2 (Ganadas):</span>
                <span className="font-mono text-neutral-700 ml-2">
                  {isSheets
                    ? isEs ? '=CONTAR.SI.CONJUNTO(Apuestas!$D:$D; A2; Apuestas!$S:$S; "Ganada")' : '=COUNTIFS(Apuestas!$D:$D, A2, Apuestas!$S:$S, "Ganada")'
                    : isEs ? '=CONTAR.SI.CONJUNTO(Apuestas[Semana]; [@Semana]; Apuestas[Resultado]; "Ganada")' : '=COUNTIFS(Apuestas[Semana], [@Semana], Apuestas[Resultado], "Ganada")'}
                </span>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    isSheets
                      ? (isEs ? '=CONTAR.SI.CONJUNTO(Apuestas!$D:$D; A2; Apuestas!$S:$S; "Ganada")' : '=COUNTIFS(Apuestas!$D:$D, A2, Apuestas!$S:$S, "Ganada")')
                      : (isEs ? '=CONTAR.SI.CONJUNTO(Apuestas[Semana]; [@Semana]; Apuestas[Resultado]; "Ganada")' : '=COUNTIFS(Apuestas[Semana], [@Semana], Apuestas[Resultado], "Ganada")'),
                    'sem-won'
                  )
                }
                className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100"
              >
                {copiedKey === 'sem-won' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Perdidas */}
            <div className="p-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-neutral-900">D2 (Perdidas):</span>
                <span className="font-mono text-neutral-700 ml-2">
                  {isSheets
                    ? isEs ? '=CONTAR.SI.CONJUNTO(Apuestas!$D:$D; A2; Apuestas!$S:$S; "Perdida")' : '=COUNTIFS(Apuestas!$D:$D, A2, Apuestas!$S:$S, "Perdida")'
                    : isEs ? '=CONTAR.SI.CONJUNTO(Apuestas[Semana]; [@Semana]; Apuestas[Resultado]; "Perdida")' : '=COUNTIFS(Apuestas[Semana], [@Semana], Apuestas[Resultado], "Perdida")'}
                </span>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    isSheets
                      ? (isEs ? '=CONTAR.SI.CONJUNTO(Apuestas!$D:$D; A2; Apuestas!$S:$S; "Perdida")' : '=COUNTIFS(Apuestas!$D:$D, A2, Apuestas!$S:$S, "Perdida")')
                      : (isEs ? '=CONTAR.SI.CONJUNTO(Apuestas[Semana]; [@Semana]; Apuestas[Resultado]; "Perdida")' : '=COUNTIFS(Apuestas[Semana], [@Semana], Apuestas[Resultado], "Perdida")'),
                    'sem-lost'
                  )
                }
                className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100"
              >
                {copiedKey === 'sem-lost' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* % Acierto */}
            <div className="p-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-neutral-900">G2 (% Acierto):</span>
                <span className="font-mono text-neutral-700 ml-2">
                  {isEs ? '=SI(C2+D2>0; C2/(C2+D2); 0)' : '=IF(C2+D2>0, C2/(C2+D2), 0)'}
                </span>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    isEs ? '=SI(C2+D2>0; C2/(C2+D2); 0)' : '=IF(C2+D2>0, C2/(C2+D2), 0)',
                    'sem-winrate'
                  )
                }
                className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100"
              >
                {copiedKey === 'sem-winrate' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Stake Total */}
            <div className="p-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-neutral-900">H2 (Stake Total):</span>
                <span className="font-mono text-neutral-700 ml-2">
                  {isSheets
                    ? isEs ? '=SUMAR.SI(Apuestas!$D:$D; A2; Apuestas!$O:$O)' : '=SUMIF(Apuestas!$D:$D, A2, Apuestas!$O:$O)'
                    : isEs ? '=SUMAR.SI(Apuestas[Semana]; [@Semana]; Apuestas[Stake])' : '=SUMIF(Apuestas[Semana], [@Semana], Apuestas[Stake])'}
                </span>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    isSheets
                      ? (isEs ? '=SUMAR.SI(Apuestas!$D:$D; A2; Apuestas!$O:$O)' : '=SUMIF(Apuestas!$D:$D, A2, Apuestas!$O:$O)')
                      : (isEs ? '=SUMAR.SI(Apuestas[Semana]; [@Semana]; Apuestas[Stake])' : '=SUMIF(Apuestas[Semana], [@Semana], Apuestas[Stake])'),
                    'sem-stake'
                  )
                }
                className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100"
              >
                {copiedKey === 'sem-stake' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Beneficio Neto */}
            <div className="p-3 flex items-center justify-between bg-emerald-50/30">
              <div>
                <span className="font-bold text-emerald-950">I2 (Beneficio Neto):</span>
                <span className="font-mono font-bold text-emerald-900 ml-2">
                  {isSheets
                    ? isEs ? '=SUMAR.SI(Apuestas!$D:$D; A2; Apuestas!$T:$T)' : '=SUMIF(Apuestas!$D:$D, A2, Apuestas!$T:$T)'
                    : isEs ? '=SUMAR.SI(Apuestas[Semana]; [@Semana]; Apuestas[GananciaPerdida])' : '=SUMIF(Apuestas[Semana], [@Semana], Apuestas[GananciaPerdida])'}
                </span>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    isSheets
                      ? (isEs ? '=SUMAR.SI(Apuestas!$D:$D; A2; Apuestas!$T:$T)' : '=SUMIF(Apuestas!$D:$D, A2, Apuestas!$T:$T)')
                      : (isEs ? '=SUMAR.SI(Apuestas[Semana]; [@Semana]; Apuestas[GananciaPerdida])' : '=SUMIF(Apuestas[Semana], [@Semana], Apuestas[GananciaPerdida])'),
                    'sem-profit'
                  )
                }
                className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100"
              >
                {copiedKey === 'sem-profit' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Yield / ROI */}
            <div className="p-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-neutral-900">J2 (Yield %):</span>
                <span className="font-mono text-neutral-700 ml-2">
                  {isEs ? '=SI(H2>0; I2/H2; 0)' : '=IF(H2>0, I2/H2, 0)'}
                </span>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    isEs ? '=SI(H2>0; I2/H2; 0)' : '=IF(H2>0, I2/H2, 0)',
                    'sem-yield'
                  )
                }
                className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100"
              >
                {copiedKey === 'sem-yield' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Cuota Media */}
            <div className="p-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-neutral-900">K2 (Cuota Media):</span>
                <span className="font-mono text-neutral-700 ml-2">
                  {isSheets
                    ? isEs ? '=SI.ERROR(PROMEDIO.SI(Apuestas!$D:$D; A2; Apuestas!$N:$N); 0)' : '=IFERROR(AVERAGEIF(Apuestas!$D:$D, A2, Apuestas!$N:$N), 0)'
                    : isEs ? '=SI.ERROR(PROMEDIO.SI(Apuestas[Semana]; [@Semana]; Apuestas[Cuota]); 0)' : '=IFERROR(AVERAGEIF(Apuestas[Semana], [@Semana], Apuestas[Cuota]), 0)'}
                </span>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    isSheets
                      ? (isEs ? '=SI.ERROR(PROMEDIO.SI(Apuestas!$D:$D; A2; Apuestas!$N:$N); 0)' : '=IFERROR(AVERAGEIF(Apuestas!$D:$D, A2, Apuestas!$N:$N), 0)')
                      : (isEs ? '=SI.ERROR(PROMEDIO.SI(Apuestas[Semana]; [@Semana]; Apuestas[Cuota]); 0)' : '=IFERROR(AVERAGEIF(Apuestas[Semana], [@Semana], Apuestas[Cuota]), 0)'),
                    'sem-odds'
                  )
                }
                className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100"
              >
                {copiedKey === 'sem-odds' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: PESTAÑA RESUMEN MENSUAL */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
          <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">4</div>
          <h2 className="text-base font-bold text-neutral-900">
            Pestaña: Resumen Mensual & Comparativa
          </h2>
        </div>
        <p className="text-xs text-neutral-600">
          Usa los mismos principios que el resumen semanal pero agrupando por la columna E (<code className="font-mono text-neutral-800">Mes</code>, ej. A2: <code className="font-mono text-neutral-800">2026-03</code>).
        </p>

        <div className="border border-neutral-200 rounded p-3 text-xs bg-neutral-50 space-y-2">
          <div className="font-semibold text-neutral-900">Fórmula de Comparativa Mes Actual vs Mes Anterior:</div>
          <div className="flex items-center justify-between bg-white p-2 border border-neutral-200 rounded font-mono text-2xs">
            <span>
              {isEs
                ? '=SI(ESNUMERO(I3); I2 - I3; "Primer mes base")'
                : '=IF(ISNUMBER(I3), I2 - I3, "First base month")'}
            </span>
            <button
              onClick={() =>
                copyToClipboard(
                  isEs ? '=SI(ESNUMERO(I3); I2 - I3; "Primer mes base")' : '=IF(ISNUMBER(I3), I2 - I3, "First base month")',
                  'mes-comp'
                )
              }
              className="p-1 text-neutral-500 hover:text-neutral-900 rounded"
            >
              {copiedKey === 'mes-comp' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <p className="text-2xs text-neutral-500">
            Donde <strong>I2</strong> es el Beneficio del mes actual e <strong>I3</strong> es el Beneficio del mes previo (si las filas están ordenadas de más reciente a más antiguo).
          </p>
        </div>
      </div>

      {/* SECCIÓN 5: PESTAÑA DASHBOARD */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
          <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">5</div>
          <h2 className="text-base font-bold text-neutral-900">
            Pestaña: Dashboard & Tarjetas KPI
          </h2>
        </div>
        <p className="text-xs text-neutral-600">
          Usa estas fórmulas globales para alimentar las tarjetas métricas del Dashboard:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 border border-neutral-200 rounded bg-neutral-50 space-y-1">
            <span className="font-semibold text-neutral-800">Bankroll Actual:</span>
            <div className="font-mono text-2xs text-neutral-700 bg-white p-1.5 border border-neutral-200 rounded">
              =Configuración!$B$3 + SUMA(Apuestas!$T:$T)
            </div>
          </div>

          <div className="p-3 border border-neutral-200 rounded bg-neutral-50 space-y-1">
            <span className="font-semibold text-neutral-800">Beneficio Total Acumulado:</span>
            <div className="font-mono text-2xs text-neutral-700 bg-white p-1.5 border border-neutral-200 rounded">
              =SUMA(Apuestas!$T:$T)
            </div>
          </div>

          <div className="p-3 border border-neutral-200 rounded bg-neutral-50 space-y-1">
            <span className="font-semibold text-neutral-800">Stake Total Apostado:</span>
            <div className="font-mono text-2xs text-neutral-700 bg-white p-1.5 border border-neutral-200 rounded">
              =SUMA(Apuestas!$O:$O)
            </div>
          </div>

          <div className="p-3 border border-neutral-200 rounded bg-neutral-50 space-y-1">
            <span className="font-semibold text-neutral-800">Yield / ROI Global (%):</span>
            <div className="font-mono text-2xs text-neutral-700 bg-white p-1.5 border border-neutral-200 rounded">
              {isEs
                ? '=SI(SUMA(Apuestas!$O:$O)>0; SUMA(Apuestas!$T:$T)/SUMA(Apuestas!$O:$O); 0)'
                : '=IF(SUM(Apuestas!$O:$O)>0, SUM(Apuestas!$T:$T)/SUM(Apuestas!$O:$O), 0)'}
            </div>
          </div>

          <div className="p-3 border border-neutral-200 rounded bg-neutral-50 space-y-1">
            <span className="font-semibold text-neutral-800">Tasa de Acierto (Win Rate):</span>
            <div className="font-mono text-2xs text-neutral-700 bg-white p-1.5 border border-neutral-200 rounded">
              {isEs
                ? '=CONTAR.SI(Apuestas!$S:$S; "Ganada") / (CONTAR.SI(Apuestas!$S:$S; "Ganada") + CONTAR.SI(Apuestas!$S:$S; "Perdida"))'
                : '=COUNTIF(Apuestas!$S:$S, "Ganada") / (COUNTIF(Apuestas!$S:$S, "Ganada") + COUNTIF(Apuestas!$S:$S, "Perdida"))'}
            </div>
          </div>

          <div className="p-3 border border-neutral-200 rounded bg-neutral-50 space-y-1">
            <span className="font-semibold text-neutral-800">Cuota Media Ponderada:</span>
            <div className="font-mono text-2xs text-neutral-700 bg-white p-1.5 border border-neutral-200 rounded">
              {isEs
                ? '=SUMAPRODUCTO(Apuestas!$N$2:$N$1000; Apuestas!$O$2:$O$1000) / SUMA(Apuestas!$O$2:$O$1000)'
                : '=SUMPRODUCT(Apuestas!$N$2:$N$1000, Apuestas!$O$2:$O$1000) / SUM(Apuestas!$O$2:$O$1000)'}
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 6: PROTECCIÓN Y FORMATO CONDICIONAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Formato Condicional */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-neutral-900">
              Reglas de Formato Condicional
            </h3>
          </div>
          <p className="text-xs text-neutral-600">
            Aplica formato condicional para visualizar instantáneamente el resultado de cada apuesta:
          </p>
          <ul className="text-xs space-y-2">
            <li className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-900">
              <strong>Ganada / Beneficio &gt; 0:</strong> Relleno verde suave (<code className="font-mono">#D1FAE5</code>) y texto verde oscuro (<code className="font-mono">#065F46</code>). Regla: Texto es exactamente "Ganada" o Valor &gt; 0.
            </li>
            <li className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-900">
              <strong>Perdida / Beneficio &lt; 0:</strong> Relleno rojo suave (<code className="font-mono">#FFE4E6</code>) y texto rojo oscuro (<code className="font-mono">#9F1239</code>). Regla: Texto es "Perdida" o Valor &lt; 0.
            </li>
            <li className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900">
              <strong>Pendiente:</strong> Relleno amarillo suave (<code className="font-mono">#FEF3C7</code>) y texto marrón oscuro (<code className="font-mono">#92400E</code>).
            </li>
            <li className="p-2 rounded bg-neutral-100 border border-neutral-200 text-neutral-800">
              <strong>Anulada:</strong> Relleno gris neutro (<code className="font-mono">#F3F4F6</code>) y texto gris oscuro.
            </li>
          </ul>
        </div>

        {/* Protección de Fórmulas */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neutral-700" />
            <h3 className="text-sm font-bold text-neutral-900">
              Cómo Proteger Columnas Calculadas
            </h3>
          </div>
          <p className="text-xs text-neutral-600">
            Para evitar borrar fórmulas por error al tipear rápidamente:
          </p>
          <div className="space-y-2 text-xs text-neutral-700">
            <div className="p-2 bg-neutral-50 rounded border border-neutral-100">
              <strong className="text-neutral-900">En Google Sheets:</strong>
              <p className="mt-0.5">
                Selecciona las columnas <strong>D, E, F, G, P, R, T, U, V, W</strong> &rarr; Click derecho &rarr; <em>Ver más acciones de celda</em> &rarr; <em>Proteger intervalo</em> &rarr; Activar advertencia al editar o restringir a solo tú.
              </p>
            </div>
            <div className="p-2 bg-neutral-50 rounded border border-neutral-100">
              <strong className="text-neutral-900">En Excel:</strong>
              <p className="mt-0.5">
                1. Selecciona toda la hoja y desmarca "Bloqueada" en Formato de Celdas &rarr; Proteger.<br />
                2. Selecciona las columnas con fórmulas y marca "Bloqueada".<br />
                3. Ve a la pestaña <em>Revisar</em> &rarr; <em>Proteger hoja</em>.
              </p>
            </div>
            <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-emerald-950 font-medium">
              <strong>Tip Pro:</strong> Al usar <em>Tablas de Excel (Ctrl + T)</em>, cuando escribes en una fila nueva, Excel autopropaga automáticamente todas las fórmulas sin que tengas que copiarlas ni arrastrarlas.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
