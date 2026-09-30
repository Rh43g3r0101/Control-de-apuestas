import React, { useState } from 'react';
import { CalendarDays, TrendingUp, TrendingDown, Layers, Trophy, Bookmark } from 'lucide-react';
import { MonthlySummary, AppConfig } from '../types/betting';

interface MonthlySummaryTabProps {
  monthlyData: MonthlySummary[];
  config: AppConfig;
}

export const MonthlySummaryTab: React.FC<MonthlySummaryTabProps> = ({
  monthlyData,
  config,
}) => {
  const [selectedMonthCode, setSelectedMonthCode] = useState<string>(
    monthlyData[0]?.mes || ''
  );

  const selectedMonth = monthlyData.find((m) => m.mes === selectedMonthCode) || monthlyData[0];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-neutral-200 rounded-lg p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Resumen Mensual & Comparativa
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Agrupación por mes (ej. 2026-03), comparativa mes actual vs anterior y desglose tridimensional (Deporte, Tipo, Estrategia).
            </p>
          </div>

          {/* Selector de mes para análisis profundo */}
          {monthlyData.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-medium">Ver detalles de:</span>
              <select
                value={selectedMonthCode || selectedMonth?.mes}
                onChange={(e) => setSelectedMonthCode(e.target.value)}
                className="text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-md px-3 py-1.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                {monthlyData.map((m) => (
                  <option key={m.mes} value={m.mes}>{m.nombreMes}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tabla general de meses */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Mes</th>
                <th className="py-3 px-3 text-right">Apuestas</th>
                <th className="py-3 px-3 text-center">G / P / A / Pend</th>
                <th className="py-3 px-3 text-right">% Acierto</th>
                <th className="py-3 px-3 text-right">Cuota Media</th>
                <th className="py-3 px-3 text-right">Stake Total</th>
                <th className="py-3 px-3 text-right">Beneficio Neto</th>
                <th className="py-3 px-3 text-right">Yield (%)</th>
                <th className="py-3 px-3 text-right">Var. vs Mes Anterior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {monthlyData.length > 0 ? (
                monthlyData.map((m) => {
                  const isPositive = m.beneficioNeto >= 0;
                  const isSelected = selectedMonth?.mes === m.mes;

                  return (
                    <tr
                      key={m.mes}
                      onClick={() => setSelectedMonthCode(m.mes)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-neutral-100/80 font-medium' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-neutral-900 flex items-center gap-2">
                        <CalendarDays className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{m.nombreMes}</span>
                        <span className="text-2xs font-mono font-normal text-neutral-400">({m.mes})</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {m.totalApuestas}
                      </td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums text-xs">
                        <span className="text-emerald-700 font-semibold">{m.ganadas}G</span>
                        <span className="text-neutral-300 mx-1">/</span>
                        <span className="text-rose-700 font-semibold">{m.perdidas}P</span>
                        <span className="text-neutral-300 mx-1">/</span>
                        <span className="text-neutral-600">{m.anuladas}A</span>
                        <span className="text-neutral-300 mx-1">/</span>
                        <span className="text-amber-600">{m.pendientes}p</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-neutral-800">
                        {m.porcAcierto}%
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-600">
                        @{m.cuotaMedia}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {config.moneda} {m.stakeTotal.toFixed(2)}
                      </td>
                      <td className={`py-3 px-3 text-right font-mono font-bold tabular-nums ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isPositive ? '+' : ''}{config.moneda} {m.beneficioNeto.toFixed(2)}
                      </td>
                      <td className={`py-3 px-3 text-right font-mono font-bold tabular-nums ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isPositive ? '+' : ''}{m.yield}%
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums">
                        {m.diferenciaBeneficioVsAnterior !== undefined ? (
                          <span className={`inline-flex items-center gap-1 font-semibold ${
                            m.diferenciaBeneficioVsAnterior >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {m.diferenciaBeneficioVsAnterior >= 0 ? '+' : ''}
                            {config.moneda} {m.diferenciaBeneficioVsAnterior.toFixed(2)}
                            {m.porcCambioVsAnterior !== undefined && (
                              <span className="text-2xs font-normal">
                                ({m.porcCambioVsAnterior >= 0 ? '+' : ''}{m.porcCambioVsAnterior}%)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-neutral-400">1er mes base</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-neutral-500">
                    No hay apuestas registradas para generar el resumen mensual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Desglose tridimensional para el mes seleccionado */}
      {selectedMonth && (
        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Desglose Detallado de {selectedMonth.nombreMes}
              </h2>
              <p className="text-xs text-neutral-500">
                Beneficio neto generado por cada categoría durante este mes.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-neutral-500">Balance del mes:</span>
              <div className={`text-base font-bold font-mono ${
                selectedMonth.beneficioNeto >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {selectedMonth.beneficioNeto >= 0 ? '+' : ''}{config.moneda} {selectedMonth.beneficioNeto.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Por Deporte */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Por Deporte</span>
              </div>
              <div className="space-y-2">
                {Object.entries(selectedMonth.deporteDesglose).map(([deporte, beneficio]) => (
                  <div key={deporte} className="flex items-center justify-between text-xs py-1 border-b border-neutral-50">
                    <span className="text-neutral-700">{deporte}</span>
                    <span className={`font-mono font-bold tabular-nums ${
                      beneficio >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {beneficio >= 0 ? '+' : ''}{config.moneda} {beneficio.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Por Tipo de Apuesta */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Por Tipo de Apuesta</span>
              </div>
              <div className="space-y-2">
                {Object.entries(selectedMonth.tipoDesglose).map(([tipo, beneficio]) => (
                  <div key={tipo} className="flex items-center justify-between text-xs py-1 border-b border-neutral-50">
                    <span className="text-neutral-700">{tipo}</span>
                    <span className={`font-mono font-bold tabular-nums ${
                      beneficio >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {beneficio >= 0 ? '+' : ''}{config.moneda} {beneficio.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Por Estrategia */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
                <Bookmark className="w-4 h-4 text-emerald-500" />
                <span>Por Estrategia</span>
              </div>
              <div className="space-y-2">
                {Object.entries(selectedMonth.estrategiaDesglose).map(([estrategia, beneficio]) => (
                  <div key={estrategia} className="flex items-center justify-between text-xs py-1 border-b border-neutral-50">
                    <span className="text-neutral-700 truncate max-w-[150px]" title={estrategia}>
                      {estrategia}
                    </span>
                    <span className={`font-mono font-bold tabular-nums ${
                      beneficio >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {beneficio >= 0 ? '+' : ''}{config.moneda} {beneficio.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
