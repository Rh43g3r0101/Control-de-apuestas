import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  FileSpreadsheet, 
  Loader2, 
  LogOut,
  FolderOpen
} from 'lucide-react';
import { googleSignIn, googleLogout, initAuth, getAccessToken, GoogleUser } from '../services/googleAuth';
import { 
  createGoogleBettingSpreadsheet, 
  listGoogleSpreadsheets, 
  GoogleDriveFile 
} from '../services/googleSheets';
import { Bet, AppConfig } from '../types/betting';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bets: Bet[];
  config: AppConfig;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  bets,
  config,
}) => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessUrl, setExportSuccessUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recentSpreadsheets, setRecentSpreadsheets] = useState<GoogleDriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [customTitle, setCustomTitle] = useState('Control de Apuestas Deportivas - BetAnalytics Pro');

  // Inicializar listener de Firebase Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        setIsLoadingAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setIsLoadingAuth(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Cargar hojas recientes si está autenticado
  const fetchRecentSpreadsheets = async () => {
    try {
      setIsLoadingFiles(true);
      setErrorMsg(null);
      const files = await listGoogleSpreadsheets();
      setRecentSpreadsheets(files);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'No se pudieron cargar los archivos de Google Drive');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (user && token && isOpen) {
      fetchRecentSpreadsheets();
    }
  }, [user, token, isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        fetchRecentSpreadsheets();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con la cuenta de Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleLogout();
    setUser(null);
    setToken(null);
    setRecentSpreadsheets([]);
    setExportSuccessUrl(null);
  };

  // Creación y exportación con confirmación explícita (Mandatory per Skill guidelines)
  const handleExportToSheets = async () => {
    const confirmed = window.confirm(
      `¿Deseas crear la hoja "${customTitle}" en tu Google Drive con las 5 pestañas (Configuración, Apuestas, Resumen Semanal, Resumen Mensual, Dashboard) y fórmulas nativas?`
    );
    if (!confirmed) return;

    setIsExporting(true);
    setErrorMsg(null);
    setExportSuccessUrl(null);

    try {
      const result = await createGoogleBettingSpreadsheet(customTitle, bets, config);
      setExportSuccessUrl(result.spreadsheetUrl);
      fetchRecentSpreadsheets();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al exportar a Google Sheets');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white border border-neutral-200 rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Sincronización con Google Sheets
              </h2>
              <p className="text-2xs text-neutral-500">
                Conecta tu cuenta de Google Drive para crear y actualizar hojas de cálculo reales.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-md hover:bg-neutral-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Mensajes de error */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Estado de Autenticación */}
          {!user ? (
            <div className="py-6 text-center space-y-4">
              <div className="max-w-sm mx-auto space-y-2">
                <p className="text-xs text-neutral-600">
                  Inicia sesión con tu cuenta de Google para exportar directamente tu plantilla de control de apuestas a Google Drive y Google Sheets con permiso para acceder y guardar hojas.
                </p>
              </div>

              {/* Botón oficial Sign in with Google */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-neutral-300 rounded-md shadow-xs hover:bg-neutral-50 hover:border-neutral-400 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span className="text-xs font-semibold text-neutral-700">
                    {isSigningIn ? 'Conectando con Google...' : 'Iniciar sesión con Google'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Usuario conectado */}
              <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google User'}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.displayName?.[0] || user.email?.[0] || 'G'}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-semibold text-neutral-900">
                      {user.displayName || 'Usuario de Google'}
                    </div>
                    <div className="text-2xs text-neutral-500">{user.email}</div>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-2xs text-neutral-500 hover:text-rose-600 px-2.5 py-1 rounded hover:bg-neutral-100 transition-colors"
                  title="Cerrar sesión de Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </button>
              </div>

              {/* Acción 1: Crear y Exportar Hoja Nueva */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950">
                    Exportar Plantilla a Google Sheets
                  </span>
                  <span className="text-2xs text-emerald-700 font-mono">
                    5 pestañas automatizadas
                  </span>
                </div>

                <div>
                  <label className="block text-2xs font-medium text-neutral-700 mb-1">
                    Nombre del archivo en Google Drive:
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-2xs text-neutral-500">
                    Incluye fórmulas activas (`SUMIF`, `COUNTIFS`, `USER_ENTERED`).
                  </div>
                  <button
                    onClick={handleExportToSheets}
                    disabled={isExporting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-xs disabled:opacity-50"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Creando en Drive...</span>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Crear Hoja en Google Drive</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Enlace si se completó la creación */}
                {exportSuccessUrl && (
                  <div className="p-3 bg-white border border-emerald-300 rounded-md flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>¡Hoja creada con éxito en tu Google Drive!</span>
                    </div>
                    <a
                      href={exportSuccessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      <span>Abrir en Google Sheets</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Acción 2: Ver Hojas Recientes en Google Drive */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-800">
                  <span className="flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4 text-neutral-500" />
                    <span>Tus Hojas de Cálculo Recientes en Drive</span>
                  </span>
                  <button
                    onClick={fetchRecentSpreadsheets}
                    disabled={isLoadingFiles}
                    className="text-2xs text-emerald-700 hover:underline"
                  >
                    {isLoadingFiles ? 'Actualizando...' : 'Refrescar'}
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto border border-neutral-200 rounded-lg divide-y divide-neutral-100 bg-neutral-50/50">
                  {recentSpreadsheets.length > 0 ? (
                    recentSpreadsheets.map((f) => (
                      <div
                        key={f.id}
                        className="p-2.5 flex items-center justify-between hover:bg-white text-xs transition-colors"
                      >
                        <div className="truncate pr-3">
                          <div className="font-medium text-neutral-800 truncate" title={f.name}>
                            {f.name}
                          </div>
                          {f.modifiedTime && (
                            <div className="text-2xs text-neutral-400">
                              Modificado: {new Date(f.modifiedTime).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        {f.webViewLink && (
                          <a
                            href={f.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-neutral-400 hover:text-emerald-700"
                            title="Abrir en Google Sheets"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-neutral-400 text-xs">
                      {isLoadingFiles
                        ? 'Consultando Google Drive...'
                        : 'No se encontraron hojas de cálculo recientes.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded hover:bg-neutral-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
