import React, { useState, useEffect } from 'react';
import { X, Save, Calculator } from 'lucide-react';
import { Bet, BetResult, AppConfig } from '../types/betting';
import { 
  getISOWeekString, 
  getDayOfWeekSpanish, 
  getMonthString, 
  calculateGananciaPerdida 
} from '../utils/calculations';

interface BetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bet: Bet) => void;
  initialBet?: Bet | null;
  config: AppConfig;
  currentBankroll: number;
}

export const BetModal: React.FC<BetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBet,
  config,
  currentBankroll,
}) => {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState('18:00');
  const [deporte, setDeporte] = useState(config.deportes[0] || 'Fútbol');
  const [competicion, setCompeticion] = useState('');
  const [evento, setEvento] = useState('');
  const [tipo, setTipo] = useState(config.tiposApuesta[0] || 'Simple');
  const [estrategia, setEstrategia] = useState(config.estrategias[0] || 'Value Betting');
  const [descripcion, setDescripcion] = useState('');
  const [cuota, setCuota] = useState('1.90');
  const [stake, setStake] = useState('20.00');
  const [unidades, setUnidades] = useState('2.0');
  const [riesgo, setRiesgo] = useState<'Bajo' | 'Medio' | 'Alto'>('Medio');
  const [resultado, setResultado] = useState<BetResult>('Pendiente');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (initialBet) {
      setFecha(initialBet.fecha);
      setHora(initialBet.hora || '18:00');
      setDeporte(initialBet.deporte);
      setCompeticion(initialBet.competicion);
      setEvento(initialBet.evento);
      setTipo(initialBet.tipo);
      setEstrategia(initialBet.estrategia);
      setDescripcion(initialBet.descripcion);
      setCuota(initialBet.cuota.toString());
      setStake(initialBet.stake.toString());
      setUnidades(initialBet.unidades.toString());
      setRiesgo(initialBet.riesgo);
      setResultado(initialBet.resultado);
      setNotas(initialBet.notas);
    } else {
      // Valor por defecto con recomendación de stake
      const defaultStake = ((currentBankroll * config.stakeRecomendadoPorc) / 100).toFixed(2);
      const defaultUnits = (parseFloat(defaultStake) / (config.valorUnidad || 10)).toFixed(1);
      setStake(defaultStake);
      setUnidades(defaultUnits);
      setFecha(new Date().toISOString().split('T')[0]);
      setResultado('Pendiente');
    }
  }, [initialBet, isOpen, currentBankroll, config]);

  if (!isOpen) return null;

  // Cálculos automáticos de previsualización
  const numCuota = parseFloat(cuota) || 1.0;
  const numStake = parseFloat(stake) || 0.0;
  const potentialProfit = Number((numStake * (numCuota - 1)).toFixed(2));
  const previewGP = calculateGananciaPerdida(resultado, numStake, numCuota);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { semana, ano } = getISOWeekString(fecha);
    const dia = getDayOfWeekSpanish(fecha);
    const mes = getMonthString(fecha);
    const numUnidades = parseFloat(unidades) || (config.valorUnidad ? numStake / config.valorUnidad : 1);
    const gp = calculateGananciaPerdida(resultado, numStake, numCuota);
    const roi = numStake > 0 ? Number((gp / numStake).toFixed(4)) : 0;

    const savedBet: Bet = {
      id: initialBet?.id || `AP-${Date.now().toString().slice(-4)}`,
      fecha,
      hora,
      semana,
      mes,
      ano,
      dia,
      deporte,
      competicion: competicion.trim() || 'General',
      evento: evento.trim() || 'Evento deportivo',
      tipo,
      estrategia,
      descripcion: descripcion.trim(),
      cuota: numCuota,
      stake: numStake,
      unidades: Number(numUnidades.toFixed(2)),
      riesgo,
      gananciaPotencial: potentialProfit,
      resultado,
      gananciaPerdida: gp,
      roi,
      bancoAntes: initialBet?.bancoAntes || currentBankroll,
      bancoDespues: initialBet?.bancoDespues || (currentBankroll + gp),
      notas: notas.trim(),
    };

    onSave(savedBet);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white border border-neutral-200 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              {initialBet ? 'Editar Apuesta' : 'Nueva Apuesta Manual'}
            </h2>
            <p className="text-2xs text-neutral-500">
              Registra fila por fila. Semana, mes, día y fórmulas se calculan automáticamente.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Fila 1: Fecha, Hora, Deporte */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-2 focus:ring-1 focus:ring-neutral-900"
              />
              <span className="text-2xs text-neutral-400 mt-0.5 block font-mono">
                {getDayOfWeekSpanish(fecha)} · {getISOWeekString(fecha).semana}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Hora
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-2 focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Deporte *
              </label>
              <select
                value={deporte}
                onChange={(e) => setDeporte(e.target.value)}
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-2 focus:ring-1 focus:ring-neutral-900"
              >
                {config.deportes.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 2: Competición y Evento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Competición / Liga *
              </label>
              <input
                type="text"
                placeholder="Ej. Champions League, NBA, Premier League"
                value={competicion}
                onChange={(e) => setCompeticion(e.target.value)}
                required
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-2 focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Evento / Partido *
              </label>
              <input
                type="text"
                placeholder="Ej. Real Madrid vs Manchester City"
                value={evento}
                onChange={(e) => setEvento(e.target.value)}
                required
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-2 focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Fila 3: Tipo de Apuesta y Estrategia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Tipo de Apuesta *
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-2 focus:ring-1 focus:ring-neutral-900"
              >
                {config.tiposApuesta.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Estrategia *
              </label>
              <select
                value={estrategia}
                onChange={(e) => setEstrategia(e.target.value)}
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-2 focus:ring-1 focus:ring-neutral-900"
              >
                {config.estrategias.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripción del Pronóstico */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Descripción del Pronóstico / Mercado
            </label>
            <input
              type="text"
              placeholder="Ej. Más de 2.5 goles + Ambos Marcan"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-2 focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          {/* Fila 4: Cuota, Stake, Unidades, Riesgo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-neutral-50 border border-neutral-100 rounded-md">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Cuota Decimal *
              </label>
              <input
                type="number"
                step="0.01"
                min="1.01"
                value={cuota}
                onChange={(e) => setCuota(e.target.value)}
                required
                className="w-full text-xs font-mono font-bold bg-white border border-neutral-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Stake ({config.moneda}) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                value={stake}
                onChange={(e) => {
                  setStake(e.target.value);
                  const st = parseFloat(e.target.value) || 0;
                  if (config.valorUnidad) {
                    setUnidades((st / config.valorUnidad).toFixed(2));
                  }
                }}
                required
                className="w-full text-xs font-mono font-bold bg-white border border-neutral-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Unidades (u)
              </label>
              <input
                type="number"
                step="0.1"
                value={unidades}
                onChange={(e) => setUnidades(e.target.value)}
                className="w-full text-xs font-mono bg-white border border-neutral-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Nivel Riesgo
              </label>
              <select
                value={riesgo}
                onChange={(e) => setRiesgo(e.target.value as any)}
                className="w-full text-xs bg-white border border-neutral-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-neutral-900"
              >
                <option value="Bajo">Bajo</option>
                <option value="Medio">Medio</option>
                <option value="Alto">Alto</option>
              </select>
            </div>
          </div>

          {/* Fila 5: Resultado & Previsualización Automática */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Estado del Resultado *
              </label>
              <select
                value={resultado}
                onChange={(e) => setResultado(e.target.value as BetResult)}
                className="w-full text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded px-3 py-2 text-neutral-900 focus:ring-1 focus:ring-neutral-900"
              >
                <option value="Pendiente">Pendiente (Aún no jugada)</option>
                <option value="Ganada">Ganada (Acierto)</option>
                <option value="Perdida">Perdida (Fallo)</option>
                <option value="Anulada">Anulada (Void / Push)</option>
              </select>
            </div>

            {/* Cálculo en vivo */}
            <div className="p-3 bg-neutral-100 rounded text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500">Ganancia Potencial:</span>
                <span className="font-mono font-medium">{config.moneda} {potentialProfit}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-neutral-700">Beneficio Neto Calculado:</span>
                <span className={`font-mono ${
                  previewGP > 0 ? 'text-emerald-600' : previewGP < 0 ? 'text-rose-600' : 'text-neutral-600'
                }`}>
                  {previewGP > 0 ? '+' : ''}{config.moneda} {previewGP}
                </span>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Notas / Justificación del Análisis
            </label>
            <textarea
              rows={2}
              placeholder="Razonamiento, alineaciones, bajas importantes o contexto..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded hover:bg-neutral-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded hover:bg-emerald-700 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{initialBet ? 'Guardar Cambios' : 'Registrar Apuesta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
