/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Bet, BetResult, AppConfig } from './types/betting';
import { 
  DEFAULT_CONFIG, 
  SAMPLE_INITIAL_BETS, 
  recalculateBankrollChain, 
  generateWeeklySummaries, 
  generateMonthlySummaries, 
  calculateKPIs 
} from './utils/calculations';
import { exportToExcel } from './utils/excelExport';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { BetsTab } from './components/BetsTab';
import { WeeklySummaryTab } from './components/WeeklySummaryTab';
import { MonthlySummaryTab } from './components/MonthlySummaryTab';
import { ConfigTab } from './components/ConfigTab';
import { FormulaGuideTab } from './components/FormulaGuideTab';
import { BetModal } from './components/BetModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';

export default function App() {
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('bet_tracker_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  const [bets, setBets] = useState<Bet[]>(() => {
    const saved = localStorage.getItem('bet_tracker_bets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return recalculateBankrollChain(parsed, config.bankrollInicial);
        }
      } catch (e) {
        // fallback
      }
    }
    return recalculateBankrollChain(SAMPLE_INITIAL_BETS, config.bankrollInicial);
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);
  const [editingBet, setEditingBet] = useState<Bet | null>(null);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem('bet_tracker_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('bet_tracker_bets', JSON.stringify(bets));
  }, [bets]);

  // Recalcular banco cuando cambia el bankroll inicial
  const handleUpdateConfig = (newCfg: Partial<AppConfig>) => {
    const updated = { ...config, ...newCfg };
    setConfig(updated);
    if (newCfg.bankrollInicial !== undefined && newCfg.bankrollInicial !== config.bankrollInicial) {
      setBets((prev) => recalculateBankrollChain(prev, newCfg.bankrollInicial!));
    }
  };

  const handleResetToDefaults = () => {
    const confirmed = window.confirm(
      '¿Deseas restaurar la configuración y recargar los 5 ejemplos ficticios de apuestas iniciales?'
    );
    if (!confirmed) return;
    setConfig(DEFAULT_CONFIG);
    setBets(recalculateBankrollChain(SAMPLE_INITIAL_BETS, DEFAULT_CONFIG.bankrollInicial));
    localStorage.removeItem('bet_tracker_config');
    localStorage.removeItem('bet_tracker_bets');
  };

  // Agregar o Editar apuesta
  const handleSaveBet = (bet: Bet) => {
    let updated: Bet[];
    const exists = bets.some((b) => b.id === bet.id);
    if (exists) {
      updated = bets.map((b) => (b.id === bet.id ? bet : b));
    } else {
      updated = [...bets, bet];
    }
    // Ordenar cronológicamente y recalcular la cadena del bankroll
    updated.sort((a, b) => a.fecha.localeCompare(b.fecha));
    setBets(recalculateBankrollChain(updated, config.bankrollInicial));
  };

  const handleDeleteBet = (id: string) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar esta apuesta?');
    if (!confirmed) return;
    const remaining = bets.filter((b) => b.id !== id);
    setBets(recalculateBankrollChain(remaining, config.bankrollInicial));
  };

  const handleDuplicateBet = (bet: Bet) => {
    const duplicated: Bet = {
      ...bet,
      id: `AP-${Date.now().toString().slice(-4)}`,
      resultado: 'Pendiente',
      gananciaPerdida: 0,
      roi: 0,
    };
    const updated = [...bets, duplicated];
    setBets(recalculateBankrollChain(updated, config.bankrollInicial));
  };

  const handleUpdateResult = (id: string, newResult: BetResult) => {
    const updated = bets.map((b) => {
      if (b.id === id) {
        return { ...b, resultado: newResult };
      }
      return b;
    });
    setBets(recalculateBankrollChain(updated, config.bankrollInicial));
  };

  const handleOpenNewBet = () => {
    setEditingBet(null);
    setIsBetModalOpen(true);
  };

  const handleEditBet = (bet: Bet) => {
    setEditingBet(bet);
    setIsBetModalOpen(true);
  };

  // Métricas y resúmenes
  const kpis = useMemo(() => {
    return calculateKPIs(bets, config.bankrollInicial);
  }, [bets, config.bankrollInicial]);

  const weeklyData = useMemo(() => {
    return generateWeeklySummaries(bets);
  }, [bets]);

  const monthlyData = useMemo(() => {
    return generateMonthlySummaries(bets);
  }, [bets]);

  const handleExportExcel = () => {
    exportToExcel(bets, config, weeklyData, monthlyData, kpis);
  };

  return (
    <div className="min-h-screen bg-neutral-100/60 text-neutral-900 font-sans flex flex-col">
      {/* Barra de navegación superior (Top Bar Contract) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewBet={handleOpenNewBet}
        onExportExcel={handleExportExcel}
        onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
        config={config}
        onUpdateConfig={handleUpdateConfig}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            bets={bets}
            config={config}
            onNavigateToTab={setActiveTab}
            onOpenNewBet={handleOpenNewBet}
          />
        )}

        {activeTab === 'apuestas' && (
          <BetsTab
            bets={bets}
            config={config}
            onOpenNewBet={handleOpenNewBet}
            onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
            onEditBet={handleEditBet}
            onDeleteBet={handleDeleteBet}
            onDuplicateBet={handleDuplicateBet}
            onUpdateResult={handleUpdateResult}
          />
        )}

        {activeTab === 'semanal' && (
          <WeeklySummaryTab
            weeklyData={weeklyData}
            config={config}
          />
        )}

        {activeTab === 'mensual' && (
          <MonthlySummaryTab
            monthlyData={monthlyData}
            config={config}
          />
        )}

        {activeTab === 'guia' && (
          <FormulaGuideTab
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onExportExcel={handleExportExcel}
            onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
          />
        )}

        {activeTab === 'configuracion' && (
          <ConfigTab
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onResetToDefaults={handleResetToDefaults}
          />
        )}
      </main>

      {/* Modal para Agregar/Editar Apuesta */}
      <BetModal
        isOpen={isBetModalOpen}
        onClose={() => setIsBetModalOpen(false)}
        onSave={handleSaveBet}
        initialBet={editingBet}
        config={config}
        currentBankroll={kpis.bankrollActual}
      />

      {/* Modal para Sincronización y Exportación a Google Sheets */}
      <GoogleSheetsModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        bets={bets}
        config={config}
      />
    </div>
  );
}
