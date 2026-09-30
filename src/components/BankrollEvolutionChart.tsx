import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Bet, AppConfig } from '../types/betting';
import { TrendingUp, TrendingDown, Maximize2, Calendar } from 'lucide-react';

interface BankrollEvolutionChartProps {
  bets: Bet[];
  config: AppConfig;
}

interface ChartPoint {
  id: string;
  fecha: string;
  displayDate: string;
  bankroll: number;
  beneficioAcumulado: number;
  evento: string;
  deporte: string;
  resultado?: string;
  gananciaPerdida?: number;
  cuota?: number;
  stake?: number;
  isInitial?: boolean;
}

export const BankrollEvolutionChart: React.FC<BankrollEvolutionChartProps> = ({
  bets,
  config,
}) => {
  const [timeRange, setTimeRange] = useState<'all' | '30d' | '7d'>('all');

  // Procesar datos para el gráfico
  const chartData: ChartPoint[] = useMemo(() => {
    // Filtrar solo apuestas resueltas y ordenarlas cronológicamente
    const resolved = bets
      .filter((b) => b.resultado === 'Ganada' || b.resultado === 'Perdida')
      .sort((a, b) => {
        const dateCompare = a.fecha.localeCompare(b.fecha);
        if (dateCompare !== 0) return dateCompare;
        return (a.hora || '').localeCompare(b.hora || '');
      });

    // Punto de partida: Bankroll inicial
    const firstDate = resolved.length > 0 ? resolved[0].fecha : 'Inicio';
    const points: ChartPoint[] = [
      {
        id: 'INIT',
        fecha: firstDate,
        displayDate: 'Inicio',
        bankroll: config.bankrollInicial,
        beneficioAcumulado: 0,
        evento: 'Bankroll Inicial',
        deporte: '-',
        isInitial: true,
      },
    ];

    let runningBank = config.bankrollInicial;
    let runningProfit = 0;

    resolved.forEach((b) => {
      runningProfit += b.gananciaPerdida;
      runningBank += b.gananciaPerdida;

      // Formato fecha amigable (ej. 24 Mar)
      let displayDate = b.fecha;
      try {
        const parts = b.fecha.split('-');
        if (parts.length === 3) {
          const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          displayDate = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        }
      } catch (e) {
        displayDate = b.fecha;
      }

      points.push({
        id: b.id,
        fecha: b.fecha,
        displayDate,
        bankroll: Number(runningBank.toFixed(2)),
        beneficioAcumulado: Number(runningProfit.toFixed(2)),
        evento: b.evento,
        deporte: b.deporte,
        resultado: b.resultado,
        gananciaPerdida: b.gananciaPerdida,
        cuota: b.cuota,
        stake: b.stake,
      });
    });

    // Filtro temporal si aplica
    if (timeRange === '7d' && points.length > 8) {
      return [points[0], ...points.slice(-7)];
    }
    if (timeRange === '30d' && points.length > 31) {
      return [points[0], ...points.slice(-30)];
    }

    return points;
  }, [bets, config.bankrollInicial, timeRange]);

  // Estadísticas del gráfico
  const { minVal, maxVal, currentVal, netChange, isPositive } = useMemo(() => {
    if (chartData.length === 0) {
      return { minVal: 0, maxVal: 0, currentVal: 0, netChange: 0, isPositive: true };
    }
    const values = chartData.map((d) => d.bankroll);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const curr = chartData[chartData.length - 1].bankroll;
    const diff = curr - config.bankrollInicial;
    return {
      minVal: min,
      maxVal: max,
      currentVal: curr,
      netChange: diff,
      isPositive: diff >= 0,
    };
  }, [chartData, config.bankrollInicial]);

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ChartPoint = payload[0].payload;
      return (
        <div className="bg-neutral-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1.5 border border-neutral-700 min-w-[200px]">
          <div className="flex items-center justify-between text-2xs text-neutral-400 border-b border-neutral-800 pb-1">
            <span>{data.isInitial ? 'Punto de Partida' : data.fecha}</span>
            <span className="font-mono">{data.id}</span>
          </div>

          <div className="font-semibold text-neutral-100 text-sm">
            {data.evento}
          </div>

          {!data.isInitial && (
            <div className="flex items-center justify-between text-2xs pt-0.5">
              <span className="text-neutral-400">{data.deporte}</span>
              <span
                className={`font-semibold px-1.5 py-0.5 rounded text-2xs ${
                  data.resultado === 'Ganada'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {data.resultado} ({data.gananciaPerdida! >= 0 ? '+' : ''}
                {config.moneda} {data.gananciaPerdida?.toFixed(2)})
              </span>
            </div>
          )}

          <div className="pt-1.5 border-t border-neutral-800 flex items-baseline justify-between">
            <span className="text-neutral-400 text-2xs">Bankroll Acumulado:</span>
            <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
              {config.moneda} {data.bankroll.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between text-2xs text-neutral-400">
            <span>Beneficio Neto:</span>
            <span
              className={`font-mono font-medium ${
                data.beneficioAcumulado >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {data.beneficioAcumulado >= 0 ? '+' : ''}
              {config.moneda} {data.beneficioAcumulado.toFixed(2)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const strokeColor = isPositive ? '#10B981' : '#F43F5E';

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-5">
      {/* Header del Gráfico con Métricas y Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-neutral-900">
              Evolución Temporal del Bankroll (Recharts)
            </h2>
            <span
              className={`inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>
                {isPositive ? '+' : ''}
                {config.moneda} {netChange.toFixed(2)}
              </span>
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Gráfico interactivo de línea con seguimiento secuencial de capital, línea base y tooltips detallados.
          </p>
        </div>

        {/* Controles de Rango Temporal */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-neutral-100 rounded-lg text-2xs font-medium">
            <button
              onClick={() => setTimeRange('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                timeRange === 'all'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Histórico Completo
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                timeRange === '30d'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Últimas 30
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                timeRange === '7d'
                  ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Últimas 7
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor del Gráfico Recharts */}
      <div className="w-full h-64 sm:h-72">
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              
              <XAxis
                dataKey="displayDate"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                dy={6}
              />
              
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                domain={['auto', 'auto']}
                tickFormatter={(val) => `${config.moneda} ${val}`}
                dx={-4}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Línea base de referencia: Bankroll Inicial */}
              <ReferenceLine
                y={config.bankrollInicial}
                stroke="#94A3B8"
                strokeDasharray="4 4"
                label={{
                  value: `Base: ${config.moneda} ${config.bankrollInicial}`,
                  position: 'insideBottomRight',
                  fill: '#64748B',
                  fontSize: 10,
                }}
              />

              {/* Línea principal de evolución */}
              <Line
                type="monotone"
                dataKey="bankroll"
                stroke={strokeColor}
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#FFFFFF', stroke: strokeColor, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: strokeColor, stroke: '#FFFFFF', strokeWidth: 2 }}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-xs text-neutral-400 border border-dashed border-neutral-200 rounded-lg">
            <Calendar className="w-6 h-6 mb-2 text-neutral-300" />
            <p>Se requieren apuestas resueltas para trazar el gráfico de Recharts.</p>
          </div>
        )}
      </div>

      {/* Mini Resumen de Referencias en el pie */}
      <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between text-2xs text-neutral-500 font-mono">
        <div className="flex items-center gap-4">
          <span>
            Punto Inicial: <strong>{config.moneda} {config.bankrollInicial.toLocaleString()}</strong>
          </span>
          <span>
            Pico Máximo: <strong>{config.moneda} {maxVal.toLocaleString()}</strong>
          </span>
          <span>
            Punto Mínimo: <strong>{config.moneda} {minVal.toLocaleString()}</strong>
          </span>
        </div>
        <div>
          <span>
            Saldo Final:{' '}
            <strong className={isPositive ? 'text-emerald-600' : 'text-rose-600'}>
              {config.moneda} {currentVal.toLocaleString()}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
