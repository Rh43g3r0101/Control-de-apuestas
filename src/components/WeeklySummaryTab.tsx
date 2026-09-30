import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { WeeklySummary, AppConfig } from '../types/betting';

interface WeeklySummaryTabProps {
  weeklyData: WeeklySummary[];
  config: AppConfig;
}

export const WeeklySummaryTab: React.FC<WeeklySummaryTabProps> = ({
  weeklyData,
  config,
}) => {
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  const toggleExpand = (semana: string) => {
    setExpandedWeek(expandedWeek === semana ? null : semana);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-lg p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Resumen Semanal Automatizado
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Agrupación por semana ISO (ej. 2026-S13). Se actualiza de inmediato al agregar, editar o resolver apuestas.
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded">
            {weeklyData.length} Semanas registradas
          </span>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Semana ISO</th>
                <th className="py-3 px-3 text-right">Apuestas</th>
                <th className="py-3 px-3 text-center">G / P / A / Pend</th>
                <th className="py-3 px-3 text-right">% Acierto</th>
                <th className="py-3 px-3 text-right">Cuota Media</th>
                <th className="py-3 px-3 text-right">Stake Total</th>
                <th className="py-3 px-3 text-right">Beneficio Neto</th>
                <th className="py-3 px-3 text-right">Yield (%)</th>
                <th className="py-3 px-3 text-center">Desglose Tipos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {weeklyData.length > 0 ? (
                weeklyData.map((w) => {
                  const isPositive = w.beneficioNeto >= 0;
                  const isExpanded = expandedWeek === w.semana;

                  return (
                    <React.Fragment key={w.semana}>
                      <tr className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-neutral-900 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{w.semana}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-medium tabular-nums text-neutral-700">
                          {w.totalApuestas}
                        </td>
                        <td className="py-3 px-3 text-center font-mono tabular-nums text-xs">
                          <span className="text-emerald-700 font-semibold">{w.ganadas}G</span>
                          <span className="text-neutral-300 mx-1">/</span>
                          <span className="text-rose-700 font-semibold">{w.perdidas}P</span>
                          <span className="text-neutral-300 mx-1">/</span>
                          <span className="text-neutral-600">{w.anuladas}A</span>
                          <span className="text-neutral-300 mx-1">/</span>
                          <span className="text-amber-600">{w.pendientes}pend</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-neutral-800">
                          {w.porcAcierto}%
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-600">
                          @{w.cuotaMedia}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-700">
                          {config.moneda} {w.stakeTotal.toFixed(2)}
                        </td>
                        <td className={`py-3 px-3 text-right font-mono font-bold tabular-nums ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isPositive ? '+' : ''}{config.moneda} {w.beneficioNeto.toFixed(2)}
                        </td>
                        <td className={`py-3 px-3 text-right font-mono font-bold tabular-nums ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isPositive ? '+' : ''}{w.yield}%
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => toggleExpand(w.semana)}
                            className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded transition-colors"
                          >
                            <span>{isExpanded ? 'Ocultar' : 'Ver'}</span>
                            {isExpanded ? (
                              <ChevronDown className="w-3 h-3" />
                            ) : (
                              <ChevronRight className="w-3 h-3" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Fila expandible con desglose por tipo de apuesta */}
                      {isExpanded && (
                        <tr className="bg-neutral-50/70 border-b border-neutral-200">
                          <td colSpan={9} className="py-3 px-6">
                            <div className="text-xs font-semibold text-neutral-700 mb-2">
                              Desglose por Tipo de Apuesta en {w.semana}:
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {Object.entries(w.tipoDesglose).map(([tipo, data]) => (
                                <div key={tipo} className="bg-white border border-neutral-200 rounded p-2.5">
                                  <div className="font-medium text-neutral-800 text-2xs truncate" title={tipo}>
                                    {tipo}
                                  </div>
                                  <div className="flex items-baseline justify-between mt-1 text-xs">
                                    <span className="text-neutral-500 font-mono">{data.total} ap.</span>
                                    <span className={`font-mono font-bold tabular-nums ${
                                      data.beneficio >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                    }`}>
                                      {data.beneficio >= 0 ? '+' : ''}{config.moneda} {data.beneficio.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-neutral-500">
                    No hay apuestas registradas para generar el resumen semanal.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
