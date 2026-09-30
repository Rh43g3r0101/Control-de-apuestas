import React from 'react';
import { Download, Plus, FileSpreadsheet } from 'lucide-react';
import { AppConfig } from '../types/betting';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewBet: () => void;
  onExportExcel: () => void;
  onOpenGoogleSheets: () => void;
  config: AppConfig;
  onUpdateConfig: (cfg: Partial<AppConfig>) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewBet,
  onExportExcel,
  onOpenGoogleSheets,
  config,
  onUpdateConfig,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'apuestas', label: 'Apuestas (Libro)' },
    { id: 'semanal', label: 'Resumen Semanal' },
    { id: 'mensual', label: 'Resumen Mensual' },
    { id: 'guia', label: 'Guía & Fórmulas' },
    { id: 'configuracion', label: 'Configuración' },
  ];

  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-lg font-bold tracking-tight text-neutral-900 hover:text-neutral-700 transition-colors text-left"
          >
            BetAnalytics Pro
          </button>
          <span className="hidden sm:inline-block text-xs font-mono px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded">
            {config.moneda} · Bank: {config.bankrollInicial.toLocaleString()}
          </span>
        </div>

        {/* Zone 2: Nav links with single-line controls */}
        <nav className="hidden lg:flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Selector de moneda rápido */}
          <select
            value={config.moneda}
            onChange={(e) => onUpdateConfig({ moneda: e.target.value })}
            className="text-xs font-medium bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1.5 text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            title="Seleccionar divisa"
          >
            <option value="€">EUR (€)</option>
            <option value="$">USD ($)</option>
            <option value="ARS">ARS ($)</option>
            <option value="MXN">MXN ($)</option>
            <option value="CLP">CLP ($)</option>
            <option value="COP">COP ($)</option>
            <option value="£">GBP (£)</option>
          </select>

          <button
            onClick={onOpenGoogleSheets}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors whitespace-nowrap"
            title="Conectar y sincronizar con Google Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Google Sheets</span>
          </button>

          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors whitespace-nowrap"
            title="Descargar libro de cálculo en Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Descargar Excel</span>
          </button>

          <button
            onClick={onOpenNewBet}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors whitespace-nowrap shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Apuesta</span>
          </button>
        </div>
      </div>

      {/* Mobile subnav */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-neutral-100 bg-neutral-50 text-xs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
