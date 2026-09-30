import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Percent, 
  Activity, 
  Flame, 
  ShieldAlert, 
  Filter,
  RotateCcw
} from 'lucide-react';
import { Bet, AppConfig } from '../types/betting';
import { calculateKPIs, generateMonthlySummaries } from '../utils/calculations';
import { BankrollEvolutionChart } from './BankrollEvolutionChart';

interface DashboardTabProps {
  bets: Bet[];
  config: AppConfig;
  onNavigateToTab: (tab: string) => void;
  onOpenNewBet: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  bets,
  config,
  onNavigateToTab,
  onOpenNewBet,
}) => {
  // Filtros interactivos del Dashboard
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('all');
  const [minOdds, setMinOdds] = useState<string>('');
  const [maxOdds, setMaxOdds] = useState<string>('');

  // Filtrado de apuestas
  const filteredBets = useMemo(() => {
    return bets.filter((b) => {
      if (selectedSport !== 'all' && b.deporte !== selectedSport) return false;
      if (selectedType !== 'all' && b.tipo !== selectedType) return false;
      if (selectedStrategy !== 'all' && b.estrategia !== selectedStrategy) return false;
      if (minOdds && b.cuota < parseFloat(minOdds)) return false;
      if (maxOdds && b.cuota > parseFloat(maxOdds)) return false;
      return true;
    });
  }, [bets, selectedSport, selectedType, selectedStrategy, minOdds, maxOdds]);

  const kpis = useMemo(() => {
    return calculateKPIs(filteredBets, config.bankrollInicial);
  }, [filteredBets, config.bankrollInicial]);

  const monthlyData = useMemo(() => {
    return generateMonthlySummaries(filteredBets);
  }, [filteredBets]);

  // Rendimiento por Deporte
  const sportStats = useMemo(() => {
    const stats: Record<string, { total: number; profit: number; won: number }> = {};
    filteredBets.forEach((b) => {
      if (!stats[b.deporte]) stats[b.deporte] = { total: 0, profit: 0, won: 0 };
      stats[b.deporte].total++;
      stats[b.deporte].profit += b.gananciaPerdida;
      if (b.resultado === 'Ganada') stats[b.deporte].won++;
    });
    return Object.entries(stats).map(([deporte, data]) => ({
      deporte,
      total: data.total,
      profit: Number(data.profit.toFixed(2)),
      winRate: data.total > 0 ? Number(((data.won / data.total) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.profit - a.profit);
  }, [filteredBets]);

  // Rendimiento por Estrategia
  const strategyStats = useMemo(() => {
    const stats: Record<string, { total: number; profit: number; won: number }> = {};
    filteredBets.forEach((b) => {
      if (!stats[b.estrategia]) stats[b.estrategia] = { total: 0, profit: 0, won: 0 };
      stats[b.estrategia].total++;
      stats[b.estrategia].profit += b.gananciaPerdida;
      if (b.resultado === 'Ganada') stats[b.estrategia].won++;
    });
    return Object.entries(stats).map(([estrategia, data]) => ({
      estrategia,
      total: data.total,
      profit: Number(data.profit.toFixed(2)),
      winRate: data.total > 0 ? Number(((data.won / data.total) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.profit - a.profit);
  }, [filteredBets]);

  // Rendimiento por Tipo de Apuesta
  const typeStats = useMemo(() => {
    const stats: Record<string, { total: number; profit: number; won: number; settled: number }> = {};
    filteredBets.forEach((b) => {
      if (!stats[b.tipo]) stats[b.tipo] = { total: 0, profit: 0, won: 0, settled: 0 };
      stats[b.tipo].total++;
      stats[b.tipo].profit += b.gananciaPerdida;
      if (b.resultado === 'Ganada') {
        stats[b.tipo].won++;
        stats[b.tipo].settled++;
      } else if (b.resultado === 'Perdida') {
        stats[b.tipo].settled++;
      }
    });
    return Object.entries(stats).map(([tipo, data]) => ({
      tipo,
      total: data.total,
      profit: Number(data.profit.toFixed(2)),
      winRate: data.settled > 0 ? Number(((data.won / data.settled) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.profit - a.profit);
  }, [filteredBets]);

  const hasActiveFilters = 
    selectedSport !== 'all' || 
    selectedType !== 'all' || 
    selectedStrategy !== 'all' || 
    minOdds !== '' || 
    maxOdds !== '';

  const resetFilters = () => {
    setSelectedSport('all');
    setSelectedType('all');
    setSelectedStrategy('all');
    setMinOdds('');
    setMaxOdds('');
  };

  return (
    <div className="space-y-6">
      {/* Top summary bar & Filters */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Dashboard de Rendimiento & Analytics
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Monitoreo en tiempo real de bankroll, métricas avanzadas de yield, ROI y evaluación de estrategias.
            </p>
          </div>

          {/* Filtros interactivos */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtros:</span>
            </div>

            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="text-xs bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            >
              <option value="all">Todos los deportes</option>
              {config.deportes.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            >
              <option value="all">Todos los tipos</option>
              {config.tiposApuesta.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="text-xs bg-neutral-50 border border-neutral-200 rounded-md px-2.5 py-1.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            >
              <option value="all">Todas las estrategias</option>
              {config.estrategias.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.05"
                placeholder="Cuota Min"
                value={minOdds}
                onChange={(e) => setMinOdds(e.target.value)}
                className="w-20 text-xs bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
              <span className="text-neutral-400 text-xs">-</span>
              <input
                type="number"
                step="0.05"
                placeholder="Cuota Max"
                value={maxOdds}
                onChange={(e) => setMaxOdds(e.target.value)}
                className="w-20 text-xs bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 px-2 py-1.5 border border-red-200 bg-red-50 rounded-md"
                title="Limpiar filtros"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid de KPIs Principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Bankroll Actual */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Bankroll Actual</span>
            <DollarSign className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-neutral-900 tabular-nums">
              {config.moneda} {kpis.bankrollActual.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-1 text-xs text-neutral-500 flex items-center gap-1">
            <span>Inicial:</span>
            <span className="font-mono tabular-nums">{config.moneda} {config.bankrollInicial.toLocaleString()}</span>
            <span className="mx-1">·</span>
            <span className={kpis.beneficioTotal >= 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
              {kpis.beneficioTotal >= 0 ? '+' : ''}{config.moneda} {kpis.beneficioTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Beneficio Neto & Yield */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Beneficio Neto Total</span>
            {kpis.beneficioTotal >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${
              kpis.beneficioTotal >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {kpis.beneficioTotal >= 0 ? '+' : ''}{config.moneda} {kpis.beneficioTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-1 text-xs text-neutral-500 flex items-center gap-1">
            <span>Yield:</span>
            <span className={`font-mono font-semibold tabular-nums ${
              kpis.yieldGlobal >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {kpis.yieldGlobal >= 0 ? '+' : ''}{kpis.yieldGlobal}%
            </span>
            <span className="mx-1">·</span>
            <span>Stake:</span>
            <span className="font-mono tabular-nums">{config.moneda} {kpis.stakeTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* % Acierto & Total Apuestas */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Tasa de Acierto (Win Rate)</span>
            <Target className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-neutral-900 tabular-nums">
              {kpis.porcAcierto}%
            </span>
            <span className="text-xs text-neutral-500">
              ({kpis.ganadas}G / {kpis.perdidas}P)
            </span>
          </div>
          <div className="mt-1 text-xs text-neutral-500 flex items-center gap-1">
            <span>Total:</span>
            <span className="font-mono font-medium tabular-nums">{kpis.totalApuestas}</span>
            <span className="mx-1">·</span>
            <span className="text-amber-600 font-mono tabular-nums">{kpis.pendientes} pend.</span>
            <span className="mx-1">·</span>
            <span className="text-neutral-500 font-mono tabular-nums">{kpis.anuladas} anul.</span>
          </div>
        </div>

        {/* Cuota Media & Racha */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <span>Cuota Media & Racha</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-neutral-900 tabular-nums">
              @{kpis.cuotaMedia}
            </span>
            <span className="text-xs text-neutral-500">
              (Stake: {config.moneda} {kpis.stakeMedio})
            </span>
          </div>
          <div className="mt-1 text-xs text-neutral-500 flex items-center gap-1">
            <span>Racha actual:</span>
            <span className={`font-semibold font-mono tabular-nums ${
              kpis.rachaActual.tipo === 'ganadora' ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {kpis.rachaActual.conteo} {kpis.rachaActual.tipo === 'ganadora' ? 'Ganadas' : kpis.rachaActual.tipo === 'perdedora' ? 'Perdidas' : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Fila secundaria de KPIs: Drawdown, Máx Racha, Stake Recomendado */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <div>
              <div className="text-xs font-medium text-neutral-700">Máximo Drawdown (MDD)</div>
              <div className="text-xs text-neutral-500">Caída máxima desde el pico</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold font-mono text-rose-600 tabular-nums">
              -{config.moneda} {kpis.maxDrawdown.monto.toFixed(2)}
            </div>
            <div className="text-xs font-mono text-neutral-500 tabular-nums">
              ({kpis.maxDrawdown.porcentaje.toFixed(1)}%)
            </div>
          </div>
        </div>

        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-emerald-500" />
            <div>
              <div className="text-xs font-medium text-neutral-700">Rachas Históricas</div>
              <div className="text-xs text-neutral-500">Picos de varianza</div>
            </div>
          </div>
          <div className="text-right text-xs font-mono">
            <div className="text-emerald-600 font-semibold tabular-nums">
              Max G: {kpis.maxRachaGanadora} consecutivas
            </div>
            <div className="text-rose-600 font-semibold tabular-nums">
              Max P: {kpis.maxRachaPerdedora} consecutivas
            </div>
          </div>
        </div>

        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Percent className="w-4 h-4 text-indigo-500" />
            <div>
              <div className="text-xs font-medium text-neutral-700">Gestión de Bankroll</div>
              <div className="text-xs text-neutral-500">Stake recomendado ({config.stakeRecomendadoPorc}%)</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold font-mono text-neutral-900 tabular-nums">
              {config.moneda} {((kpis.bankrollActual * config.stakeRecomendadoPorc) / 100).toFixed(2)}
            </div>
            <div className="text-xs text-neutral-500">
              1 Unidad = {config.moneda} {config.valorUnidad}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico 1: Evolución del Bankroll con Recharts */}
      <BankrollEvolutionChart bets={filteredBets} config={config} />

      {/* Grid de 3 Gráficos: Meses, Deportes, Estrategias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Beneficio por Mes */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-900">Beneficio por Mes</h2>
            <button
              onClick={() => onNavigateToTab('mensual')}
              className="text-xs text-neutral-500 hover:text-neutral-900 font-medium"
            >
              Ver tabla
            </button>
          </div>

          <div className="space-y-3">
            {monthlyData.length > 0 ? (
              monthlyData.map((m) => {
                const maxAbs = Math.max(...monthlyData.map((x) => Math.abs(x.beneficioNeto)), 1);
                const pct = Math.min(100, Math.round((Math.abs(m.beneficioNeto) / maxAbs) * 100));
                const isPositive = m.beneficioNeto >= 0;

                return (
                  <div key={m.mes} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-neutral-800">{m.nombreMes}</span>
                      <span className={`font-mono font-semibold tabular-nums ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isPositive ? '+' : ''}{config.moneda} {m.beneficioNeto.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-2xs text-neutral-400">
                      <span>{m.totalApuestas} apuestas ({m.porcAcierto}% acierto)</span>
                      <span>Yield: {m.yield}%</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-neutral-400 py-6 text-center">No hay registros mensuales.</div>
            )}
          </div>
        </div>

        {/* 2. Rendimiento por Deporte */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-900">Beneficio por Deporte</h2>
            <span className="text-xs text-neutral-400">{sportStats.length} deportes</span>
          </div>

          <div className="space-y-3">
            {sportStats.length > 0 ? (
              sportStats.map((s) => {
                const maxAbs = Math.max(...sportStats.map((x) => Math.abs(x.profit)), 1);
                const pct = Math.min(100, Math.round((Math.abs(s.profit) / maxAbs) * 100));
                const isPositive = s.profit >= 0;

                return (
                  <div key={s.deporte} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-neutral-800">{s.deporte}</span>
                      <span className={`font-mono font-semibold tabular-nums ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isPositive ? '+' : ''}{config.moneda} {s.profit.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-2xs text-neutral-400">
                      <span>{s.total} apuestas</span>
                      <span>{s.winRate}% win rate</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-neutral-400 py-6 text-center">Sin datos de deportes.</div>
            )}
          </div>
        </div>

        {/* 3. Rendimiento por Estrategia */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-900">Beneficio por Estrategia</h2>
            <span className="text-xs text-neutral-400">{strategyStats.length} activas</span>
          </div>

          <div className="space-y-3">
            {strategyStats.length > 0 ? (
              strategyStats.map((st) => {
                const maxAbs = Math.max(...strategyStats.map((x) => Math.abs(x.profit)), 1);
                const pct = Math.min(100, Math.round((Math.abs(st.profit) / maxAbs) * 100));
                const isPositive = st.profit >= 0;

                return (
                  <div key={st.estrategia} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-neutral-800 truncate max-w-[170px]" title={st.estrategia}>
                        {st.estrategia}
                      </span>
                      <span className={`font-mono font-semibold tabular-nums ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isPositive ? '+' : ''}{config.moneda} {st.profit.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-2xs text-neutral-400">
                      <span>{st.total} apuestas</span>
                      <span>{st.winRate}% win rate</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-neutral-400 py-6 text-center">Sin datos de estrategias.</div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla Resumen por Tipo de Apuesta & Distribución de Resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Tipos de Apuesta */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-3">
            Rendimiento por Tipo de Apuesta
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500">
                  <th className="pb-2 font-medium">Tipo de Apuesta</th>
                  <th className="pb-2 font-medium text-right">Apuestas</th>
                  <th className="pb-2 font-medium text-right">% Acierto</th>
                  <th className="pb-2 font-medium text-right">Beneficio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {typeStats.map((t) => (
                  <tr key={t.tipo} className="hover:bg-neutral-50">
                    <td className="py-2.5 font-medium text-neutral-800">{t.tipo}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-neutral-600">{t.total}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-neutral-700">{t.winRate}%</td>
                    <td className={`py-2.5 text-right font-mono font-semibold tabular-nums ${
                      t.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {t.profit >= 0 ? '+' : ''}{config.moneda} {t.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Distribución de Resultados */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-3">
            Distribución Total de Resultados
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-md">
              <div className="text-2xs font-semibold text-emerald-800 uppercase tracking-wider">Ganadas</div>
              <div className="text-xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">{kpis.ganadas}</div>
              <div className="text-2xs text-emerald-600 mt-0.5">
                {kpis.totalApuestas > 0 ? ((kpis.ganadas / kpis.totalApuestas) * 100).toFixed(1) : 0}% del total
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-100 rounded-md">
              <div className="text-2xs font-semibold text-rose-800 uppercase tracking-wider">Perdidas</div>
              <div className="text-xl font-bold font-mono text-rose-700 mt-1 tabular-nums">{kpis.perdidas}</div>
              <div className="text-2xs text-rose-600 mt-0.5">
                {kpis.totalApuestas > 0 ? ((kpis.perdidas / kpis.totalApuestas) * 100).toFixed(1) : 0}% del total
              </div>
            </div>

            <div className="p-3 bg-neutral-100 border border-neutral-200 rounded-md">
              <div className="text-2xs font-semibold text-neutral-700 uppercase tracking-wider">Anuladas</div>
              <div className="text-xl font-bold font-mono text-neutral-800 mt-1 tabular-nums">{kpis.anuladas}</div>
              <div className="text-2xs text-neutral-500 mt-0.5">
                {kpis.totalApuestas > 0 ? ((kpis.anuladas / kpis.totalApuestas) * 100).toFixed(1) : 0}% del total
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-100 rounded-md">
              <div className="text-2xs font-semibold text-amber-800 uppercase tracking-wider">Pendientes</div>
              <div className="text-xl font-bold font-mono text-amber-700 mt-1 tabular-nums">{kpis.pendientes}</div>
              <div className="text-2xs text-amber-600 mt-0.5">
                {kpis.totalApuestas > 0 ? ((kpis.pendientes / kpis.totalApuestas) * 100).toFixed(1) : 0}% del total
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>¿Deseas registrar un nuevo pronóstico?</span>
            <button
              onClick={onOpenNewBet}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
            >
              + Añadir apuesta fila por fila
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
