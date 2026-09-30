import React, { useState } from 'react';
import { Settings, Plus, Trash2, RotateCcw, Save, Check } from 'lucide-react';
import { AppConfig } from '../types/betting';

interface ConfigTabProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: Partial<AppConfig>) => void;
  onResetToDefaults: () => void;
}

export const ConfigTab: React.FC<ConfigTabProps> = ({
  config,
  onUpdateConfig,
  onResetToDefaults,
}) => {
  const [moneda, setMoneda] = useState(config.moneda);
  const [bankrollInicial, setBankrollInicial] = useState(config.bankrollInicial.toString());
  const [stakeRecomendadoPorc, setStakeRecomendadoPorc] = useState(config.stakeRecomendadoPorc.toString());
  const [valorUnidad, setValorUnidad] = useState(config.valorUnidad.toString());

  // Input temporal para nuevos elementos
  const [newSport, setNewSport] = useState('');
  const [newType, setNewType] = useState('');
  const [newStrategy, setNewStrategy] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      moneda,
      bankrollInicial: parseFloat(bankrollInicial) || 1000,
      stakeRecomendadoPorc: parseFloat(stakeRecomendadoPorc) || 2.0,
      valorUnidad: parseFloat(valorUnidad) || 10.0,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddSport = () => {
    if (!newSport.trim() || config.deportes.includes(newSport.trim())) return;
    onUpdateConfig({ deportes: [...config.deportes, newSport.trim()] });
    setNewSport('');
  };

  const handleDeleteSport = (sport: string) => {
    onUpdateConfig({ deportes: config.deportes.filter((s) => s !== sport) });
  };

  const handleAddType = () => {
    if (!newType.trim() || config.tiposApuesta.includes(newType.trim())) return;
    onUpdateConfig({ tiposApuesta: [...config.tiposApuesta, newType.trim()] });
    setNewType('');
  };

  const handleDeleteType = (type: string) => {
    onUpdateConfig({ tiposApuesta: config.tiposApuesta.filter((t) => t !== type) });
  };

  const handleAddStrategy = () => {
    if (!newStrategy.trim() || config.estrategias.includes(newStrategy.trim())) return;
    onUpdateConfig({ estrategias: [...config.estrategias, newStrategy.trim()] });
    setNewStrategy('');
  };

  const handleDeleteStrategy = (strategy: string) => {
    onUpdateConfig({ estrategias: config.estrategias.filter((s) => s !== strategy) });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Encabezado */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-100 rounded-md">
              <Settings className="w-5 h-5 text-neutral-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900">
                Pestaña de Configuración & Parámetros
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Define el Bankroll inicial, reglas de stake y las listas maestras de validación para menús desplegables.
              </p>
            </div>
          </div>

          <button
            onClick={onResetToDefaults}
            className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 rounded-md hover:bg-neutral-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Predeterminados</span>
          </button>
        </div>
      </div>

      {/* Formulario de Parámetros Globales */}
      <form onSubmit={handleSaveGeneral} className="bg-white border border-neutral-200 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-2">
          1. Parámetros de Bankroll & Unidades
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Moneda Principal
            </label>
            <input
              type="text"
              value={moneda}
              onChange={(e) => setMoneda(e.target.value)}
              className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              placeholder="€, $, ARS, etc."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Bankroll Inicial
            </label>
            <input
              type="number"
              step="10"
              value={bankrollInicial}
              onChange={(e) => setBankrollInicial(e.target.value)}
              className="w-full text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              % Stake Recomendado
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                value={stakeRecomendadoPorc}
                onChange={(e) => setStakeRecomendadoPorc(e.target.value)}
                className="w-full text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                required
              />
              <span className="absolute right-3 top-2 text-xs text-neutral-400">%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Valor de 1 Unidad (Base)
            </label>
            <input
              type="number"
              step="1"
              value={valorUnidad}
              onChange={(e) => setValorUnidad(e.target.value)}
              className="w-full text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-md px-3 py-2 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              required
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Guardado Exitoso' : 'Actualizar Parámetros'}</span>
          </button>
        </div>
      </form>

      {/* Listas Maestras de Validación (Data Validation) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Deportes */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-neutral-900">Lista: Deportes</h2>
            <span className="text-2xs text-neutral-400">{config.deportes.length} opciones</span>
          </div>
          <p className="text-2xs text-neutral-500 mb-3">
            Para el menú desplegable en columna "Deporte".
          </p>

          <div className="flex gap-1.5 mb-3">
            <input
              type="text"
              placeholder="Nuevo deporte..."
              value={newSport}
              onChange={(e) => setNewSport(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSport())}
              className="flex-1 text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
            <button
              type="button"
              onClick={handleAddSport}
              className="p-1.5 bg-neutral-900 text-white rounded hover:bg-neutral-800"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-neutral-50">
            {config.deportes.map((s) => (
              <div key={s} className="flex items-center justify-between text-xs py-1.5 px-1">
                <span className="text-neutral-700">{s}</span>
                <button
                  onClick={() => handleDeleteSport(s)}
                  className="text-neutral-400 hover:text-rose-600 p-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tipos de Apuesta */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-neutral-900">Lista: Tipos de Apuesta</h2>
            <span className="text-2xs text-neutral-400">{config.tiposApuesta.length} opciones</span>
          </div>
          <p className="text-2xs text-neutral-500 mb-3">
            Para el menú desplegable en columna "Tipo de apuesta".
          </p>

          <div className="flex gap-1.5 mb-3">
            <input
              type="text"
              placeholder="Nuevo tipo..."
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddType())}
              className="flex-1 text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
            <button
              type="button"
              onClick={handleAddType}
              className="p-1.5 bg-neutral-900 text-white rounded hover:bg-neutral-800"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-neutral-50">
            {config.tiposApuesta.map((t) => (
              <div key={t} className="flex items-center justify-between text-xs py-1.5 px-1">
                <span className="text-neutral-700">{t}</span>
                <button
                  onClick={() => handleDeleteType(t)}
                  className="text-neutral-400 hover:text-rose-600 p-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Estrategias */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-neutral-900">Lista: Estrategias</h2>
            <span className="text-2xs text-neutral-400">{config.estrategias.length} opciones</span>
          </div>
          <p className="text-2xs text-neutral-500 mb-3">
            Para el menú desplegable en columna "Estrategia".
          </p>

          <div className="flex gap-1.5 mb-3">
            <input
              type="text"
              placeholder="Nueva estrategia..."
              value={newStrategy}
              onChange={(e) => setNewStrategy(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStrategy())}
              className="flex-1 text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
            <button
              type="button"
              onClick={handleAddStrategy}
              className="p-1.5 bg-neutral-900 text-white rounded hover:bg-neutral-800"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-neutral-50">
            {config.estrategias.map((st) => (
              <div key={st} className="flex items-center justify-between text-xs py-1.5 px-1">
                <span className="text-neutral-700 truncate max-w-[200px]" title={st}>{st}</span>
                <button
                  onClick={() => handleDeleteStrategy(st)}
                  className="text-neutral-400 hover:text-rose-600 p-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
