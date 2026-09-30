import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Copy, 
  ArrowUpDown, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Clock,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { Bet, BetResult, AppConfig } from '../types/betting';

interface BetsTabProps {
  bets: Bet[];
  config: AppConfig;
  onOpenNewBet: () => void;
  onOpenGoogleSheets?: () => void;
  onEditBet: (bet: Bet) => void;
  onDeleteBet: (id: string) => void;
  onDuplicateBet: (bet: Bet) => void;
  onUpdateResult: (id: string, newResult: BetResult) => void;
}

export const BetsTab: React.FC<BetsTabProps> = ({
  bets,
  config,
  onOpenNewBet,
  onOpenGoogleSheets,
  onEditBet,
  onDeleteBet,
  onDuplicateBet,
  onUpdateResult,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSport, setFilterSport] = useState('all');
  const [filterResult, setFilterResult] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStrategy, setFilterStrategy] = useState('all');
  const [sortField, setSortField] = useState<keyof Bet>('fecha');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtrado
  const filteredBets = useMemo(() => {
    return bets.filter((b) => {
      if (filterSport !== 'all' && b.deporte !== filterSport) return false;
      if (filterResult !== 'all' && b.resultado !== filterResult) return false;
      if (filterType !== 'all' && b.tipo !== filterType) return false;
      if (filterStrategy !== 'all' && b.estrategia !== filterStrategy) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const match =
          b.evento.toLowerCase().includes(query) ||
          b.competicion.toLowerCase().includes(query) ||
          b.descripcion.toLowerCase().includes(query) ||
          b.id.toLowerCase().includes(query) ||
          b.notas.toLowerCase().includes(query);
        if (!match) return false;
      }
      return true;
    });
  }, [bets, filterSport, filterResult, filterType, filterStrategy, searchTerm]);

  // Ordenamiento
  const sortedBets = useMemo(() => {
    return [...filteredBets].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredBets, sortField, sortOrder]);

  const toggleSort = (field: keyof Bet) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Totales de la selección filtrada
  const summaryTotals = useMemo(() => {
    let stakeTotal = 0;
    let profitTotal = 0;
    let totalBets = sortedBets.length;
    let cuotaSum = 0;

    sortedBets.forEach((b) => {
      stakeTotal += b.stake;
      profitTotal += b.gananciaPerdida;
      cuotaSum += b.cuota;
    });

    const avgOdds = totalBets > 0 ? Number((cuotaSum / totalBets).toFixed(2)) : 0;
    const roi = stakeTotal > 0 ? Number(((profitTotal / stakeTotal) * 100).toFixed(1)) : 0;

    return {
      stakeTotal,
      profitTotal,
      avgOdds,
      roi,
      totalBets,
    };
  }, [sortedBets]);

  const renderResultBadge = (resultado: BetResult, betId: string) => {
    return (
      <select
        value={resultado}
        onChange={(e) => onUpdateResult(betId, e.target.value as BetResult)}
        className={`text-xs font-semibold px-2 py-1 rounded border focus:outline-none focus:ring-1 cursor-pointer transition-colors ${
          resultado === 'Ganada'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500'
            : resultado === 'Perdida'
            ? 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-500'
            : resultado === 'Anulada'
            ? 'bg-neutral-100 text-neutral-700 border-neutral-300 focus:ring-neutral-500'
            : 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500'
        }`}
      >
        <option value="Ganada">Ganada</option>
        <option value="Perdida">Perdida</option>
        <option value="Anulada">Anulada</option>
        <option value="Pendiente">Pendiente</option>
      </select>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-white border border-neutral-200 rounded-lg p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Libro de Registro de Apuestas (Fila por Fila)
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Todas las columnas calculadas (Semana, Mes, Año, Día, Ganancia/Pérdida, ROI, Banco) se actualizan en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {onOpenGoogleSheets && (
              <button
                onClick={onOpenGoogleSheets}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-md hover:bg-emerald-100 transition-colors shadow-xs whitespace-nowrap"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Google Sheets</span>
              </button>
            )}

            <button
              onClick={onOpenNewBet}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors shadow-xs whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Apuesta</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar evento, notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          {/* Deporte */}
          <select
            value={filterSport}
            onChange={(e) => setFilterSport(e.target.value)}
            className="text-xs bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="all">Todos los deportes</option>
            {config.deportes.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Resultado */}
          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="text-xs bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="all">Todos los resultados</option>
            <option value="Ganada">Ganada</option>
            <option value="Perdida">Perdida</option>
            <option value="Anulada">Anulada</option>
            <option value="Pendiente">Pendiente</option>
          </select>

          {/* Tipo de Apuesta */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="all">Todos los tipos</option>
            {config.tiposApuesta.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Estrategia */}
          <select
            value={filterStrategy}
            onChange={(e) => setFilterStrategy(e.target.value)}
            className="text-xs bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            <option value="all">Todas las estrategias</option>
            {config.estrategias.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Tabla Estructurada */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[640px]">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold sticky top-0 z-10">
              <tr>
                <th 
                  onClick={() => toggleSort('id')} 
                  className="py-3 px-3 cursor-pointer hover:bg-neutral-100"
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('fecha')} 
                  className="py-3 px-3 cursor-pointer hover:bg-neutral-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Fecha & Hora</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-neutral-400">Semana</th>
                <th className="py-3 px-3">Deporte / Competición</th>
                <th className="py-3 px-3">Evento / Partido</th>
                <th className="py-3 px-3">Tipo & Estrategia</th>
                <th 
                  onClick={() => toggleSort('cuota')} 
                  className="py-3 px-3 text-right cursor-pointer hover:bg-neutral-100"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Cuota</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('stake')} 
                  className="py-3 px-3 text-right cursor-pointer hover:bg-neutral-100"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Stake</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Potencial</th>
                <th className="py-3 px-3 text-center">Resultado</th>
                <th 
                  onClick={() => toggleSort('gananciaPerdida')} 
                  className="py-3 px-3 text-right cursor-pointer hover:bg-neutral-100"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Ganancia/Pérdida</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">ROI (%)</th>
                <th className="py-3 px-3 text-right text-neutral-400">Banco Después</th>
                <th className="py-3 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-normal">
              {sortedBets.length > 0 ? (
                sortedBets.map((b) => {
                  const isWon = b.resultado === 'Ganada';
                  const isLost = b.resultado === 'Perdida';
                  const isPending = b.resultado === 'Pendiente';

                  return (
                    <tr 
                      key={b.id} 
                      className={`hover:bg-neutral-50/80 transition-colors ${
                        isPending ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="py-2.5 px-3 font-mono font-medium text-neutral-700">
                        {b.id}
                      </td>

                      {/* Fecha / Hora */}
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-neutral-900">{b.fecha}</div>
                        <div className="text-2xs text-neutral-400">{b.dia} · {b.hora}</div>
                      </td>

                      {/* Semana */}
                      <td className="py-2.5 px-3 font-mono text-2xs text-neutral-500">
                        {b.semana}
                      </td>

                      {/* Deporte / Competición */}
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-neutral-800">{b.deporte}</div>
                        <div className="text-2xs text-neutral-500 truncate max-w-[140px]" title={b.competicion}>
                          {b.competicion}
                        </div>
                      </td>

                      {/* Evento & Descripción */}
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-neutral-900 max-w-[200px] truncate" title={b.evento}>
                          {b.evento}
                        </div>
                        <div className="text-2xs text-neutral-500 max-w-[200px] truncate" title={b.descripcion}>
                          {b.descripcion}
                        </div>
                      </td>

                      {/* Tipo & Estrategia */}
                      <td className="py-2.5 px-3">
                        <div className="text-neutral-800 font-medium">{b.tipo}</div>
                        <div className="text-2xs text-neutral-500">{b.estrategia}</div>
                      </td>

                      {/* Cuota */}
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-neutral-900 tabular-nums">
                        @{b.cuota.toFixed(2)}
                      </td>

                      {/* Stake */}
                      <td className="py-2.5 px-3 text-right font-mono text-neutral-800 tabular-nums">
                        {config.moneda} {b.stake.toFixed(2)}
                        <span className="block text-2xs text-neutral-400 font-mono">
                          {b.unidades}u ({b.riesgo})
                        </span>
                      </td>

                      {/* Ganancia Potencial */}
                      <td className="py-2.5 px-3 text-right font-mono text-neutral-600 tabular-nums">
                        {config.moneda} {b.gananciaPotencial.toFixed(2)}
                      </td>

                      {/* Resultado Desplegable */}
                      <td className="py-2.5 px-3 text-center">
                        {renderResultBadge(b.resultado, b.id)}
                      </td>

                      {/* Ganancia / Pérdida */}
                      <td className={`py-2.5 px-3 text-right font-mono font-bold tabular-nums ${
                        isWon ? 'text-emerald-600' : isLost ? 'text-rose-600' : 'text-neutral-500'
                      }`}>
                        {b.gananciaPerdida > 0 ? '+' : ''}
                        {config.moneda} {b.gananciaPerdida.toFixed(2)}
                      </td>

                      {/* ROI individual */}
                      <td className={`py-2.5 px-3 text-right font-mono font-medium tabular-nums ${
                        isWon ? 'text-emerald-600' : isLost ? 'text-rose-600' : 'text-neutral-400'
                      }`}>
                        {b.stake > 0 && !isPending
                          ? `${(b.roi * 100).toFixed(1)}%`
                          : '-'}
                      </td>

                      {/* Banco Después */}
                      <td className="py-2.5 px-3 text-right font-mono text-neutral-600 tabular-nums">
                        {config.moneda} {b.bancoDespues.toFixed(2)}
                      </td>

                      {/* Acciones */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditBet(b)}
                            className="p-1 text-neutral-400 hover:text-neutral-900 rounded hover:bg-neutral-100"
                            title="Editar apuesta"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDuplicateBet(b)}
                            className="p-1 text-neutral-400 hover:text-neutral-900 rounded hover:bg-neutral-100"
                            title="Duplicar apuesta"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteBet(b.id)}
                            className="p-1 text-neutral-400 hover:text-rose-600 rounded hover:bg-rose-50"
                            title="Eliminar apuesta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-neutral-500">
                    <p className="text-sm font-medium">No se encontraron apuestas con los filtros seleccionados.</p>
                    <button
                      onClick={onOpenNewBet}
                      className="mt-2 text-xs text-emerald-600 hover:underline font-semibold"
                    >
                      + Agregar una nueva apuesta
                    </button>
                  </td>
                </tr>
              )}
            </tbody>

            {/* Fila de Totales de la Selección */}
            {sortedBets.length > 0 && (
              <tfoot className="bg-neutral-100 border-t-2 border-neutral-300 font-semibold text-neutral-900">
                <tr>
                  <td colSpan={6} className="py-3 px-3 text-right uppercase tracking-wider text-2xs text-neutral-600">
                    Total Filas Mostradas ({summaryTotals.totalBets}):
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    @{summaryTotals.avgOdds} med.
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    {config.moneda} {summaryTotals.stakeTotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-3"></td>
                  <td className="py-3 px-3"></td>
                  <td className={`py-3 px-3 text-right font-mono font-bold tabular-nums ${
                    summaryTotals.profitTotal >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {summaryTotals.profitTotal >= 0 ? '+' : ''}
                    {config.moneda} {summaryTotals.profitTotal.toFixed(2)}
                  </td>
                  <td className={`py-3 px-3 text-right font-mono font-bold tabular-nums ${
                    summaryTotals.roi >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {summaryTotals.roi >= 0 ? '+' : ''}{summaryTotals.roi}%
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
